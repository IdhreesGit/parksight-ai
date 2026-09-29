import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  ArrowRight,
  Clock,
  Footprints,
  Navigation,
  CheckCircle2,
  Zap,
  Accessibility,
  CornerDownRight,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';
import { FACILITY_ENTRANCES } from '../../services/navigationService';
import { ParkingBay } from '../../types';

interface NavigationViewProps {
  onSelectBay: (bay: ParkingBay) => void;
  onNavigate: (route: string) => void;
}

export const NavigationView: React.FC<NavigationViewProps> = ({ onSelectBay, onNavigate }) => {
  const {
    bays,
    navigationTarget,
    setNavigationTarget,
    activeNavigationRoute,
    preferences,
    updatePreferences,
    recommendations,
  } = useParking();

  const [selectedEntrance, setSelectedEntrance] = useState<string>(
    preferences.preferredEntrance || 'Main Entrance (North)'
  );

  const availableBays = bays.filter((b) => b.status === 'available');
  const activeBay = navigationTarget || recommendations?.bestMatch?.bay || availableBays[0];

  const handleEntranceChange = (entranceName: string) => {
    setSelectedEntrance(entranceName);
    updatePreferences({ preferredEntrance: entranceName });
    if (activeBay) {
      setNavigationTarget(activeBay);
    }
  };

  const handleBayChange = (bayId: string) => {
    const bay = bays.find((b) => b.id === bayId);
    if (bay) {
      setNavigationTarget(bay);
    }
  };

  const waypoints = activeNavigationRoute?.waypoints || [];
  const steps = activeNavigationRoute?.steps || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Indoor Parking Navigation (Review 2 Simulation)
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
              PROTOTYPE INDOOR ROUTING
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulated turn-by-turn routing from facility entrance gates to your designated vacant parking stall.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => onNavigate('parking')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>2D Map View</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Select Entrance & Target Bay */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="text-slate-400 font-semibold block mb-1.5 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>Starting Facility Ingress Gate:</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(FACILITY_ENTRANCES).map((entKey) => (
              <button
                key={entKey}
                onClick={() => handleEntranceChange(entKey)}
                className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                  selectedEntrance === entKey
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-white text-xs">{entKey}</div>
                <div className="text-[10px] text-slate-500 truncate">{FACILITY_ENTRANCES[entKey].description}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-slate-400 font-semibold block mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Destination Parking Bay:</span>
          </label>
          <div className="flex items-center gap-2">
            <select
              value={activeBay?.id || ''}
              onChange={(e) => handleBayChange(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
            >
              {availableBays.map((b) => (
                <option key={b.id} value={b.id}>
                  Bay {b.id} &bull; {b.section} &bull; Level {b.level} &bull; {b.type.toUpperCase()} ({b.distanceToEntranceMeters}m walk)
                </option>
              ))}
            </select>
          </div>
          {recommendations?.bestMatch && (
            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Recommended Destination: </span>
              <button
                onClick={() => handleBayChange(recommendations.bestMatch!.bay.id)}
                className="font-mono text-cyan-400 font-bold hover:underline"
              >
                Bay {recommendations.bestMatch.bay.id}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Stage: Visual 2D Navigation Floorplan + Step-by-Step Directions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Route Canvas Overlay (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white">Visual Waypoint Path</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800">
                LEVEL {activeBay?.level || 1} DECK
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-400 text-xs">
              <span className="flex items-center gap-1 font-mono text-emerald-400 font-semibold">
                <Footprints className="w-3.5 h-3.5" />
                {activeNavigationRoute?.totalDistanceMeters || activeBay?.distanceToEntranceMeters || 35} meters
              </span>
              <span className="flex items-center gap-1 font-mono text-cyan-400 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                ~{activeNavigationRoute?.estimatedWalkingMinutes || activeBay?.estimatedWalkingMinutes || 1.0} min walk
              </span>
            </div>
          </div>

          {/* SVG Map with Driving Lanes & Waypoint Route */}
          <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-slate-800 bg-slate-900/90 p-4">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Floor boundary */}
              <rect x="2" y="2" width="96" height="96" rx="4" fill="#090d16" stroke="#1e293b" strokeWidth="0.8" />

              {/* Driving lanes */}
              <line x1="8" y1="20" x2="92" y2="20" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="2,2" />
              <line x1="8" y1="42" x2="92" y2="42" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="2,2" />
              <line x1="8" y1="64" x2="92" y2="64" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="2,2" />
              <line x1="8" y1="84" x2="92" y2="84" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="2,2" />

              {/* Bay rectangles on Level 1 or 2 */}
              {bays
                .filter((b) => b.level === (activeBay?.level || 1))
                .slice(0, 36)
                .map((b) => {
                  const isDestination = activeBay?.id === b.id;
                  const isOccupied = b.status === 'occupied';
                  return (
                    <g key={b.id}>
                      <rect
                        x={b.x}
                        y={b.y}
                        width={b.width}
                        height={b.height}
                        rx="1"
                        fill={isDestination ? '#0284c7' : isOccupied ? '#1e293b' : '#064e3b'}
                        stroke={isDestination ? '#38bdf8' : isOccupied ? '#334155' : '#10b981'}
                        strokeWidth={isDestination ? 1.2 : 0.4}
                      />
                      <text
                        x={b.x + b.width / 2}
                        y={b.y + b.height / 2 + 1.2}
                        fill={isDestination ? '#ffffff' : isOccupied ? '#64748b' : '#a7f3d0'}
                        fontSize="2.8"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {b.id}
                      </text>
                    </g>
                  );
                })}

              {/* Waypoint Path Polyline */}
              {waypoints.length > 1 && (
                <>
                  <polyline
                    points={waypoints.map((w) => `${w.x},${w.y}`).join(' ')}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="1.8"
                    strokeDasharray="3,2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-pulse"
                  />
                  {waypoints.map((w, idx) => (
                    <circle
                      key={idx}
                      cx={w.x}
                      cy={w.y}
                      r={idx === 0 || idx === waypoints.length - 1 ? 2.5 : 1.2}
                      fill={idx === 0 ? '#10b981' : idx === waypoints.length - 1 ? '#f59e0b' : '#06b6d4'}
                      stroke="#ffffff"
                      strokeWidth="0.5"
                    />
                  ))}
                </>
              )}

              {/* Entrance Gate Marker */}
              {FACILITY_ENTRANCES[selectedEntrance] && (
                <g>
                  <circle
                    cx={FACILITY_ENTRANCES[selectedEntrance].x}
                    cy={FACILITY_ENTRANCES[selectedEntrance].y}
                    r="3"
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="0.8"
                  />
                  <text
                    x={FACILITY_ENTRANCES[selectedEntrance].x}
                    y={FACILITY_ENTRANCES[selectedEntrance].y + 5.5}
                    fill="#34d399"
                    fontSize="2.4"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    INGRESS GATE
                  </text>
                </g>
              )}
            </svg>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Start: {selectedEntrance}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Cyan Dotted: Vehicle Route
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Destination: Bay {activeBay?.id}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Prototype 2D vector indoor path simulator
            </div>
          </div>
        </div>

        {/* Turn-by-Turn Guidance Steps (1 col) */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CornerDownRight className="w-4 h-4 text-cyan-400" />
              <span>Turn-by-Turn Navigation</span>
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              {steps.length} STEPS
            </span>
          </div>

          {activeBay && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Target Bay</span>
                <span className="font-mono font-bold text-lg text-white">BAY {activeBay.id}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Location:</span>
                <span>{activeBay.section} &bull; L{activeBay.level}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Type:</span>
                <span className="capitalize text-cyan-300 font-medium">{activeBay.type}</span>
              </div>
            </div>
          )}

          {/* Steps List */}
          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1 text-xs">
            {steps.map((st) => (
              <div
                key={st.stepNumber}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-800/60 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                  {st.stepNumber}
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">{st.checkpoint}</span>
                    <span className="font-mono text-cyan-400">{st.distanceMeters}m</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{st.instruction}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                if (activeBay) onSelectBay(activeBay);
                onNavigate('parking');
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Locate on 2D Parking Map</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
