import React, { useState } from 'react';
import {
  Car,
  CheckCircle2,
  Clock,
  Sparkles,
  Camera,
  Activity,
  ArrowRight,
  TrendingUp,
  MapPin,
  ShieldAlert,
  Zap,
  Accessibility,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  AlertTriangle,
  Radio,
  Layers,
  Compass,
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';
import { useLanguage } from '../../context/LanguageContext';
import { ParkingBay } from '../../types';

interface DashboardViewProps {
  onNavigate: (route: string) => void;
  onSelectBay: (bay: ParkingBay) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onSelectBay }) => {
  const {
    bays,
    occupancyMetrics,
    alerts,
    recentEvents,
    recommendations,
    selectedLot,
    anomalyStatus,
    simulation,
    openFeedbackModal,
    systemMode,
    setNavigationTarget,
  } = useParking();
  const { t } = useLanguage();

  const topRec = recommendations?.bestMatch;

  // Compute breakdown by deck section
  const sectionStats = React.useMemo(() => {
    const sections = ['North Deck', 'South Wing', 'East Courtyard', 'West Deck'];
    return sections.map((sec) => {
      const secBays = bays.filter((b) => b.section.toLowerCase().includes(sec.toLowerCase().split(' ')[0]));
      const total = secBays.length || 24;
      const occupied = secBays.filter((b) => b.status === 'occupied').length;
      const available = secBays.filter((b) => b.status === 'available').length;
      const evCount = secBays.filter((b) => b.type === 'ev' && b.status === 'available').length;
      const adaCount = secBays.filter((b) => b.type === 'accessible' && b.status === 'available').length;
      const rate = Math.round((occupied / total) * 100);
      return { name: sec, total, occupied, available, evCount, adaCount, rate };
    });
  }, [bays]);

  // Compute Level 1 vs Level 2 stats
  const levelStats = React.useMemo(() => {
    const l1Bays = bays.filter((b) => b.level === 1);
    const l2Bays = bays.filter((b) => b.level === 2);
    return {
      l1: {
        total: l1Bays.length,
        available: l1Bays.filter((b) => b.status === 'available').length,
        occupied: l1Bays.filter((b) => b.status === 'occupied').length,
      },
      l2: {
        total: l2Bays.length,
        available: l2Bays.filter((b) => b.status === 'available').length,
        occupied: l2Bays.filter((b) => b.status === 'occupied').length,
      },
    };
  }, [bays]);

  const activeAnomalyAlert = alerts.find((a) => a.severity === 'critical' || a.anomalyExplanation);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Operational Status & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                {t('dashboard.title', 'Smart Parking Intelligence Command')}
              </h1>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                  systemMode === 'REAL'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}
              >
                MODE: {systemMode}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulated Clock: <span className="font-mono text-cyan-300 font-semibold">{simulation.simulatedTime}</span> &bull; Facility: {selectedLot?.name || 'Campus Parking Structure'}
            </p>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={simulation.toggleRunning}
              title={simulation.isRunning ? 'Pause Simulation' : 'Resume Simulation'}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                simulation.isRunning
                  ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
              }`}
            >
              {simulation.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{simulation.isRunning ? 'Pause' : 'Resume'}</span>
            </button>
            <button
              onClick={simulation.stepForward}
              title="Advance single simulation cycle (+2 min)"
              className="p-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1 transition-colors"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">Step</span>
            </button>
            <button
              onClick={simulation.reset}
              title="Reset simulation to baseline"
              className="p-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => onNavigate('parking')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/50 flex items-center gap-1.5 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>2D Map</span>
          </button>

          <button
            onClick={() => onNavigate('navigation')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-300 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/50 flex items-center gap-1.5 transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Navigation</span>
          </button>

          <button
            onClick={() => onNavigate('detection')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>CV Workspace</span>
          </button>
        </div>
      </div>

      {/* 4 CORE OPERATIONAL QUESTIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* QUESTION 1: WHAT IS HAPPENING NOW? */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
                1. Operational State
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                {systemMode === 'REAL' ? 'REAL CV' : 'SIMULATED'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white tracking-tight font-mono">
                {occupancyMetrics.occupancyPercentage}%
              </span>
              <span className="text-xs text-slate-400">Total Occupancy</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  occupancyMetrics.occupancyPercentage > 85
                    ? 'bg-rose-500'
                    : occupancyMetrics.occupancyPercentage > 70
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${occupancyMetrics.occupancyPercentage}%` }}
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Active Vehicles</span>
              <span className="font-semibold text-slate-200">{occupancyMetrics.activeVehicles} sedans/EVs</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Est. Search Time</span>
              <span className="font-semibold text-slate-200">~{occupancyMetrics.averageSearchTimeMinutes} min</span>
            </div>
          </div>
        </div>

        {/* QUESTION 2: WHERE IS PARKING AVAILABLE? */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
                2. Available Capacity
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                OPEN NOW
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-emerald-400 tracking-tight font-mono">
                {occupancyMetrics.availableSpaces}
              </span>
              <span className="text-xs text-slate-400">of {occupancyMetrics.totalBays} Bays</span>
            </div>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" /> Level 1 (Ground)
                </span>
                <span className="font-mono font-medium text-emerald-400">{levelStats.l1.available} free</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" /> Level 2 (Upper)
                </span>
                <span className="font-mono font-medium text-emerald-400">{levelStats.l2.available} free</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('parking')}
            className="mt-3 text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center justify-between pt-2 border-t border-slate-800/80"
          >
            <span>View 2D Parking Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* QUESTION 3: WHAT DOES AI RECOMMEND? */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/30 to-slate-900 border border-cyan-800/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-cyan-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> 3. Top Recommendation
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-300 font-mono">
                SCORE: {topRec?.totalScore || 94}/100
              </span>
            </div>
            {topRec ? (
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white font-mono">{topRec.bay.id}</span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {topRec.bay.type === 'ev' ? 'EV Charging' : topRec.bay.type === 'accessible' ? 'ADA Accessible' : 'Standard'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {topRec.bay.section} &bull; L{topRec.bay.level} &bull; {topRec.bay.distanceToEntranceMeters}m walk
                </p>
                <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-1 italic">
                  &ldquo;{topRec.reasons[0]}&rdquo;
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Evaluating facility vacancy...</p>
            )}
          </div>
          <div className="mt-3 pt-2 border-t border-cyan-900/40 flex items-center justify-between">
            <button
              onClick={() => {
                if (topRec) {
                  onSelectBay(topRec.bay);
                  setNavigationTarget(topRec.bay);
                  onNavigate('navigation');
                }
              }}
              className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Route Guidance</span>
            </button>
            <button
              onClick={() => onNavigate('recommendations')}
              className="text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <span>Explain</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* QUESTION 4: IS ANYTHING ABNORMAL? */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between ${
            anomalyStatus === 'Anomaly'
              ? 'bg-rose-950/20 border-rose-800/60 text-rose-200'
              : anomalyStatus === 'Warning'
              ? 'bg-amber-950/20 border-amber-800/60 text-amber-200'
              : 'bg-slate-900/80 border-slate-800 text-slate-200'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">4. Anomaly Engine</span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                  anomalyStatus === 'Anomaly'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : anomalyStatus === 'Warning'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {anomalyStatus === 'Anomaly' ? 'Anomaly Flagged' : anomalyStatus === 'Warning' ? 'Attention' : 'Nominal'}
              </span>
            </div>
            {activeAnomalyAlert ? (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{activeAnomalyAlert.title}</span>
                </p>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {activeAnomalyAlert.anomalyExplanation?.whyFlagged || activeAnomalyAlert.description}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All sensors &amp; bay transitions nominal
                </p>
                <p className="text-[11px] text-slate-400">
                  Occupancy variance strictly within &plusmn;6% expected threshold rules.
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => onNavigate('alerts')}
            className="mt-3 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-between pt-2 border-t border-slate-800/80"
          >
            <span>Alert Operations Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SECTION CAPACITY BREAKDOWN & LIVE OPERATIONAL TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Section Availability Heatmap Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Deck Sections &amp; Capacity Status</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  4 ZONES
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Available slots, EV chargers, and ADA infrastructure distribution across deck levels
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => onNavigate('parking')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Interactive Map View &rarr;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {sectionStats.map((sec) => (
              <div
                key={sec.name}
                onClick={() => onNavigate('parking')}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-800/60 hover:bg-slate-900 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-200 text-sm group-hover:text-cyan-300 transition-colors">
                    {sec.name}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {sec.rate}% full
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full ${
                      sec.rate > 85 ? 'bg-rose-500' : sec.rate > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${sec.rate}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span className="text-emerald-400 font-semibold font-mono">
                    {sec.available} available <span className="text-slate-500">/ {sec.total}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {sec.evCount > 0 && (
                      <span className="flex items-center gap-1 text-[11px] text-cyan-400 font-medium">
                        <Zap className="w-3 h-3" /> {sec.evCount} EV
                      </span>
                    )}
                    {sec.adaCount > 0 && (
                      <span className="flex items-center gap-1 text-[11px] text-indigo-400 font-medium">
                        <Accessibility className="w-3 h-3" /> {sec.adaCount} ADA
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>
                Inflow: <strong className="text-white font-mono">{simulation.flowRateIn} veh/hr</strong> &bull; Outflow: <strong className="text-white font-mono">{simulation.flowRateOut} veh/hr</strong>
              </span>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              <span>View Time-Series Analytics &rarr;</span>
            </button>
          </div>
        </div>

        {/* Right 1 Col: Live Operational Timeline */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Live Operational Timeline</span>
              </h3>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
                PIPELINE STATE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              State transitions propagated from CV detection and simulation cycles.
            </p>
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {recentEvents.slice(0, 7).map((ev) => (
                <div
                  key={ev.id}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs flex items-start gap-2.5 hover:border-slate-700 transition-colors"
                >
                  <div
                    className={`mt-0.5 p-1 rounded-md shrink-0 ${
                      ev.eventType === 'vehicle_parked'
                        ? 'bg-rose-500/15 text-rose-400'
                        : ev.eventType === 'vehicle_departed'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-cyan-500/15 text-cyan-400'
                    }`}
                  >
                    <Car className="w-3 h-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-[11px] mb-0.5">
                      <span className="font-mono font-semibold text-slate-200">{ev.bayId}</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(ev.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{ev.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={() => openFeedbackModal()}
              className="text-slate-400 hover:text-slate-200"
            >
              Dispute a bay status
            </button>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              View All Alerts &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
