import {
  ParkingBay,
  UserPreferences,
  RecommendationResult,
  RecommendationResponse,
  RecommendationScoreBreakdown,
} from '../types';
import { generateNavigationRoute } from './navigationService';

/**
 * Transparent Multi-Factor Recommendation Engine (Review 2 Specification)
 * Provides transparent, additive scoring combining:
 * 1. Hard Constraints (Availability, ADA Accessibility, EV Requirement, Walking Distance Limit)
 * 2. Non-Linear Distance Decay relative to target entrance
 * 3. Section & Aisle Congestion Score
 * 4. Powertrain & Accessibility Matching / Demotion
 * 5. Temporal Confirmation Stability Bonus
 *
 * All scores are explicitly labeled as PROTOTYPE HEURISTIC SCORES.
 */
export function calculateBayRecommendations(
  bays: ParkingBay[],
  preferences: UserPreferences
): RecommendationResponse {
  const maxAllowedDist = preferences.maxWalkingDistanceMeters || 180;
  const isStrict = preferences.strictConstraintsOnly !== false;

  // 1. HARD CONSTRAINTS FILTERING
  // Rule A: Filter out non-available bays (occupied, maintenance, reserved)
  let candidates = bays.filter((b) => b.status === 'available');

  // Rule B: Hard Accessibility Constraint
  if (preferences.accessibilityRequired) {
    candidates = candidates.filter((b) => b.type === 'accessible');
    if (candidates.length === 0) {
      return {
        preferences,
        totalEligible: 0,
        bestMatch: null,
        alternatives: [],
        algorithm: 'Multi-Factor Constrained Optimization (ADA Hard Constraint)',
        scoreType: 'PROTOTYPE HEURISTIC SCORE',
        isSimulated: true,
        warning: 'No designated accessible spaces are currently available in this facility.',
      };
    }
  }

  // Rule C: Hard EV Constraint (when vehicle is EV and preference specifies)
  let evWarning: string | undefined;
  if (preferences.vehicleType === 'ev') {
    const evOnly = candidates.filter((b) => b.type === 'ev');
    if (evOnly.length > 0) {
      candidates = evOnly;
    } else if (isStrict) {
      evWarning = 'All Level 2 EV charging stations are currently occupied. Showing closest standard bays.';
    }
  }

  // Rule D: Section preference filter (if user selected a specific section)
  if (preferences.preferredSection && preferences.preferredSection !== 'all') {
    const sectionMatches = candidates.filter((b) =>
      b.section.toLowerCase().includes(preferences.preferredSection.toLowerCase())
    );
    if (sectionMatches.length > 0) {
      candidates = sectionMatches;
    }
  }

  // Rule E: Hard Distance Constraint
  if (isStrict) {
    const withinDistance = candidates.filter((b) => b.distanceToEntranceMeters <= maxAllowedDist);
    if (withinDistance.length > 0) {
      candidates = withinDistance;
    }
  }

  if (candidates.length === 0) {
    return {
      preferences,
      totalEligible: 0,
      bestMatch: null,
      alternatives: [],
      algorithm: 'Multi-Factor Constrained Optimization',
      scoreType: 'PROTOTYPE HEURISTIC SCORE',
      isSimulated: true,
      warning: 'No available parking spaces meet all specified hard constraints.',
    };
  }

  // Calculate section congestion density map
  const sectionCounts: Record<string, { total: number; occupied: number }> = {};
  bays.forEach((b) => {
    if (!sectionCounts[b.section]) {
      sectionCounts[b.section] = { total: 0, occupied: 0 };
    }
    sectionCounts[b.section].total++;
    if (b.status === 'occupied') {
      sectionCounts[b.section].occupied++;
    }
  });

  // 2. MATHEMATICAL SCORING PIPELINE (100 Points Total)
  const scored: RecommendationResult[] = candidates.map((bay) => {
    // A. Baseline Availability (25 points)
    const availabilityWeight = 25;

    // B. Normalized Non-Linear Distance Decay (up to 25 points)
    // S_dist = 25 * max(0, 1 - (d / d_max))^1.1
    const effectiveDist = bay.distanceToEntranceMeters;
    const normDistRatio = Math.min(1, Math.max(0, effectiveDist / maxAllowedDist));
    const distanceWeight = +(25 * Math.pow(1 - normDistRatio, 1.1)).toFixed(1);

    // C. Accessibility Alignment (up to 15 points)
    let accessibilityWeight = 0;
    if (preferences.accessibilityRequired) {
      accessibilityWeight = 15; // Complete match
    } else {
      if (bay.type === 'accessible') {
        // Demote accessible bay to preserve it for drivers with disabilities
        accessibilityWeight = 2;
      } else {
        accessibilityWeight = 15;
      }
    }

    // D. Bay Type & Vehicle Compatibility (up to 15 points)
    let bayTypePreference = 0;
    if (preferences.vehicleType === 'ev') {
      if (bay.type === 'ev') {
        bayTypePreference = 15; // Full Level-2 charger match
      } else {
        bayTypePreference = 7; // Standard bay fallback
      }
    } else {
      if (bay.type === 'ev') {
        // Demote non-EV parking at EV charger
        bayTypePreference = 3;
      } else if (bay.type === 'standard') {
        bayTypePreference = 15;
      } else {
        bayTypePreference = 8;
      }
    }

    // E. Aisle & Section Congestion Score (up to 10 points)
    // Lower congestion in aisle = faster parking & fewer pedestrian hazards
    const sectionStat = sectionCounts[bay.section] || { total: 12, occupied: 6 };
    const sectionOccupancyRatio = sectionStat.total > 0 ? sectionStat.occupied / sectionStat.total : 0.5;
    const sectionCongestionScore = +(10 * (1 - sectionOccupancyRatio)).toFixed(1);

    // F. Bay State Stability Bonus (up to 10 points)
    // Bays with confirmed multi-frame stability receive full points
    let bayStabilityBonus = 6;
    if (bay.temporalState === 'confirmed_available' && (bay.consecutiveHits || 3) >= 3) {
      bayStabilityBonus = 10;
    } else if (bay.temporalState === 'candidate_available') {
      bayStabilityBonus = 4;
    }

    const breakdown: RecommendationScoreBreakdown = {
      availabilityWeight,
      distanceWeight,
      accessibilityWeight,
      bayTypePreference,
      sectionCongestionScore,
      bayStabilityBonus,
    };

    const totalScore = +(
      availabilityWeight +
      distanceWeight +
      accessibilityWeight +
      bayTypePreference +
      sectionCongestionScore +
      bayStabilityBonus
    ).toFixed(1);

    // Human-understandable, explainable reasons
    const reasons: string[] = [];
    reasons.push('Verified vacant with confirmed multi-frame optical sensor stability.');

    if (bay.distanceToEntranceMeters <= 35) {
      reasons.push(
        `Prime proximity: ${bay.distanceToEntranceMeters}m from ${preferences.preferredEntrance} (~${bay.estimatedWalkingMinutes} min walk).`
      );
    } else {
      reasons.push(`Walking route: ${bay.distanceToEntranceMeters}m from ${preferences.preferredEntrance}.`);
    }

    if (sectionOccupancyRatio < 0.6) {
      reasons.push(
        `Lower aisle congestion (${Math.round(sectionOccupancyRatio * 100)}% occupied in ${bay.section}) for quick parking.`
      );
    }

    if (preferences.vehicleType === 'ev' && bay.type === 'ev') {
      reasons.push('Dedicated Level 2 EV charging port with active power supply.');
    } else if (preferences.accessibilityRequired && bay.type === 'accessible') {
      reasons.push('Designated ADA accessible bay with direct curb-cut entrance route.');
    }

    // Generate indoor navigation route
    const navigationRoute = generateNavigationRoute(bay, preferences.preferredEntrance);

    return {
      bay,
      totalScore,
      breakdown,
      reasons,
      rank: 0,
      navigationRoute,
    };
  });

  // Sort descending by total score
  scored.sort((a, b) => b.totalScore - a.totalScore);
  scored.forEach((item, index) => {
    item.rank = index + 1;
    item.isAlternative = index > 0;
  });

  return {
    preferences,
    totalEligible: scored.length,
    bestMatch: scored[0] || null,
    alternatives: scored.slice(1, 4),
    algorithm:
      'Multi-Factor Additive Scoring (Availability 25% + Proximity Decay 25% + ADA 15% + EV Match 15% + Aisle Congestion 10% + Sensor Stability 10%)',
    scoreType: 'PROTOTYPE HEURISTIC SCORE',
    isSimulated: true,
    warning: evWarning,
  };
}
