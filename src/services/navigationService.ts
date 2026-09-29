import { NavigationRoute, NavigationStep, ParkingBay } from '../types';

export interface EntranceLocation {
  name: string;
  x: number; // Percentage coordinate (0 - 100)
  y: number;
  level: number;
  description: string;
}

export const FACILITY_ENTRANCES: Record<string, EntranceLocation> = {
  'Main Entrance (North)': {
    name: 'Main Entrance (North)',
    x: 12.0,
    y: 4.0,
    level: 1,
    description: 'Main Campus Boulevard Ingress Gate 1',
  },
  'East Walkway': {
    name: 'East Walkway',
    x: 94.0,
    y: 35.0,
    level: 1,
    description: 'Science Quad Pedestrian & Vehicle Portal',
  },
  'South Ramp': {
    name: 'South Ramp',
    x: 20.0,
    y: 92.0,
    level: 1,
    description: 'South Commuter Ring Road & Transit Ramp',
  },
  'West Transit Center': {
    name: 'West Transit Center',
    x: 6.0,
    y: 60.0,
    level: 1,
    description: 'Athletics & Express Bus Loop Concourse',
  },
};

/**
 * Calculates a 2D floorplan navigation route from a facility entrance to a target parking bay.
 * Generates coordinate waypoints suitable for SVG polyline rendering and human-readable turn-by-turn instructions.
 */
export function generateNavigationRoute(
  bay: ParkingBay,
  entranceName: string = 'Main Entrance (North)'
): NavigationRoute {
  const entrance = FACILITY_ENTRANCES[entranceName] || FACILITY_ENTRANCES['Main Entrance (North)'];
  const waypoints: Array<{ x: number; y: number; label?: string }> = [];
  const steps: NavigationStep[] = [];

  // Start at Entrance
  waypoints.push({ x: entrance.x, y: entrance.y, label: entrance.name });
  steps.push({
    stepNumber: 1,
    instruction: `Enter via ${entrance.name}. Speed limit: 15 km/h. Head toward central circulation corridor.`,
    distanceMeters: 10,
    checkpoint: entrance.name,
  });

  // Intermediate Waypoint 1: Main driving aisle
  const mainAisleY = bay.level === 1 ? (bay.row <= 'B' ? 20.0 : 62.0) : (bay.row === 'E' ? 22.0 : 64.0);
  const mainAisleX = bay.x;

  if (bay.level > entrance.level) {
    // Requires ramp to Level 2
    waypoints.push({ x: 88.0, y: 12.0, label: 'Ascending Ramp to L2' });
    steps.push({
      stepNumber: 2,
      instruction: `Follow signs toward Upper Deck ramp (East corridor). Ascend to Level 2.`,
      distanceMeters: 35,
      checkpoint: 'Level 2 Ramp',
    });
    waypoints.push({ x: 88.0, y: 22.0, label: 'Level 2 Upper Deck Ingress' });
  }

  // Waypoint 2: Row entrance turning point
  waypoints.push({ x: mainAisleX, y: mainAisleY, label: `Row ${bay.row} Circulation Aisle` });
  steps.push({
    stepNumber: steps.length + 1,
    instruction: `Turn into Row ${bay.row} (${bay.section}). Look for overhead bay marker ${bay.id}.`,
    distanceMeters: Math.round(Math.abs(bay.x - entrance.x) * 1.2),
    checkpoint: `Row ${bay.row} Ingress`,
  });

  // Final Waypoint: Bay destination slot center
  const bayCenterX = +(bay.x + bay.width / 2).toFixed(1);
  const bayCenterY = +(bay.y + bay.height / 2).toFixed(1);
  waypoints.push({ x: bayCenterX, y: bayCenterY, label: `Bay ${bay.id}` });
  steps.push({
    stepNumber: steps.length + 1,
    instruction: `Arrive at Bay ${bay.id} on your ${bay.y > mainAisleY ? 'right' : 'left'}. ${
      bay.type === 'ev' ? 'Plug into Level 2 EV charging port.' : bay.type === 'accessible' ? 'Designated ADA accessible parking.' : 'Pull in straight.'
    }`,
    distanceMeters: Math.round(Math.abs(bay.y - mainAisleY) * 1.5) + 5,
    checkpoint: `Bay ${bay.id}`,
  });

  const totalDist = bay.distanceToEntranceMeters || 45;
  const walkingMin = +(totalDist / 65).toFixed(1);

  return {
    entrance: entrance.name,
    destinationBayId: bay.id,
    totalDistanceMeters: totalDist,
    estimatedWalkingMinutes: Math.max(0.5, walkingMin),
    steps,
    waypoints,
  };
}
