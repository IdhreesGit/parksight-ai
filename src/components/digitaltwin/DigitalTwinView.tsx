import React, { useState } from 'react';
import {
  Activity,
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Clock,
  Car,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Flame,
  Zap,
  TrendingUp,
  Cpu,
  Layers,
  Radio,
  Sliders,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';

export const DigitalTwinView: React.FC = () => {
  const { simulation, bays, recentEvents, openFeedbackModal } = useParking();
  const [seedInput, setSeedInput] = useState<string>('42');

  const temporalCounts = React.useMemo(() => {
    let confAvail = 0;
    let candOcc = 0;
    let confOcc = 0;
    let candAvail = 0;
    bays.forEach((b) => {
      const state = b.temporalState || (b.status === 'occupied' ? 'confirmed_occupied' : 'confirmed_available');
      if (state === 'confirmed_available') confAvail++;
      else if (state === 'candidate_occupied') candOcc++;
      else if (state === 'confirmed_occupied') confOcc++;
      else if (state === 'candidate_available') candAvail++;
    });
    return { confAvail, candOcc, confOcc, candAvail };
  }, [bays]);

  const sections = React.useMemo(() => {
    const secNames = ['North Deck', 'South Wing', 'East Courtyard', 'West Deck'];
    return secNames.map((name) => {
      const secBays = bays.filter((b) => b.section.toLowerCase().includes(name.toLowerCase().split(' ')[0]));
      const total = secBays.length || 24;
      const occupied = secBays.filter((b) => b.status === 'occupied').length;
      const available = secBays.filter((b) => b.status === 'available').length;
      const saturation = Math.round((occupied / total) * 100);
      return { name, total, occupied, available, saturation };
    });
  }, [bays]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Digital Twin Simulation Command Center
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
              SYNCHRONOUS DIGITAL TWIN RUNTIME
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulates dynamic campus vehicle arrivals, bay reservations, temporal vision latency stabilization, and occupancy flow.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={simulation.toggleRunning}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              simulation.isRunning
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
            }`}
          >
            {simulation.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{simulation.isRunning ? 'Pause Loop' : 'Start Loop'}</span>
          </button>

          {(['0.5x', '1x', '2x', '5x'] as const).map((spd) => (
            <button
              key={spd}
              onClick={() => simulation.setSpeed(spd)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                simulation.speed === spd
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {spd}
            </button>
          ))}

          <button
            onClick={simulation.stepForward}
            title="Step forward 1 simulation tick"
            className="p-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <FastForward className="w-4 h-4" />
          </button>

          <button
            onClick={simulation.reset}
            title="Reset to default baseline"
            className="p-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DETERMINISTIC TEST SCENARIOS (Review 2 Requirement 6) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Deterministic Scenario Presets</span>
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">REPRODUCIBLE TESTING</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Select any benchmark scenario to evaluate system response under arrival surges, departure waves, or sensor interruptions:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 text-xs">
          <button
            onClick={() => simulation.setScenario('morning_rush')}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-cyan-500/50 text-left transition-all"
          >
            <div className="font-bold text-cyan-300">Morning Rush</div>
            <div className="text-[10px] text-slate-500 mt-0.5">High arrival influx (&sim;76%)</div>
          </button>

          <button
            onClick={() => simulation.setScenario('midday_turnover')}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-cyan-500/50 text-left transition-all"
          >
            <div className="font-bold text-emerald-300">Midday Turnover</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Balanced flow equilibrium</div>
          </button>

          <button
            onClick={() => simulation.setScenario('evening_exodus')}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-cyan-500/50 text-left transition-all"
          >
            <div className="font-bold text-amber-300">Evening Exodus</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Mass departure wave</div>
          </button>

          <button
            onClick={() => simulation.setScenario('night_lull')}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-cyan-500/50 text-left transition-all"
          >
            <div className="font-bold text-purple-300">Night Lull</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Minimal traffic &lt;20%</div>
          </button>

          <button
            onClick={() => simulation.setScenario('camera_failure')}
            className="p-2.5 rounded-xl border border-rose-900/50 bg-rose-950/20 hover:border-rose-500 text-left transition-all"
          >
            <div className="font-bold text-rose-300">Camera Failure</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Drop RTSP heartbeat</div>
          </button>

          <button
            onClick={() => simulation.setScenario('unusual_spike')}
            className="p-2.5 rounded-xl border border-amber-900/50 bg-amber-950/20 hover:border-amber-500 text-left transition-all"
          >
            <div className="font-bold text-amber-300">Unusual Spike</div>
            <div className="text-[10px] text-slate-400 mt-0.5">&gt;15% sudden surge alert</div>
          </button>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 block text-[11px] mb-1">Simulated Deck Clock</span>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {simulation.simulatedTime} <span className="text-xs text-slate-400 font-sans font-normal">EST</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Diurnal curve models campus academic schedule
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 block text-[11px] mb-1">Vehicle Inflow Rate</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {simulation.flowRateIn} <span className="text-xs text-slate-400 font-sans font-normal">veh / hr</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Poisson arrival distribution across North &amp; East gates
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 block text-[11px] mb-1">Vehicle Outflow Rate</span>
          <div className="text-2xl font-bold font-mono text-slate-200">
            {simulation.flowRateOut} <span className="text-xs text-slate-400 font-sans font-normal">veh / hr</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Exponential departure rate based on parking duration
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 block text-[11px] mb-1">State Mutations Last Cycle</span>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {simulation.baysChangedLastTick} <span className="text-xs text-slate-400 font-sans font-normal">bays</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Temporal stability filter applied prior to committing
          </span>
        </div>
      </div>

      {/* TEMPORAL STABILITY STATE MACHINE (Review 2 Requirement 7) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Temporal State Management &amp; Hysteresis Buffer</span>
            </h2>
            <p className="text-xs text-slate-400">
              Prevents single-frame sensor flickering by requiring 3 consecutive confirmation hits before committing transitions.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800 self-start sm:self-auto">
            3-FRAME HYSTERESIS ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-900/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">1. Confirmed Available</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              {temporalCounts.confAvail}
            </div>
            <p className="text-[10px] text-slate-500">
              Vacant bay confirmed by multiple consecutive CV frames.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-900/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">2. Candidate Occupied</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <div className="text-2xl font-bold text-amber-400 font-mono">
              {temporalCounts.candOcc}
            </div>
            <p className="text-[10px] text-slate-500">
              Vehicle ingress detected; verifying multi-frame stability.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-900/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">3. Confirmed Occupied</span>
              <span className="w-2 h-2 rounded-full bg-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-400 font-mono">
              {temporalCounts.confOcc}
            </div>
            <p className="text-[10px] text-slate-500">
              Vehicle fully parked; slot locked in database.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-900/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">4. Candidate Available</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <div className="text-2xl font-bold text-cyan-400 font-mono">
              {temporalCounts.candAvail}
            </div>
            <p className="text-[10px] text-slate-500">
              Departure observed; verifying clearance of egress path.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION SATURATION & LIVE EVENT STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Section Saturation Heatmap</span>
            </h3>
            <span className="text-xs text-slate-400">4 Facility Wings</span>
          </div>
          <div className="space-y-3">
            {sections.map((sec) => (
              <div key={sec.name} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{sec.name}</span>
                  <span className="font-mono text-slate-300">{sec.saturation}% saturated</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      sec.saturation > 85
                        ? 'bg-rose-500'
                        : sec.saturation > 70
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${sec.saturation}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span className="text-emerald-400">{sec.available} Vacant</span>
                  <span>{sec.occupied} Occupied / {sec.total} Total</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Simulation Event Stream */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>Simulation Event Stream</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                ACTIVE CYCLES
              </span>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 text-xs">
              {recentEvents.slice(0, 10).map((ev) => (
                <div
                  key={ev.id}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2.5"
                >
                  <Car className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span className="font-mono font-bold">{ev.bayId}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{ev.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Dispute bay state?</span>
            <button
              onClick={() => openFeedbackModal()}
              className="text-amber-400 hover:text-amber-300 font-semibold"
            >
              Report Status Dispute &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
