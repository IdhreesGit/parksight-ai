import React, { useState } from 'react';
import {
  GitBranch,
  Camera,
  Layers,
  Sliders,
  Cpu,
  ScanEye,
  CheckCircle2,
  Server,
  Sparkles,
  Layout,
  Activity,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface StageDetail {
  step: string;
  title: string;
  icon: any;
  category: string;
  summary: string;
  input: string;
  method: string;
  output: string;
  latency: string;
  failsafe: string;
  digitalTwinRole: string;
}

export const HowItWorksView: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<number>(6); // Default to Stage 7 (Temporal State Machine)

  const stages: StageDetail[] = [
    {
      step: '01',
      title: 'Camera & Video Acquisition',
      icon: Camera,
      category: 'Hardware Sensing',
      summary: 'Overhead RTSP IP cameras (1080p, 15-30 FPS, wide angle / fisheye corrected) mounted at 4-6 meter elevations covering 8-16 bays per optical sensor.',
      input: 'Optical photons hitting CMOS camera sensor in parking garage ceiling.',
      method: 'RTSP H.264/H.265 encoded stream capture over PoE Gigabit switch.',
      output: 'Continuous compressed network video stream (rtsp://cam04.local/live).',
      latency: '15 - 33 ms per frame capture.',
      failsafe: 'Automatic fallback to heartbeat ping and synthetic digital twin simulation if connection drops.',
      digitalTwinRole: 'Generates realistic diurnal vehicle arrivals and Poisson ingress distributions during simulation mode.',
    },
    {
      step: '02',
      title: 'Frame Capture & Normalization',
      icon: Layers,
      category: 'Ingest & Scaling',
      summary: 'FFmpeg/GStreamer pipeline decodes frames and scales them to fixed 640x360 tensor shapes with zero aspect distortion.',
      input: 'RTSP video stream chunks.',
      method: 'Hardware-accelerated decode (NVDEC/VA-API), letterbox padding to 640x360x3 RGB tensor.',
      output: 'Normalized float32 / uint8 numpy array [1, 3, 360, 640].',
      latency: '8 - 14 ms decode latency.',
      failsafe: 'Frame-dropping logic ensures real-time latency does not backlog during GPU saturation.',
      digitalTwinRole: 'Provides synthetic test SVG/Canvas frames rendered in memory without external camera hardware.',
    },
    {
      step: '03',
      title: 'Pre-processing & Enhancement',
      icon: Sliders,
      category: 'Computer Vision',
      summary: 'CLAHE dynamically normalizes harsh glare, deep shadows, and wet pavement reflections.',
      input: 'Normalized 640x360 RGB tensor.',
      method: 'CLAHE contrast equalization, bilateral filtering for noise reduction, gamma correction.',
      output: 'Contrast-enhanced tensor optimized for convolutional edge detection.',
      latency: '4 - 7 ms on GPU.',
      failsafe: 'Pass-through untouched raw frame if pre-processing filter encounters out-of-range histogram values.',
      digitalTwinRole: 'Injects weather presets (Clear Daylight, Wet Pavement, Low Illumination Night) for robustness testing.',
    },
    {
      step: '04',
      title: 'Object Detection (YOLOv8 / ONNX)',
      icon: Cpu,
      category: 'Neural Inference',
      summary: 'Deep neural backbone extracts 2D vehicle bounding boxes, class labels (car, SUV, truck, motorcycle), and confidence values.',
      input: 'Pre-processed 640x360 image tensor.',
      method: 'YOLOv8n / YOLOv8s ONNX runtime with TensorRT optimization; Simulation Detection Engine in demo mode.',
      output: 'List of detections: [x_min, y_min, x_max, y_max, class_id, confidence_score].',
      latency: '12 - 28 ms (GPU) or simulated deterministic 210 ms.',
      failsafe: 'Returns honest Service Unavailable status if external model is offline without faking synthetic weights.',
      digitalTwinRole: 'Computes deterministic bounding boxes mapped to simulated parked vehicles in parkingStore.',
    },
    {
      step: '05',
      title: 'Bay Association & Polygon IoU',
      icon: ScanEye,
      category: 'Spatial Geometry',
      summary: 'Pre-calibrated 4-point geometric polygons defining each physical bay are intersected with vehicle bounding boxes.',
      input: 'Detected vehicle bounding boxes + Pre-surveyed 2D bay coordinate polygons.',
      method: 'Polygon Intersection-over-Union (IoU) and Shoelace formula overlap calculation.',
      output: 'Bay overlap percentage: Bay A3: 78% overlap, Bay A4: 3% overlap.',
      latency: '1 - 2 ms on CPU.',
      failsafe: 'Re-calibrates against anchor floor markers if camera angle undergoes slight vibration drift.',
      digitalTwinRole: 'Maintains vector slot coordinates for all 96 bays across Campus Central Deck.',
    },
    {
      step: '06',
      title: 'Occupancy Classification & Debouncing',
      icon: CheckCircle2,
      category: 'Classification',
      summary: 'Applies dual thresholding (IoU > 0.45 = Occupied candidate; IoU < 0.20 = Vacant candidate; 0.20-0.45 = Unknown/Low Confidence) to prevent edge ambiguity.',
      input: 'Bay overlap percentages per bay ID.',
      method: 'Schmitt trigger dual-threshold classification with pedestrian shadow rejection filter.',
      output: 'Classification flag: candidate_occupied vs candidate_available vs indeterminate.',
      latency: '< 1 ms.',
      failsafe: 'Default to last-known stable state if IoU falls in indeterminate hysteresis zone (0.20 - 0.45). Do not falsely mark as available.',
      digitalTwinRole: 'Provides ground-truth classification labels to benchmark against detection outputs.',
    },
    {
      step: '07',
      title: 'Temporal Stability State Machine',
      icon: Activity,
      category: 'Stability & Hysteresis',
      summary: 'Requires 3 consecutive confirmation cycles before transitioning from AVAILABLE to OCCUPIED, eliminating sensor flicker.',
      input: 'Raw classification stream over successive clock intervals.',
      method: 'Finite State Machine with hysteresis counter: confirmed_available <-> candidate_occupied <-> confirmed_occupied.',
      output: 'Debounced, verified bay status committed to authoritative in-memory store.',
      latency: 'Simulated 2 to 3 tick confirmation latency.',
      failsafe: 'Rolls back to previous confirmed state if vehicle departs before confirmation threshold is reached.',
      digitalTwinRole: 'Directly powers the live simulation state transitions visible in Digital Twin Command Center.',
    },
    {
      step: '08',
      title: 'Decision Engine & Anomaly Detection',
      icon: Server,
      category: 'Operations & Rules',
      summary: 'Evaluates global capacity spikes, double-parking infractions, unauthorized ADA stall usage, and dispatch notifications.',
      input: 'Authoritative bay status index + simulated clock time.',
      method: 'Mathematical threshold validation (rate-of-change delta > 15% / 60s) + rule engine.',
      output: 'Operations alerts, notification triggers, and live event log entries.',
      latency: '< 2 ms.',
      failsafe: 'Suppresses false alarm bursts if global network or camera cluster experiences power fluctuation.',
      digitalTwinRole: 'Simulates sudden morning arrival surges and triggers visible operations alerts.',
    },
    {
      step: '09',
      title: 'Recommendation & Routing Engine',
      icon: Sparkles,
      category: 'Driver Guidance',
      summary: 'Transparent 100-point multi-factor objective function ranks vacant bays and computes indoor walking routes for approaching drivers.',
      input: 'Driver preferences (EV, ADA, walking distance, preferred gate) + Available bays.',
      method: 'Additive multi-factor scoring: Availability (25) + Distance (25) + ADA (15) + EV (15) + Congestion (10) + Stability (10).',
      output: 'Ranked recommendations with turn-by-turn waypoint coordinates and transparent reason factors.',
      latency: '< 5 ms.',
      failsafe: 'Returns clear warning if zero bays satisfy hard constraints instead of routing to invalid spots.',
      digitalTwinRole: 'Continuously updates best match in real-time as simulation advances occupancy.',
    },
    {
      step: '10',
      title: 'Operational Dashboard & Feedback Loop',
      icon: Layout,
      category: 'Human-in-the-Loop',
      summary: 'Interactive 2D vector map, driver navigation, operator alerts, and crowd-sourced status dispute resolution.',
      input: 'Authoritative backend state + Human dispute submissions.',
      method: 'Responsive React 19 vector rendering, REST synchronization, dispute logging queue.',
      output: 'Live user interface, updated slot states, and active learning dispute log.',
      latency: 'Instantaneous optimistic UI update.',
      failsafe: 'Human driver dispute instantly overrides automated CV state for immediate operational correction.',
      digitalTwinRole: 'Receives user feedback and updates simulated bay state with audit history.',
    },
  ];

  const current = stages[selectedStage];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-cyan-400" />
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Interactive 10-Stage Computer Vision &amp; AI Architecture Pipeline
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
              REVIEW 2 ARCHITECTURE SPECIFICATION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Click any pipeline stage below to inspect mathematical methods, inputs/outputs, latency budgets, and fail-safe behaviors.
          </p>
        </div>
      </div>

      {/* TEMPORAL STABILITY STATE MACHINE DIAGRAM */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 border border-cyan-800/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Temporal Stability State Machine (Hysteresis Filter)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Solves the &ldquo;flickering bay&rdquo; defect caused by passing pedestrians, glare, or momentary camera occlusion.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800 self-start sm:self-auto">
            3-FRAME CONFIRMATION MANDATE
          </span>
        </div>

        {/* Visual State Transition Flow Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs pt-2">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-800/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400">1. CONFIRMED AVAILABLE</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-400">
              Slot is published as vacant. Drivers can be routed here.
            </p>
            <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-900">
              Trigger: IoU &lt; 0.20 confirmed
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-800/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400">2. CANDIDATE OCCUPIED</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">
              New vehicle detected. System enters holding buffer (Frame 1/3).
            </p>
            <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-900">
              Requires 3 successive frames
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-800/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-400">3. CONFIRMED OCCUPIED</span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            </div>
            <p className="text-[11px] text-slate-400">
              Vehicle fully settled. Bay is locked in database as occupied.
            </p>
            <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-900">
              Trigger: 3 frames &gt; 0.45 IoU
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-800/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-400">4. CANDIDATE AVAILABLE</span>
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">
              Vehicle departs. Validates clearance of egress path before reopening.
            </p>
            <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-900">
              Clears holding buffer
            </div>
          </div>
        </div>
      </div>

      {/* 10 STAGES INTERACTIVE PIPELINE SELECTOR */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {stages.map((st, idx) => {
          const isSelected = selectedStage === idx;
          const Icon = st.icon;
          return (
            <button
              key={st.step}
              onClick={() => setSelectedStage(idx)}
              className={`p-3 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? 'bg-cyan-950/80 border-cyan-500 shadow-md ring-1 ring-cyan-500/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px] font-bold text-cyan-400">
                  STAGE {st.step}
                </span>
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-300' : 'text-slate-500'}`} />
              </div>
              <div className="font-semibold text-white text-xs truncate">{st.title}</div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">{st.category}</div>
            </button>
          );
        })}
      </div>

      {/* SELECTED STAGE DEEP-DIVE INSPECTION CARD */}
      {current && (
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <current.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-cyan-400">STAGE {current.step}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {current.category}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">{current.title}</h3>
              </div>
            </div>
            <div className="text-right text-xs self-start sm:self-auto">
              <span className="text-slate-400 block text-[11px]">Latency Budget</span>
              <span className="font-mono font-bold text-emerald-400">{current.latency}</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {current.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <strong className="text-slate-200 block text-[11px] uppercase tracking-wider text-cyan-400">
                Input Payload
              </strong>
              <p className="text-slate-400">{current.input}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <strong className="text-slate-200 block text-[11px] uppercase tracking-wider text-emerald-400">
                Output Artifact
              </strong>
              <p className="text-slate-400">{current.output}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <strong className="text-slate-200 block text-[11px] uppercase tracking-wider text-amber-400">
                Method / Algorithm / Model
              </strong>
              <p className="text-slate-400">{current.method}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <strong className="text-slate-200 block text-[11px] uppercase tracking-wider text-rose-400">
                Fail-Safe &amp; Fallback Logic
              </strong>
              <p className="text-slate-400">{current.failsafe}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs space-y-1">
            <strong className="text-cyan-300 block text-[11px] uppercase tracking-wider">
              Role in Digital Twin Simulation:
            </strong>
            <p className="text-slate-300 leading-relaxed">
              {current.digitalTwinRole}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
