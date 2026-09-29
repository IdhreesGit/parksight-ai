import React, { useState, useRef, useEffect } from 'react';
import {
  ScanEye,
  Camera,
  Upload,
  Sparkles,
  Layers,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Info,
  Radio,
  FileImage,
  ArrowRight,
  Video,
  Play,
  Pause,
  RotateCw,
  Eye,
  Send,
  Zap,
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';
import { analyzeDetectionImage, propagateDetections } from '../../services/api';
import { DetectionResult, BoundingBox, DetectionSourceType } from '../../types';

export const AIDetectionView: React.FC = () => {
  const { bays, propagateRealDetections, systemMode } = useParking();

  const [activeEngine, setActiveEngine] = useState<'simulation' | 'yolo_interface'>('yolo_interface');
  const [yoloEndpoint, setYoloEndpoint] = useState('http://localhost:8000/api/v1/yolo/detect');
  const [inputType, setInputType] = useState<'sample' | 'upload' | 'camera'>('sample');
  const [selectedSample, setSelectedSample] = useState<string>('sample-day');
  const [customImage, setCustomImage] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [runGeminiAssessment, setRunGeminiAssessment] = useState(true);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [propagationNotice, setPropagationNotice] = useState<string | null>(null);
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Generate realistic high-fidelity SVG frame payload for reproducible test presets
  const getSampleImageDataUri = (type: string): string => {
    const isNight = type === 'sample-night';
    const isRain = type === 'sample-rain';
    const bgColor = isNight ? '#0b1120' : isRain ? '#1e293b' : '#334155';
    const roadColor = isNight ? '#020617' : '#0f172a';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
      <rect width="640" height="360" fill="${bgColor}"/>
      <rect x="30" y="30" width="580" height="300" fill="${roadColor}" rx="10"/>
      <!-- Parking Slot Painted Boundaries -->
      <line x1="80" y1="50" x2="80" y2="180" stroke="#94a3b8" stroke-width="2.5" stroke-dasharray="6,4"/>
      <line x1="180" y1="50" x2="180" y2="180" stroke="#94a3b8" stroke-width="2.5" stroke-dasharray="6,4"/>
      <line x1="280" y1="50" x2="280" y2="180" stroke="#94a3b8" stroke-width="2.5" stroke-dasharray="6,4"/>
      <line x1="380" y1="50" x2="380" y2="180" stroke="#94a3b8" stroke-width="2.5" stroke-dasharray="6,4"/>
      <line x1="480" y1="50" x2="480" y2="180" stroke="#94a3b8" stroke-width="2.5" stroke-dasharray="6,4"/>
      <line x1="580" y1="50" x2="580" y2="180" stroke="#94a3b8" stroke-width="2.5" stroke-dasharray="6,4"/>

      <!-- Actual Vehicles in bays with varying colors -->
      <rect x="95" y="65" width="70" height="95" rx="8" fill="#38bdf8"/>
      <text x="130" y="115" fill="#ffffff" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">SEDAN</text>

      <rect x="295" y="65" width="70" height="95" rx="8" fill="#f43f5e"/>
      <text x="330" y="115" fill="#ffffff" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">SUV</text>

      <rect x="495" y="65" width="70" height="95" rx="8" fill="#e2e8f0"/>
      <text x="530" y="115" fill="#0f172a" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">EV</text>

      <!-- Driving lane markings -->
      <line x1="50" y1="230" x2="590" y2="230" stroke="#eab308" stroke-width="2" stroke-dasharray="10,8"/>

      <text x="45" y="24" fill="#94a3b8" font-family="sans-serif" font-size="11" font-weight="bold">
        PARKSIGHT CCTV CAM-04 &bull; NORTH DECK &bull; 640x360x3 &bull; ${type.toUpperCase()}
      </text>
    </svg>`;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const currentImagePayload =
    inputType === 'upload' && customImage
      ? customImage
      : getSampleImageDataUri(selectedSample);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomImage(reader.result as string);
        setInputType('upload');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setPropagationNotice(null);
    try {
      const result = await analyzeDetectionImage(
        activeEngine,
        currentImagePayload,
        runGeminiAssessment,
        yoloEndpoint
      );
      setDetectionResult(result);
      drawDetectionsOnCanvas(result);
    } catch (err) {
      console.error('Detection analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePropagate = async () => {
    if (!detectionResult || !detectionResult.detections) return;
    try {
      const sourceToUse: DetectionSourceType =
        detectionResult.source ||
        (activeEngine === 'yolo_interface' && detectionResult.serviceAvailable && !detectionResult.isFallbackActive
          ? 'YOLO_REAL'
          : 'SIMULATOR');
      const labelToUse =
        detectionResult.statusLabel ||
        (sourceToUse === 'YOLO_REAL' ? 'Real YOLO Inference' : 'Simulation Fallback');

      await propagateRealDetections(
        detectionResult.detections,
        sourceToUse,
        labelToUse
      );
      setPropagationNotice(
        `Successfully propagated ${detectionResult.occupiedCount} occupied and ${detectionResult.availableCount} available spaces to live dashboard, alerts & recommendations! Source: [${sourceToUse}]`
      );
    } catch (err) {
      console.error('Propagation failed:', err);
    }
  };

  useEffect(() => {
    handleAnalyze();
  }, [activeEngine, inputType, selectedSample]);

  // Draw overlay onto canvas
  const drawDetectionsOnCanvas = (result: DetectionResult) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dark backdrop
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scaleX = canvas.width / 100;
    const scaleY = canvas.height / 100;

    // Draw bays and detected vehicles
    result.detections.forEach((box) => {
      const x = box.x * scaleX;
      const y = box.y * scaleY;
      const w = box.width * scaleX;
      const h = box.height * scaleY;

      ctx.lineWidth = 1.8;

      if (box.isOccupied) {
        ctx.strokeStyle = '#f43f5e';
        ctx.fillStyle = 'rgba(244, 63, 94, 0.18)';
      } else if (box.label.includes('Unknown') || box.label.includes('Low Confidence')) {
        ctx.strokeStyle = '#eab308';
        ctx.fillStyle = 'rgba(234, 179, 8, 0.15)';
      } else {
        ctx.strokeStyle = '#10b981';
        ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
      }

      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);

      // Label tag
      const tagColor = box.isOccupied ? '#f43f5e' : box.label.includes('Unknown') ? '#eab308' : '#10b981';
      ctx.fillStyle = tagColor;
      ctx.font = '10px monospace';
      const label = box.label;
      const textWidth = ctx.measureText(label).width;
      ctx.fillRect(x, Math.max(0, y - 14), textWidth + 8, 14);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, x + 4, Math.max(10, y - 3));
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* SECTION 1: WORKSPACE HEADER & HONEST STATUS */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ScanEye className="w-5 h-5 text-cyan-400" />
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Computer Vision &amp; Parking Occupancy Engine
            </h1>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                detectionResult?.isFallbackActive
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : detectionResult?.mode === 'REAL'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : activeEngine === 'yolo_interface'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
              }`}
            >
              {detectionResult?.isFallbackActive
                ? 'YOLO SERVICE UNAVAILABLE — SIMULATED FALLBACK ACTIVE'
                : detectionResult?.mode === 'REAL'
                ? 'REAL YOLO ONLINE'
                : activeEngine === 'yolo_interface'
                ? 'YOLO SERVICE UNAVAILABLE — SIMULATED FALLBACK ACTIVE'
                : 'SIMULATED DEMO PIPELINE'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real computer vision pipeline: image ingest, pre-processing, vehicle detection, spatial bay IoU polygon matching, and temporal state propagation.
          </p>
        </div>

        {/* Engine Switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start lg:self-auto">
          <span className="text-xs text-slate-400 px-2 flex items-center gap-1 font-medium">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Engine:
          </span>
          <button
            onClick={() => setActiveEngine('yolo_interface')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeEngine === 'yolo_interface'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Real YOLO Adapter
          </button>
          <button
            onClick={() => setActiveEngine('simulation')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeEngine === 'simulation'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Simulated Engine
          </button>
        </div>
      </div>

      {/* SECTION 2: INPUT SOURCE & PIPELINE CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Source Picker */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
          <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider">
            1. Image / Video Frame Source
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setInputType('sample')}
              className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                inputType === 'sample'
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-600 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <FileImage className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
              <span>Camera Preset</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                inputType === 'upload'
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-600 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Upload className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
              <span>Upload Image</span>
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          {inputType === 'sample' && (
            <div className="space-y-1.5 pt-1">
              <label className="text-slate-400">Environment Condition:</label>
              <select
                value={selectedSample}
                onChange={(e) => setSelectedSample(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 rounded-xl px-3 py-1.5 border border-slate-800 font-mono text-[11px]"
              >
                <option value="sample-day">Camera 04 - Clear Daylight (High Contrast)</option>
                <option value="sample-rain">Camera 04 - Overcast &amp; Wet Surface</option>
                <option value="sample-night">Camera 04 - Night / Low Illumination</option>
              </select>
            </div>
          )}

          {inputType === 'upload' && customImage && (
            <div className="p-2 rounded-xl bg-slate-950 text-emerald-400 flex items-center gap-2 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Genuine image payload loaded</span>
            </div>
          )}
        </div>

        {/* Engine Endpoint & Multimodal Toggle */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
          <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider">
            2. Remote Inference Configuration
          </span>
          {activeEngine === 'yolo_interface' ? (
            <div className="space-y-2">
              <label className="text-slate-400 block text-[11px]">Remote Microservice Endpoint URL:</label>
              <input
                type="text"
                value={yoloEndpoint}
                onChange={(e) => setYoloEndpoint(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 rounded-xl px-3 py-1.5 border border-slate-800 font-mono text-[11px]"
              />
              <p className="text-[10px] text-slate-500">
                Sends full un-truncated base64 JSON payload. Will fall back safely to edge analyzer if offline.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 text-slate-300">
              <p className="text-[11px] text-slate-400">
                Deterministic Synthetic Computer Vision: Calculates bay vacancy via polygon intersection (IoU) with campus deck telemetry.
              </p>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300">
                IoU Threshold: &ge; 0.45 Occupied &bull; &le; 0.20 Available
              </div>
            </div>
          )}

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
              <input
                type="checkbox"
                checked={runGeminiAssessment}
                onChange={(e) => setRunGeminiAssessment(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-cyan-600 focus:ring-0"
              />
              <span>Multimodal Gemini 3.8 Flash Scene Inspection</span>
            </label>
          </div>
        </div>

        {/* Execution & Propagation Control */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between text-xs space-y-3">
          <div>
            <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider mb-1.5">
              3. Execution &amp; Pipeline Propagation
            </span>
            <p className="text-slate-400 text-[11px]">
              Execute computer vision frame extraction, bounding box inference, and optionally propagate directly to the live parking state.
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className={`w-full py-2 px-4 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center gap-2 transition-all ${
                isAnalyzing ? 'bg-slate-700 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Processing Frame...</span>
                </>
              ) : (
                <>
                  <ScanEye className="w-4 h-4" />
                  <span>Run Frame Inference</span>
                </>
              )}
            </button>

            {detectionResult && (
              <button
                onClick={handlePropagate}
                className="w-full py-2 px-4 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 shadow-sm flex items-center justify-center gap-2 transition-all"
                title="Propagate detections into live parking bays, dashboard, alerts & recommendations"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Propagate to Live State</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Propagation Notice Banner */}
      {propagationNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{propagationNotice}</span>
        </div>
      )}

      {/* SECTION 3 & 4: DETECTION VISUAL OVERLAY & RESULTS SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detection Canvas (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white">Detection &amp; Spatial IoU Overlay</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                640x360 RESOLUTION
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Latency: {detectionResult?.processingTimeMs || 0}ms
            </span>
          </div>

          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={640}
              height={360}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2.5 h-2.5 rounded bg-rose-500/20 border border-rose-500" /> Occupied Vehicle
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500" /> Vacant Stall
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500" /> Low Confidence / Unknown
              </span>
            </div>
            <span className="font-mono">Timestamp: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Results & Gemini Multimodal Audit (1 col) */}
        <div className="space-y-4">
          {/* Classification Results */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
            <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider">
              4. Occupancy Classification Results
            </span>

            {detectionResult ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Occupied</span>
                    <span className="text-lg font-bold text-rose-400 font-mono">
                      {detectionResult.occupiedCount}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Available</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">
                      {detectionResult.availableCount}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Indeterminate</span>
                    <span className="text-lg font-bold text-amber-400 font-mono">
                      {detectionResult.unknownCount || 0}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  {detectionResult.summaryText}
                </p>
              </div>
            ) : (
              <p className="text-slate-400">Run frame inference to view classification breakdown.</p>
            )}
          </div>

          {/* Multimodal Gemini Scene Audit */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>5. Gemini Vision Scene Audit</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                GEMINI 3.8 FLASH
              </span>
            </div>

            {detectionResult?.geminiSceneAnalysis ? (
              <div className="space-y-2 text-slate-300">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lighting:</span>
                    <span className="text-slate-200 font-medium">{detectionResult.geminiSceneAnalysis.lighting}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Surface / Weather:</span>
                    <span className="text-slate-200 font-medium">{detectionResult.geminiSceneAnalysis.weather}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Obstructions:</span>
                    <span className="text-slate-200 font-medium">{detectionResult.geminiSceneAnalysis.obstructions}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-900">
                    <span className="text-slate-400">CV Reliability:</span>
                    <span className="text-emerald-400 font-bold">{detectionResult.geminiSceneAnalysis.detectionReliability}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-200">
                  <strong className="block text-cyan-300 mb-0.5">Multimodal Notes:</strong>
                  {detectionResult.geminiSceneAnalysis.notes}
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-[11px]">
                Multimodal scene analysis requires enabling the Gemini toggle and analyzing a frame.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
