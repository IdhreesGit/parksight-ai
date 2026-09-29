import React, { useState } from 'react';
import {
  MapPin,
  Filter,
  Zap,
  Accessibility,
  Clock,
  Car,
  Flag,
  RotateCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  ArrowRight,
  X,
  History,
  Radio,
  Compass,
  Footprints,
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';
import { ParkingBay } from '../../types';

interface LiveParkingViewProps {
  selectedBay: ParkingBay | null;
  onSelectBay: (bay: ParkingBay | null) => void;
  onNavigate?: (route: string) => void;
}

export const LiveParkingView: React.FC<LiveParkingViewProps> = ({
  selectedBay,
  onSelectBay,
  onNavigate,
}) => {
  const {
    bays,
    selectedLot,
    openFeedbackModal,
    refreshData,
    recommendations,
    navigationTarget,
    setNavigationTarget,
    activeNavigationRoute,
    systemMode,
  } = useParking();

  const [filterType, setFilterType] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showNavigationPath, setShowNavigationPath] = useState(true);

  const topRecBayId = recommendations?.bestMatch?.bay.id;
  const navDestinationId = navigationTarget?.id || selectedBay?.id || topRecBayId;

  // Filter bays
  const filteredBays = bays.filter((b) => {
    if (b.level !== selectedLevel) return false;
    if (selectedSection !== 'all') {
      if (!b.section.toLowerCase().includes(selectedSection.toLowerCase())) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        b.id.toLowerCase().includes(q) ||
        b.section.toLowerCase().includes(q) ||
        b.type.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterType === 'all') return true;
    if (filterType === 'available') return b.status === 'available';
    if (filterType === 'occupied') return b.status === 'occupied';
    if (filterType === 'reserved') return b.status === 'reserved' || b.type === 'reserved';
    if (filterType === 'ev') return b.type === 'ev';
    if (filterType === 'accessible') return b.type === 'accessible';
    if (filterType === 'low_confidence') return b.status === 'low_confidence' || (b.confidence && b.confidence < 0.6);
    return true;
  });

  const activeRows = selectedLevel === 1 ? ['A', 'B', 'C', 'D'] : ['E', 'F'];
  const levelBays = bays.filter((b) => b.level === selectedLevel);
  const counts = {
    all: levelBays.length,
    available: levelBays.filter((b) => b.status === 'available').length,
    occupied: levelBays.filter((b) => b.status === 'occupied').length,
    reserved: levelBays.filter((b) => b.status === 'reserved' || b.type === 'reserved').length,
    ev: levelBays.filter((b) => b.type === 'ev').length,
    accessible: levelBays.filter((b) => b.type === 'accessible').length,
  };

  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    if (direction === 'in') setZoomLevel((prev) => Math.min(1.5, +(prev + 0.15).toFixed(2)));
    else if (direction === 'out') setZoomLevel((prev) => Math.max(0.85, +(prev - 0.15).toFixed(2)));
    else setZoomLevel(1);
  };

  const handleSetNavigation = (bay: ParkingBay) => {
    setNavigationTarget(bay);
    if (onNavigate) {
      onNavigate('navigation');
    }
  };

  const waypoints = activeNavigationRoute?.waypoints || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Level Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Interactive 2D Parking Map (Review 2)
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
              {selectedLot?.name || 'Campus Parking Structure'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual vector floorplan with live bay states, driving lanes, EV chargers, ADA corridors, and inspection drawer.
          </p>
        </div>

        {/* Level Switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <span className="text-xs text-slate-400 px-2 flex items-center gap-1 font-medium">
            <Layers className="w-3.5 h-3.5 text-cyan-400" /> Deck Level:
          </span>
          <button
            onClick={() => {
              setSelectedLevel(1);
              setSelectedSection('all');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              selectedLevel === 1 ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Level 1 (Ground)
          </button>
          <button
            onClick={() => {
              setSelectedLevel(2);
              setSelectedSection('all');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              selectedLevel === 2 ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Level 2 (Upper Deck)
          </button>
        </div>
      </div>

      {/* Control Bar: Filters, Section Selector, Search & Zoom */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: `All (${counts.all})` },
            { id: 'available', label: `Available (${counts.available})`, color: 'text-emerald-400' },
            { id: 'occupied', label: `Occupied (${counts.occupied})`, color: 'text-slate-400' },
            { id: 'ev', label: `EV Charging (${counts.ev})`, icon: Zap, color: 'text-cyan-400' },
            { id: 'accessible', label: `ADA (${counts.accessible})`, icon: Accessibility, color: 'text-indigo-400' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterType(btn.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                filterType === btn.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {btn.icon && <btn.icon className="w-3.5 h-3.5" />}
              <span>{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Section, Search, Navigation Toggle & Zoom */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="bg-slate-950 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 border border-slate-800 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Deck Sections</option>
            <option value="North Deck">North Deck</option>
            <option value="South Wing">South Wing</option>
            <option value="East Courtyard">East Courtyard</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter Bay (e.g. A3)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 w-36 sm:w-40"
            />
          </div>

          <button
            onClick={() => setShowNavigationPath(!showNavigationPath)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
              showNavigationPath
                ? 'bg-blue-600 text-white'
                : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
            title="Toggle indoor navigation route overlay"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Route</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => handleZoom('out')}
              title="Zoom out"
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-400 px-1">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => handleZoom('in')}
              title="Zoom in"
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom('reset')}
              title="Reset Zoom"
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => refreshData()}
            title="Refresh occupancy map"
            className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Map + Bay Detail Drawer Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* MAP STAGE (3 Cols) */}
        <div className="xl:col-span-3 rounded-2xl bg-slate-950 border border-slate-800 p-4 sm:p-6 overflow-hidden relative min-h-[560px]">
          {/* Deck Entrance Landmarks */}
          <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-800/80 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[11px] border border-emerald-500/30">
                GATE 1 (NORTH INGRESS)
              </span>
              <span className="text-[11px] text-slate-500">Speed Limit: 15 km/h</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-mono text-[11px] border border-rose-500/30">
                GATE 2 (SOUTH EGRESS)
              </span>
            </div>
          </div>

          {/* SVG Vector Interactive Layout with Navigation Path */}
          <div
            className="transition-transform duration-200 origin-top"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <div className="space-y-6">
              {activeRows.map((rowName) => {
                const rowBays = filteredBays.filter((b) => b.row === rowName);
                if (rowBays.length === 0) return null;
                return (
                  <div key={rowName} className="space-y-2">
                    {/* Row Header */}
                    <div className="flex items-center justify-between text-xs px-2 text-slate-400 border-b border-slate-900 pb-1">
                      <span className="font-mono font-bold text-slate-300">
                        ROW {rowName} &bull; {rowBays[0]?.section || 'Campus Deck'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {rowBays.filter((b) => b.status === 'available').length} / {rowBays.length} FREE
                      </span>
                    </div>

                    {/* Parking Bays Grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                      {rowBays.map((bay) => {
                        const isSelected = selectedBay?.id === bay.id;
                        const isTopRec = topRecBayId === bay.id;
                        const isNavTarget = navDestinationId === bay.id;
                        const isCandidate = bay.temporalState?.includes('candidate');
                        const isLowConfidence = bay.status === 'low_confidence' || (bay.confidence && bay.confidence < 0.6);

                        let bgClass = 'bg-slate-900/90 text-slate-400 border-slate-800';
                        if (bay.status === 'available') {
                          bgClass = 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50 hover:border-emerald-500';
                        } else if (bay.status === 'occupied') {
                          bgClass = 'bg-slate-900/90 text-slate-500 border-slate-800 hover:border-slate-700';
                        } else if (bay.status === 'reserved') {
                          bgClass = 'bg-amber-950/30 text-amber-400 border-amber-800/40';
                        } else if (bay.status === 'maintenance') {
                          bgClass = 'bg-slate-900 text-slate-600 border-slate-800';
                        }

                        if (isLowConfidence) {
                          bgClass = 'bg-amber-950/30 text-amber-300 border-amber-500/50';
                        }

                        if (isSelected) {
                          bgClass = 'bg-cyan-950/80 text-cyan-200 border-cyan-400 ring-2 ring-cyan-500/50 shadow-lg';
                        } else if (isTopRec) {
                          bgClass = 'bg-amber-950/40 text-amber-200 border-amber-400 ring-2 ring-amber-400/40';
                        } else if (isNavTarget && showNavigationPath) {
                          bgClass = 'bg-blue-950/70 text-blue-200 border-blue-400 ring-2 ring-blue-500/40';
                        }

                        return (
                          <div
                            key={bay.id}
                            role="button"
                            tabIndex={0}
                            aria-label={`Bay ${bay.id}, ${bay.status}${isTopRec ? ', top recommended' : ''}`}
                            onClick={() => onSelectBay(bay)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onSelectBay(bay);
                              }
                            }}
                            className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all cursor-pointer relative group focus:outline-none focus:ring-2 focus:ring-cyan-400 ${bgClass} ${
                              isCandidate ? 'border-dashed animate-pulse' : ''
                            }`}
                          >
                            {/* Badges */}
                            {isTopRec && (
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[9px] font-bold px-1.5 py-0.2 rounded-full shadow flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" /> TOP
                              </div>
                            )}
                            {isNavTarget && showNavigationPath && !isTopRec && (
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full shadow flex items-center gap-0.5">
                                <Compass className="w-2.5 h-2.5" /> DEST
                              </div>
                            )}

                            {/* Bay ID & Type Icon */}
                            <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1">
                              <span>{bay.id}</span>
                              {bay.type === 'ev' && <Zap className="w-3 h-3 text-cyan-400 shrink-0" />}
                              {bay.type === 'accessible' && <Accessibility className="w-3 h-3 text-indigo-400 shrink-0" />}
                            </div>

                            {/* Visual Slot Graphic */}
                            <div className="w-full h-7 rounded-lg flex items-center justify-center bg-slate-950/50 border border-slate-800/60 my-1">
                              {bay.status === 'occupied' ? (
                                <Car className="w-4 h-4 text-slate-500" />
                              ) : isLowConfidence ? (
                                <span className="text-[9px] font-mono text-amber-400 font-semibold">UNKNOWN</span>
                              ) : (
                                <span className="text-[10px] font-mono text-emerald-400 font-semibold">FREE</span>
                              )}
                            </div>

                            {/* Distance */}
                            <div className="text-[10px] font-mono text-slate-400 truncate">
                              {bay.distanceToEntranceMeters}m
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Driving Lane Divider */}
                    <div className="h-4 w-full flex items-center justify-center my-1">
                      <div className="w-full border-t border-dashed border-slate-800 relative">
                        <span className="absolute left-1/2 -top-2 -translate-x-1/2 bg-slate-950 px-2 text-[9px] font-mono text-slate-600">
                          ONE-WAY DRIVING LANE &rarr;
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map Legend */}
          <div className="mt-8 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/60" /> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700" /> Occupied
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/60" /> Unknown / Low Conf
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" /> EV Charging
              </span>
              <span className="flex items-center gap-1.5">
                <Accessibility className="w-3.5 h-3.5 text-indigo-400" /> ADA Accessible
              </span>
              <span className="flex items-center gap-1.5 text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Recommended
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Click any bay to open inspector drawer
            </div>
          </div>
        </div>

        {/* RIGHT 1 COL: POLISHED BAY DETAIL DRAWER */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sticky top-20 shadow-md">
          {selectedBay ? (
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold font-mono text-white">BAY {selectedBay.id}</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${
                        selectedBay.status === 'available'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : selectedBay.status === 'occupied'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {selectedBay.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedBay.section} &bull; Level {selectedBay.level} &bull; Row {selectedBay.row}
                  </p>
                </div>
                <button
                  onClick={() => onSelectBay(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Bay Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Walking Distance</span>
                  <span className="text-sm font-semibold text-white font-mono">
                    {selectedBay.distanceToEntranceMeters} meters
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    ~{selectedBay.estimatedWalkingMinutes} min walk
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Bay Classification</span>
                  <span className="text-sm font-semibold text-cyan-300 flex items-center gap-1 mt-0.5">
                    {selectedBay.type === 'ev' && <Zap className="w-3.5 h-3.5 text-cyan-400" />}
                    {selectedBay.type === 'accessible' && <Accessibility className="w-3.5 h-3.5 text-indigo-400" />}
                    <span className="capitalize">{selectedBay.type}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 block">Ground Level Ingress</span>
                </div>
              </div>

              {/* Detection & Temporal State Source */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-cyan-400" /> Detection Source
                  </span>
                  <span className="font-semibold text-slate-200">{selectedBay.detectionSource || 'Simulation Engine'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Temporal Filter State</span>
                  <span className="font-mono text-[11px] text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800/40">
                    {selectedBay.temporalState || 'confirmed_available'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Optical Confidence</span>
                  <span className="font-mono text-[11px] text-emerald-400 font-semibold">
                    {selectedBay.confidence ? `${Math.round(selectedBay.confidence * 100)}%` : '96%'}
                  </span>
                </div>

                {selectedBay.vehicleDetected && (
                  <div className="pt-2 border-t border-slate-900 space-y-1">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Vehicle Detected</span>
                      <span className="font-medium capitalize">{selectedBay.vehicleDetected.type}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Privacy Masked Plate</span>
                      <span className="font-mono text-slate-300">{selectedBay.vehicleDetected.plateMasked || 'ANONYMIZED'}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Last State Transition</span>
                  <span className="font-mono">
                    {new Date(selectedBay.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* State History & Chronological Audit Timeline */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5 text-[11px]">
                    <History className="w-3.5 h-3.5 text-cyan-400" /> State History &amp; Audit Timeline
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {selectedBay.history?.length || 1} transitions
                  </span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {selectedBay.history && selectedBay.history.length > 0 ? (
                    selectedBay.history.map((h, i) => {
                      const isOcc = h.status === 'occupied';
                      const timeStr = new Date(h.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      });
                      return (
                        <div
                          key={i}
                          className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-[11px]"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-slate-400">{timeStr}</span>
                            <span
                              className={`px-1.5 py-0.2 text-[10px] font-semibold rounded uppercase ${
                                isOcc
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {h.status}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 leading-tight">{h.reason}</div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-500 text-center">
                      Baseline established &bull; Steady state
                    </div>
                  )}
                </div>
              </div>

              {/* Actions: Navigate Here + Dispute Status */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleSetNavigation(selectedBay)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Navigate to this Bay</span>
                </button>

                <button
                  onClick={() => openFeedbackModal(selectedBay)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Dispute Bay Status</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mx-auto text-slate-400">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-200">Select a Parking Bay</h4>
              <p className="text-xs text-slate-400 max-w-[220px] mx-auto">
                Click any slot on the map to inspect real-time metrics, detection source, and walking radius.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
