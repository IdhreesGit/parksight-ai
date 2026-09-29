import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Zap,
  Accessibility,
  CornerDownLeft,
  LayoutDashboard,
  BarChart3,
  Camera,
  Layers,
  Bell,
  Sparkles,
  Shield,
  SlidersHorizontal,
  Compass,
  Play,
  Pause,
  RotateCcw,
  StepForward,
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';
import { ParkingBay } from '../../types';

interface SearchModalProps {
  onSelectBay: (bay: ParkingBay) => void;
  onNavigate?: (route: string) => void;
}

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Simulation' | 'Filters';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ onSelectBay, onNavigate }) => {
  const { isSearchOpen, setIsSearchOpen, bays, simulation } = useParking();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  const commands: CommandItem[] = useMemo(() => [
    {
      id: 'cmd-nav-dash',
      category: 'Navigation',
      title: 'Command Dashboard',
      subtitle: 'Overview of campus capacity, operational state & live metrics',
      icon: <LayoutDashboard className="w-4 h-4 text-cyan-400" />,
      action: () => onNavigate?.('dashboard'),
    },
    {
      id: 'cmd-nav-map',
      category: 'Navigation',
      title: 'Live 2D Parking Map',
      subtitle: 'Interactive vector floorplan with bay inspector',
      icon: <Layers className="w-4 h-4 text-emerald-400" />,
      action: () => onNavigate?.('parking'),
    },
    {
      id: 'cmd-nav-navigation',
      category: 'Navigation',
      title: 'Indoor Parking Navigation',
      subtitle: 'Visual route from entrance to designated parking stall',
      icon: <Compass className="w-4 h-4 text-blue-400" />,
      action: () => onNavigate?.('navigation'),
    },
    {
      id: 'cmd-nav-cv',
      category: 'Navigation',
      title: 'Computer Vision Workspace',
      subtitle: 'Real frame extraction, YOLO inference & Gemini multimodal inspector',
      icon: <Camera className="w-4 h-4 text-purple-400" />,
      action: () => onNavigate?.('detection'),
    },
    {
      id: 'cmd-nav-recs',
      category: 'Navigation',
      title: 'Explainable Recommendations',
      subtitle: 'Transparent multi-factor proximity scoring and ranked alternatives',
      icon: <Sparkles className="w-4 h-4 text-pink-400" />,
      action: () => onNavigate?.('recommendations'),
    },
    {
      id: 'cmd-nav-analytics',
      category: 'Navigation',
      title: 'Predictive Analytics & Forecasting',
      subtitle: "Holt's double exponential smoothing & time-series curves",
      icon: <BarChart3 className="w-4 h-4 text-amber-400" />,
      action: () => onNavigate?.('analytics'),
    },
    {
      id: 'cmd-nav-twin',
      category: 'Navigation',
      title: 'Digital Twin Simulator',
      subtitle: 'Mulberry32 PRNG seed scenarios & temporal stability state machine',
      icon: <SlidersHorizontal className="w-4 h-4 text-cyan-400" />,
      action: () => onNavigate?.('digital-twin'),
    },
    {
      id: 'cmd-nav-alerts',
      category: 'Navigation',
      title: 'Alerts & Anomaly Operations',
      subtitle: 'Surge, drop, chatter, camera interruptions and human dispute queue',
      icon: <Bell className="w-4 h-4 text-rose-400" />,
      action: () => onNavigate?.('alerts'),
    },
    {
      id: 'cmd-sim-toggle',
      category: 'Simulation',
      title: simulation.isRunning ? 'Pause Simulation' : 'Resume Simulation',
      subtitle: simulation.isRunning ? 'Freeze state updates' : 'Resume live tick loop',
      icon: simulation.isRunning ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />,
      action: () => simulation.toggleRunning(),
    },
    {
      id: 'cmd-sim-step',
      category: 'Simulation',
      title: 'Step Simulation Forward',
      subtitle: 'Advance 1 deterministic traffic cycle (+2 min clock)',
      icon: <StepForward className="w-4 h-4 text-cyan-400" />,
      action: () => simulation.stepForward(),
    },
    {
      id: 'cmd-sim-reset',
      category: 'Simulation',
      title: 'Reset Simulation to Baseline',
      subtitle: 'Restore deterministic ground-truth initial pattern',
      icon: <RotateCcw className="w-4 h-4 text-rose-400" />,
      action: () => simulation.reset(),
    },
  ], [onNavigate, simulation]);

  const filteredItems = useMemo(() => {
    const q = query.toLowerCase().trim();
    const matchedCommands = commands.filter(
      (c) => !q || c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.subtitle?.toLowerCase().includes(q)
    );

    const matchedBays = bays
      .filter((b) => {
        if (!q) return false;
        return (
          b.id.toLowerCase().includes(q) ||
          b.section.toLowerCase().includes(q) ||
          b.type.toLowerCase().includes(q) ||
          b.status.toLowerCase().includes(q)
        );
      })
      .slice(0, 10);

    return {
      commands: matchedCommands,
      bays: matchedBays,
      total: matchedCommands.length + matchedBays.length,
    };
  }, [query, commands, bays]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.total));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.total) % Math.max(1, filteredItems.total));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < filteredItems.commands.length) {
        filteredItems.commands[selectedIndex].action();
        setIsSearchOpen(false);
      } else {
        const bayIdx = selectedIndex - filteredItems.commands.length;
        const bay = filteredItems.bays[bayIdx];
        if (bay) {
          onSelectBay(bay);
          setIsSearchOpen(false);
        }
      }
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <Search className="w-5 h-5 text-cyan-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search bay ID, section, navigation, or run command (e.g. 'A3', 'EV', 'Pause')..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <div className="flex items-center gap-1.5 ml-2 border-l border-slate-800 pl-3">
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
              ESC
            </span>
          </div>
        </div>

        <div className="p-2 overflow-y-auto divide-y divide-slate-800/40 text-xs">
          {filteredItems.total === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No matching commands or parking bays found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <>
              {filteredItems.commands.length > 0 && (
                <div className="py-1">
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    System Commands &amp; Views
                  </div>
                  {filteredItems.commands.map((cmd, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={cmd.id}
                        onClick={() => {
                          cmd.action();
                          setIsSearchOpen(false);
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                          isSelected ? 'bg-cyan-500/15 text-white border border-cyan-500/30' : 'text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-slate-800/90 border border-slate-700">
                            {cmd.icon}
                          </div>
                          <div>
                            <div className="font-medium text-slate-100 flex items-center gap-2">
                              {cmd.title}
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                {cmd.category}
                              </span>
                            </div>
                            {cmd.subtitle && (
                              <div className="text-[11px] text-slate-400 mt-0.5">{cmd.subtitle}</div>
                            )}
                          </div>
                        </div>
                        {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {filteredItems.bays.length > 0 && (
                <div className="py-1">
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                    <span>Parking Bays Matching &ldquo;{query}&rdquo;</span>
                    <span>{filteredItems.bays.length} spaces</span>
                  </div>
                  {filteredItems.bays.map((bay, idx) => {
                    const globalIdx = filteredItems.commands.length + idx;
                    const isSelected = globalIdx === selectedIndex;
                    const isAvail = bay.status === 'available';
                    return (
                      <div
                        key={bay.id}
                        onClick={() => {
                          onSelectBay(bay);
                          setIsSearchOpen(false);
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                          isSelected ? 'bg-cyan-500/15 text-white border border-cyan-500/30' : 'text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border ${
                              isAvail
                                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700/50'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {bay.id}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 font-medium text-slate-200">
                              <span>Bay {bay.id}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${
                                  isAvail ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {bay.status}
                              </span>
                              {bay.type === 'ev' && (
                                <span className="flex items-center gap-0.5 text-[10px] text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                                  <Zap className="w-2.5 h-2.5" /> EV
                                </span>
                              )}
                              {bay.type === 'accessible' && (
                                <span className="flex items-center gap-0.5 text-[10px] text-blue-300 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/40">
                                  <Accessibility className="w-2.5 h-2.5" /> ADA
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {bay.section} &bull; L{bay.level} &bull; {bay.distanceToEntranceMeters}m walk
                            </div>
                          </div>
                        </div>
                        {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800 bg-slate-950/70 text-[11px] text-slate-500">
          <span>Navigate with Arrow keys &bull; Select with Enter &bull; Close with Esc</span>
          <span className="text-cyan-400/80 font-mono">ParkSight Palette v2</span>
        </div>
      </div>
    </div>
  );
};
