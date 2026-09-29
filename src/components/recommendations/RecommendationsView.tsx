import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Accessibility,
  Sliders,
  ArrowRight,
  Info,
  Car,
  CheckCircle2,
  AlertTriangle,
  Scale,
  ThumbsUp,
  ThumbsDown,
  Navigation,
  Footprints,
  Compass,
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';
import { ParkingBay } from '../../types';

interface RecommendationsViewProps {
  onSelectBay: (bay: ParkingBay) => void;
  onNavigate: (route: string) => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  onSelectBay,
  onNavigate,
}) => {
  const {
    preferences,
    updatePreferences,
    recommendations,
    setNavigationTarget,
    submitRecFeedback,
    recFeedbackStats,
  } = useParking();

  const [showFormulaDetails, setShowFormulaDetails] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean>>({});
  const [feedbackComment, setFeedbackComment] = useState('');
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);

  const bestMatch = recommendations?.bestMatch;
  const alternatives = recommendations?.alternatives || [];

  const handleSelectAndNavigate = (bay: ParkingBay) => {
    onSelectBay(bay);
    setNavigationTarget(bay);
    onNavigate('navigation');
  };

  const handleFeedback = async (bayId: string, accepted: boolean) => {
    await submitRecFeedback(bayId, accepted, rating, feedbackComment);
    setFeedbackGiven((prev) => ({ ...prev, [bayId]: true }));
    setFeedbackComment('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Explainable Parking Recommendation Engine
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700 font-mono">
              PROTOTYPE HEURISTIC SCORE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Transparently scores and ranks vacant parking bays based on walking distance, dedicated EV chargers, strict ADA accessibility, and entrance proximity.
          </p>
        </div>

        <button
          onClick={() => setShowFormulaDetails(!showFormulaDetails)}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Info className="w-3.5 h-3.5" />
          <span>{showFormulaDetails ? 'Hide Weights' : 'Inspect Scoring Weights'}</span>
        </button>
      </div>

      {/* Driver Preferences & Constraints Controls */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Driver Routing Preferences &amp; Hard Constraints</span>
          </div>
          <span className="text-[11px] text-slate-400">Strict constraints filter out incompatible bays</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Vehicle Type */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium block">Vehicle Powertrain</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updatePreferences({ vehicleType: 'normal' })}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-medium transition-all ${
                  preferences.vehicleType === 'normal'
                    ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Standard</span>
              </button>
              <button
                type="button"
                onClick={() => updatePreferences({ vehicleType: 'ev' })}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-medium transition-all ${
                  preferences.vehicleType === 'ev'
                    ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-cyan-300" />
                <span>EV Charging</span>
              </button>
            </div>
          </div>

          {/* Strict Accessibility Constraint */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium block">ADA Accessibility</label>
            <button
              type="button"
              onClick={() => updatePreferences({ accessibilityRequired: !preferences.accessibilityRequired })}
              className={`w-full py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${
                preferences.accessibilityRequired
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Accessibility className="w-4 h-4 text-indigo-300" />
              <span>
                {preferences.accessibilityRequired ? 'Strict ADA Bay Required' : 'Standard Driver (Preserve ADA)'}
              </span>
            </button>
          </div>

          {/* Target Entrance */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium block">Target Deck Entrance</label>
            <select
              value={preferences.preferredEntrance}
              onChange={(e) => updatePreferences({ preferredEntrance: e.target.value })}
              className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-cyan-500"
            >
              <option value="Main Entrance (North)">Main Entrance (North Gate)</option>
              <option value="East Walkway">East Walkway (Science Quad)</option>
              <option value="South Ramp">South Ramp (Commuter Portal)</option>
              <option value="West Transit Center">West Transit Center</option>
            </select>
          </div>

          {/* Preferred Section */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium block">Preferred Deck Section</label>
            <select
              value={preferences.preferredSection}
              onChange={(e) => updatePreferences({ preferredSection: e.target.value })}
              className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Any Deck Section</option>
              <option value="North Deck">North Deck (Level 1)</option>
              <option value="South Wing">South Wing (Level 1)</option>
              <option value="East Courtyard">East Courtyard (Level 2)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Warning if no compatible spaces exist */}
      {recommendations?.warning && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/60 text-amber-200 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm text-amber-300">Compatibility Alert</span>
            <p className="mt-0.5">{recommendations.warning}</p>
          </div>
        </div>
      )}

      {/* Transparent Scoring Formula Breakdown */}
      {showFormulaDetails && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-cyan-800/40 space-y-3 text-xs">
          <div className="font-bold text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <span>Transparent 100-Point Scoring Breakdown</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">MAX 100 PROTOTYPE PTS</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Every candidate bay is evaluated against five additive criteria without black-box inference:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-emerald-400 font-bold text-[11px]">Availability (25 pts)</div>
              <div className="text-slate-400 text-[10px] mt-0.5">Verified vacant state</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-cyan-400 font-bold text-[11px]">Distance (25 pts)</div>
              <div className="text-slate-400 text-[10px] mt-0.5">Non-linear metric decay</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-indigo-400 font-bold text-[11px]">ADA Fit (15 pts)</div>
              <div className="text-slate-400 text-[10px] mt-0.5">Accessibility matching</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-teal-400 font-bold text-[11px]">EV Match (15 pts)</div>
              <div className="text-slate-400 text-[10px] mt-0.5">Level 2 EV port alignment</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-amber-400 font-bold text-[11px]">Aisle Flow (10 pts)</div>
              <div className="text-slate-400 text-[10px] mt-0.5">Lower section congestion</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-pink-400 font-bold text-[11px]">Stability (10 pts)</div>
              <div className="text-slate-400 text-[10px] mt-0.5">3-frame optical confirmation</div>
            </div>
          </div>
        </div>
      )}

      {/* BEST MATCH SPOTLIGHT CARD */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
            <span>Ranked Recommendations &amp; Comparison</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {recommendations?.totalEligible || 0} ELIGIBLE BAYS
            </span>
          </h2>
          <span className="text-xs text-slate-400">Click any card to inspect or route</span>
        </div>

        {bestMatch ? (
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 border-2 border-cyan-500/60 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-800/40 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 flex items-center justify-center font-mono font-bold text-xl">
                  {bestMatch.bay.id}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> BEST MATCH (RANK #1)
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-200">
                      PROTOTYPE SCORE: {bestMatch.totalScore}/100
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mt-1">
                    {bestMatch.bay.section} &bull; Level {bestMatch.bay.level} &bull; Row {bestMatch.bay.row}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => handleSelectAndNavigate(bestMatch.bay)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow flex items-center gap-1.5 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Navigate to Bay {bestMatch.bay.id}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Score Breakdown Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-1">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Availability</span>
                  <span className="font-mono text-emerald-400 font-bold">{bestMatch.breakdown.availabilityWeight}/25</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${(bestMatch.breakdown.availabilityWeight / 25) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Distance</span>
                  <span className="font-mono text-cyan-400 font-bold">{bestMatch.breakdown.distanceWeight}/25</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full" style={{ width: `${(bestMatch.breakdown.distanceWeight / 25) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Accessibility</span>
                  <span className="font-mono text-indigo-400 font-bold">{bestMatch.breakdown.accessibilityWeight}/15</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full" style={{ width: `${(bestMatch.breakdown.accessibilityWeight / 15) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Vehicle Fit</span>
                  <span className="font-mono text-teal-400 font-bold">{bestMatch.breakdown.bayTypePreference}/15</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full" style={{ width: `${(bestMatch.breakdown.bayTypePreference / 15) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Congestion</span>
                  <span className="font-mono text-amber-400 font-bold">{bestMatch.breakdown.sectionCongestionScore}/10</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full" style={{ width: `${(bestMatch.breakdown.sectionCongestionScore / 10) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Stability</span>
                  <span className="font-mono text-pink-400 font-bold">{bestMatch.breakdown.bayStabilityBonus}/10</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-pink-500 h-full" style={{ width: `${(bestMatch.breakdown.bayStabilityBonus / 10) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Why This Spot Was Chosen */}
            <div className="pt-2 text-xs space-y-1.5 text-slate-300">
              <span className="font-semibold text-slate-200 block text-[11px]">Why This Spot? (Transparent Factors):</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {bestMatch.reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Human Feedback Loop (Requirement 15) */}
            <div className="pt-3 border-t border-cyan-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="font-medium">Was this recommendation useful?</span>
                <button
                  onClick={() => handleFeedback(bestMatch.bay.id, true)}
                  disabled={feedbackGiven[bestMatch.bay.id]}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                    feedbackGiven[bestMatch.bay.id]
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-300 hover:text-white border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>YES</span>
                </button>
                <button
                  onClick={() => handleFeedback(bestMatch.bay.id, false)}
                  disabled={feedbackGiven[bestMatch.bay.id]}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                    feedbackGiven[bestMatch.bay.id]
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-slate-950 text-slate-300 hover:text-white border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5 text-rose-400" />
                  <span>NO</span>
                </button>
                {feedbackGiven[bestMatch.bay.id] && (
                  <span className="text-[11px] text-emerald-400">Feedback recorded in calibration queue.</span>
                )}
              </div>

              <div className="text-[11px] text-slate-500 font-mono">
                Driver Acceptance: {recFeedbackStats.rate}% ({recFeedbackStats.accepted}/{recFeedbackStats.total} responses)
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
            <h4 className="text-base font-bold text-white">No Compatible Spaces Found</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {recommendations?.warning || 'No vacant bays currently meet your strict constraint criteria. Try expanding walking distance or relaxing section preferences.'}
            </p>
          </div>
        )}

        {/* Alternatives Grid */}
        {alternatives.length > 0 && (
          <div className="space-y-3 pt-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Alternative Spaces for Comparison ({alternatives.length} options)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {alternatives.map((alt) => (
                <div
                  key={alt.bay.id}
                  onClick={() => handleSelectAndNavigate(alt.bay)}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-800/60 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-lg text-white group-hover:text-cyan-300">
                          {alt.bay.id}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          RANK #{alt.rank}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        {alt.totalScore}/100
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">
                      {alt.bay.section} &bull; Level {alt.bay.level}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {alt.bay.distanceToEntranceMeters}m walk &bull; {alt.bay.type === 'ev' ? 'Level 2 EV' : alt.bay.type === 'accessible' ? 'ADA' : 'Standard'}
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1 text-[11px] text-slate-400">
                      <div className="flex justify-between">
                        <span>Distance Score</span>
                        <span className="font-mono text-slate-200">{alt.breakdown.distanceWeight}/25</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vehicle Match</span>
                        <span className="font-mono text-slate-200">{alt.breakdown.bayTypePreference}/15</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Aisle Congestion</span>
                        <span className="font-mono text-slate-200">{alt.breakdown.sectionCongestionScore}/10</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-cyan-400 font-semibold group-hover:text-cyan-300">
                    <span>Inspect &amp; Route</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
