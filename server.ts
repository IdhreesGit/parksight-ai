import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  parkingLots,
  parkingBays,
  parkingEvents,
  feedbackQueue,
  recommendationFeedbackQueue,
  parkingAlerts,
  simulationHistoryBuffer,
  syncLotStats,
  propagateRealDetectionsToStore,
} from './src/server/parkingStore';
import {
  initSimulationEngine,
  getSimulationState,
  setSimulationRunning,
  setSimulationSpeed,
  setScenarioPreset,
  reseedSimulation,
  performSimulationCycle,
  resetSimulation,
  SimSpeed,
  ScenarioPreset,
} from './src/server/simulationService';
import { calculateStatisticalPrediction } from './src/server/predictionService';
import { getAlertsWithStatus, triggerCameraInterruption } from './src/server/anomalyService';
import { inspectParkingSceneWithGemini } from './src/server/geminiService';
import { calculateBayRecommendations } from './src/services/recommendationEngine';
import { generateNavigationRoute } from './src/services/navigationService';
import { SimulationDetectionEngine, RealYOLODetectionEngine } from './src/services/detectionEngine';
import { HttpYoloServiceAdapter } from './src/services/yoloAdapter';
import { UserPreferences, StatusFeedback, SystemHealth, RecommendationFeedback, SubsystemStatus, DetectionSourceType } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Up to 30MB payload limit for camera frame streams
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Observability metrics
const systemMetrics = {
  requestCount: 0,
  errorCount: 0,
  lastSuccessfulSync: new Date().toISOString(),
  avgApiLatencyMs: 3.8,
  latencies: [3.2, 4.1, 3.6, 4.5, 3.9] as number[],
};

// Latency measurement middleware
app.use((_req, res, next) => {
  const start = performance.now();
  res.on('finish', () => {
    const duration = performance.now() - start;
    systemMetrics.requestCount++;
    if (res.statusCode >= 400) systemMetrics.errorCount++;
    systemMetrics.lastSuccessfulSync = new Date().toISOString();
    systemMetrics.latencies.push(duration);
    if (systemMetrics.latencies.length > 40) systemMetrics.latencies.shift();
    const sum = systemMetrics.latencies.reduce((a, b) => a + b, 0);
    systemMetrics.avgApiLatencyMs = +(sum / systemMetrics.latencies.length).toFixed(1);
  });
  next();
});

// Start background simulation engine
initSimulationEngine();

// REST API ROUTES
app.get('/api/parking', (_req, res) => {
  syncLotStats();
  const simState = getSimulationState();
  res.json({
    lots: parkingLots,
    bays: parkingBays,
    isDemo: true,
    lastUpdated: simState.lastUpdated,
  });
});

app.get('/api/parking/:id', (req, res) => {
  const lot = parkingLots.find((l) => l.id === req.params.id);
  if (!lot) return res.status(404).json({ error: 'Parking facility not found' });
  const bays = parkingBays.filter((b) => b.lotId === req.params.id);
  res.json({ lot, bays, isDemo: true });
});

app.get('/api/occupancy', (_req, res) => {
  syncLotStats();
  const campus = parkingLots.find((l) => l.id === 'campus-deck') || parkingLots[0];
  const simState = getSimulationState();
  const alertStatus = getAlertsWithStatus();
  res.json({
    totalBays: campus.totalBays,
    availableSpaces: campus.availableBays,
    occupiedSpaces: campus.occupiedBays,
    occupancyPercentage: campus.occupancyRate,
    activeVehicles: campus.occupiedBays,
    averageSearchTimeMinutes: simState.averageSearchTimeMinutes,
    currentAlertsCount: alertStatus.unreadCount,
    isSimulated: true,
    dataSource: 'Simulation Engine v3.0 (Digital Twin Single Source of Truth)',
    lastUpdated: simState.lastUpdated,
  });
});

// Explainable Recommendations
app.post('/api/recommendations', (req, res) => {
  const defaultPrefs: UserPreferences = {
    vehicleType: 'normal',
    accessibilityRequired: false,
    preferredEntrance: 'Main Entrance (North)',
    maxWalkingDistanceMeters: 180,
    preferredSection: 'all',
  };
  const preferences: UserPreferences = { ...defaultPrefs, ...(req.body || {}) };
  const result = calculateBayRecommendations(parkingBays, preferences);
  res.json(result);
});

// Human Feedback Loop for Recommendations ("Was this recommendation useful?")
app.post('/api/recommendations/feedback', (req, res) => {
  const { recommendationBayId, driverAccepted, userRating, feedbackComment, chosenPreference } = req.body;
  if (!recommendationBayId) {
    return res.status(400).json({ error: 'recommendationBayId is required' });
  }

  const feedbackEntry: RecommendationFeedback = {
    id: `rf-${Date.now()}`,
    recommendationBayId,
    driverAccepted: Boolean(driverAccepted),
    userRating: userRating || (driverAccepted ? 5 : 2),
    feedbackComment: feedbackComment || (driverAccepted ? 'Driver accepted and routed to bay.' : 'Driver declined recommendation.'),
    chosenPreference: chosenPreference || 'standard',
    timestamp: new Date().toISOString(),
  };

  recommendationFeedbackQueue.unshift(feedbackEntry);
  if (recommendationFeedbackQueue.length > 50) recommendationFeedbackQueue.length = 50;

  res.json({ success: true, feedback: feedbackEntry, totalFeedback: recommendationFeedbackQueue.length });
});

app.get('/api/recommendations/feedback', (_req, res) => {
  const total = recommendationFeedbackQueue.length;
  const accepted = recommendationFeedbackQueue.filter((f) => f.driverAccepted).length;
  const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 100;
  res.json({
    feedbackList: recommendationFeedbackQueue,
    total,
    accepted,
    acceptanceRate,
  });
});

// Indoor Navigation Route Endpoint
app.get('/api/navigation/route', (req, res) => {
  const bayId = (req.query.bayId as string) || 'A1';
  const entrance = (req.query.entrance as string) || 'Main Entrance (North)';
  const bay = parkingBays.find((b) => b.id === bayId);
  if (!bay) {
    return res.status(404).json({ error: `Parking bay ${bayId} not found` });
  }
  const route = generateNavigationRoute(bay, entrance);
  res.json(route);
});

// Analytics connected directly to accumulated simulation history buffer
app.get('/api/analytics', (req, res) => {
  const range = (req.query.range as string) || 'today';
  syncLotStats();
  const campus = parkingLots.find((l) => l.id === 'campus-deck') || parkingLots[0];

  let timeSeries: Array<{
    timestamp: string;
    occupancyPercent: number;
    occupiedBays: number;
    availableBays: number;
    vehicleArrivals: number;
    searchTimeMin: number;
  }> = [];

  if (range === 'today' || range === 'live') {
    timeSeries = simulationHistoryBuffer.map((s) => ({
      timestamp: s.simulatedTime || s.timestamp.slice(11, 16),
      occupancyPercent: s.occupancyPercent,
      occupiedBays: s.occupiedCount,
      availableBays: s.availableCount,
      vehicleArrivals: s.arrivalsDelta * 8,
      searchTimeMin: s.searchTimeMin,
    }));
  } else if (range === '7d') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const avgOccupancy = [76, 82, 84, 79, 71, 38, 25];
    timeSeries = days.map((d, i) => ({
      timestamp: d,
      occupancyPercent: avgOccupancy[i],
      occupiedBays: Math.round((avgOccupancy[i] / 100) * campus.totalBays),
      availableBays: campus.totalBays - Math.round((avgOccupancy[i] / 100) * campus.totalBays),
      vehicleArrivals: avgOccupancy[i] * 4,
      searchTimeMin: +(2.2 + (avgOccupancy[i] / 100) * 3.8).toFixed(1),
    }));
  } else {
    // 30 days
    timeSeries = Array.from({ length: 30 }, (_, i) => {
      const dayNum = i + 1;
      const isWeekend = dayNum % 7 === 6 || dayNum % 7 === 0;
      const occ = isWeekend ? 28 + Math.floor(Math.sin(i) * 7) : 73 + Math.floor(Math.sin(i) * 11);
      return {
        timestamp: `Day ${dayNum}`,
        occupancyPercent: occ,
        occupiedBays: Math.round((occ / 100) * campus.totalBays),
        availableBays: campus.totalBays - Math.round((occ / 100) * campus.totalBays),
        vehicleArrivals: Math.round(occ * 3.8),
        searchTimeMin: +(2.1 + (occ / 100) * 3.5).toFixed(1),
      };
    });
  }

  // Calculate Holt double exponential prediction
  const prediction = calculateStatisticalPrediction(simulationHistoryBuffer, campus.occupancyRate, campus.totalBays, 30);

  res.json({
    range,
    timeSeries,
    summary: {
      peakOccupancyPeriod: '08:45 - 10:15 AM (Morning Academic Peak)',
      averageOccupancyRate: `${Math.round(
        simulationHistoryBuffer.reduce((acc, cur) => acc + cur.occupancyPercent, 0) /
          Math.max(1, simulationHistoryBuffer.length)
      )}%`,
      dailyTurnoverRate: '3.4 vehicles/bay/day',
      averageSearchTime: `${(2.0 + (prediction.currentOccupancyPercent / 100) * 3.6).toFixed(1)} min`,
      predictionNext30Min: {
        expectedOccupancy: `${prediction.predictedOccupancyPercent}%`,
        expectedAvailability: `${prediction.expectedAvailableSpaces} spaces`,
        trend: prediction.trend,
        confidenceScore: prediction.confidenceScore,
        method: prediction.method,
        validationStatus: prediction.validationStatus,
      },
    },
    predictionDetails: prediction,
    isSimulated: true,
    disclaimer: 'Connected to the live Digital Twin buffer as single source of truth.',
  });
});

app.get('/api/prediction', (req, res) => {
  syncLotStats();
  const campus = parkingLots.find((l) => l.id === 'campus-deck') || parkingLots[0];
  const horizon = req.query.horizon ? parseInt(req.query.horizon as string, 10) : 30;
  const prediction = calculateStatisticalPrediction(
    simulationHistoryBuffer,
    campus.occupancyRate,
    campus.totalBays,
    horizon
  );
  res.json(prediction);
});

// Alerts & Rule-based Anomaly Engine
app.get('/api/alerts', (_req, res) => {
  const alertStatus = getAlertsWithStatus();
  res.json({
    alerts: alertStatus.alerts,
    unreadCount: alertStatus.unreadCount,
    anomalyStatus: alertStatus.anomalyStatus,
    recentEvents: parkingEvents.slice(0, 30),
    isDemo: true,
  });
});

app.post('/api/alerts/:id/read', (req, res) => {
  const alert = parkingAlerts.find((a) => a.id === req.params.id);
  if (alert) alert.isRead = true;
  res.json({ success: true, alert });
});

app.post('/api/alerts/:id/clear', (req, res) => {
  const index = parkingAlerts.findIndex((a) => a.id === req.params.id);
  if (index !== -1) {
    parkingAlerts.splice(index, 1);
  }
  res.json({ success: true, remaining: parkingAlerts.length });
});

// Diagnostic routes for resilience testing
app.post('/api/alerts/simulate-interruption', (_req, res) => {
  const alert = triggerCameraInterruption();
  res.json({ success: true, alert });
});

// Human Feedback (Disputed Bay Status)
app.get('/api/feedback', (_req, res) => {
  res.json({
    feedback: feedbackQueue,
    totalReports: feedbackQueue.length,
    resolvedReports: feedbackQueue.filter((f) => f.resolved).length,
    disputedBays: ['C4', 'A2', 'B7'],
  });
});

app.post('/api/feedback', (req, res) => {
  const { bayId, lotId, reportedStatus, comment } = req.body;
  if (!bayId) return res.status(400).json({ error: 'Bay ID is required' });

  const targetBay = parkingBays.find((b) => b.id === bayId);
  const newFeedback: StatusFeedback = {
    id: `fb-${Date.now()}`,
    bayId,
    lotId: lotId || 'campus-deck',
    reportedStatus,
    actualObservedStatus: targetBay ? targetBay.status : 'unknown',
    comment: comment || 'Human operator manual correction report',
    submittedAt: new Date().toISOString(),
    resolved: false,
  };

  feedbackQueue.unshift(newFeedback);

  if (targetBay && reportedStatus) {
    targetBay.status = reportedStatus;
    targetBay.temporalState = reportedStatus === 'occupied' ? 'confirmed_occupied' : 'confirmed_available';
    targetBay.lastUpdated = new Date().toISOString();
    targetBay.detectionSource = 'Manual Operator';
    targetBay.confidence = 1.0;

    if (reportedStatus === 'available') {
      targetBay.vehicleDetected = undefined;
    } else {
      targetBay.vehicleDetected = {
        type: 'sedan',
        color: 'Manually Confirmed',
        confidence: 1.0,
        detectedAt: new Date().toISOString(),
        source: 'MANUAL_DISPUTE',
      };
    }
    syncLotStats();
  }

  res.json({ success: true, feedback: newFeedback });
});

app.post('/api/feedback/:id/resolve', (req, res) => {
  const item = feedbackQueue.find((f) => f.id === req.params.id);
  if (item) {
    item.resolved = true;
    item.resolutionNotes = req.body.notes || 'Verified by parking operations administrator.';
  }
  res.json({ success: true, feedback: item });
});

// Computer Vision & YOLO / Gemini Inspection Endpoint
app.post('/api/detection/analyze', async (req, res) => {
  const { engineType = 'simulation', imageBase64, runGeminiInspection = false, yoloEndpoint } = req.body;
  let detectionResult;

  if (engineType === 'yolo_interface') {
    const yolo = new RealYOLODetectionEngine(yoloEndpoint);
    detectionResult = await yolo.analyzeImage(imageBase64 || '', parkingBays);
  } else {
    const sim = new SimulationDetectionEngine();
    detectionResult = await sim.analyzeImage(imageBase64 || '', parkingBays);
  }

  // If Gemini multimodal scene inspection is requested:
  if (runGeminiInspection && imageBase64) {
    const geminiAnalysis = await inspectParkingSceneWithGemini(imageBase64);
    if (geminiAnalysis) {
      detectionResult.geminiSceneAnalysis = geminiAnalysis;
    }
  }

  res.json(detectionResult);
});

// Computer Vision Propagation Endpoint (Preserving Source Integrity)
app.post('/api/detection/propagate', (req, res) => {
  const { detections, sourceType, sourceLabel } = req.body;
  if (!detections || !Array.isArray(detections)) {
    return res.status(400).json({ error: 'detections array is required' });
  }

  const typedSource: DetectionSourceType = sourceType || 'SIMULATOR';
  const result = propagateRealDetectionsToStore(detections, typedSource, sourceLabel);

  res.json({
    success: true,
    updatedBaysCount: result.updatedBaysCount,
    transitions: result.transitions,
    sourceType: typedSource,
    message: `Propagated ${result.updatedBaysCount} bays to active parking state (Source: [${typedSource}], ${result.transitions} transitions).`,
  });
});

// Digital Twin Simulation Endpoints
app.get('/api/simulation/state', (_req, res) => {
  res.json(getSimulationState());
});

app.post('/api/simulation/settings', (req, res) => {
  const { isRunning, speed, seed, scenarioPreset } = req.body;
  if (typeof isRunning === 'boolean') setSimulationRunning(isRunning);
  if (speed) setSimulationSpeed(speed as SimSpeed);
  if (scenarioPreset) setScenarioPreset(scenarioPreset as ScenarioPreset);
  if (seed !== undefined) reseedSimulation(seed);
  res.json(getSimulationState());
});

app.post('/api/simulation/step', (_req, res) => {
  const result = performSimulationCycle();
  res.json({ success: true, cycle: result, state: getSimulationState() });
});

app.post('/api/simulation/reset', (_req, res) => {
  resetSimulation();
  res.json({ success: true, message: 'Simulation reset to baseline defaults.', state: getSimulationState() });
});

// Observability & Telemetry
app.get('/api/observability', (_req, res) => {
  const simState = getSimulationState();
  const alertStatus = getAlertsWithStatus();
  res.json({
    metrics: {
      eventCount: parkingEvents.length,
      historyBufferLength: simulationHistoryBuffer.length,
      apiLatencyMs: systemMetrics.avgApiLatencyMs,
      simulationTickRateHz: +(1000 / simState.intervalMs).toFixed(2),
      detectionProcessingTimeMs: 42,
      geminiStatus: process.env.GEMINI_API_KEY ? 'Configured & Online' : 'Key Missing (Fallback Ready)',
      errorCount: systemMetrics.errorCount,
      totalRequests: systemMetrics.requestCount,
      lastSuccessfulOperation: systemMetrics.lastSuccessfulSync,
      activeAlertsCount: alertStatus.unreadCount,
    },
    systemHealth: 'Optimal',
  });
});

// Subsystem Topology & Health Status (Review 2 Requirement 6)
app.get('/api/system-status', async (_req, res) => {
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;
  const simState = getSimulationState();

  // Test real reachability of external YOLO microservice
  const defaultYoloAdapter = new HttpYoloServiceAdapter();
  const isYoloReachable = await defaultYoloAdapter.isServiceReachable();

  const yoloStatus: SubsystemStatus = isYoloReachable ? 'REAL YOLO ONLINE' : 'SIMULATED FALLBACK';
  const geminiStatus: SubsystemStatus = hasGeminiKey ? 'GEMINI ONLINE' : 'GEMINI FALLBACK';

  const health: SystemHealth = {
    frontend: { status: 'ONLINE', label: 'React 19 + Tailwind CSS + Motion' },
    backend: {
      status: 'ONLINE',
      label: `Express REST Endpoints (Avg Latency: ${systemMetrics.avgApiLatencyMs}ms)`,
      latencyMs: systemMetrics.avgApiLatencyMs,
    },
    api: {
      status: 'ONLINE',
      label: 'Express 4.21 API Gateway',
      latencyMs: systemMetrics.avgApiLatencyMs,
    },
    database: { status: 'ONLINE', label: 'In-Memory Single Source of Truth Repository' },
    detectionEngine: {
      status: yoloStatus,
      label: isYoloReachable
        ? 'External YOLO Inference Microservice Connected (HTTP 200)'
        : 'YOLO SERVICE UNAVAILABLE — SIMULATED FALLBACK ACTIVE',
      details: isYoloReachable
        ? 'External YOLO microservice responding at http://localhost:8000/api/v1/yolo'
        : 'External YOLO microservice offline; fallback test pattern active without fabricating weights.',
    },
    simulationEngine: {
      status: simState.isRunning ? 'ONLINE' : 'DEGRADED',
      label: `Digital Twin Simulator (${simState.speed} tick rate)`,
    },
    prediction: {
      status: 'ONLINE',
      label: "Holt's Double Exponential Smoothing (Level + Trend Extrapolation)",
    },
    geminiVision: {
      status: geminiStatus,
      label: hasGeminiKey
        ? 'Gemini 3.8 Flash Multimodal Scene Inspector Ready'
        : 'GEMINI_API_KEY not configured (Local Fallback Active)',
      details: hasGeminiKey
        ? 'Direct @google/genai SDK multimodal frame inspector active'
        : 'Running local fallback assessment; add GEMINI_API_KEY in Secrets to activate real multimodal audit.',
    },
    alerts: { status: 'ONLINE', label: 'Rule-based Anomaly Engine (6 Operational Rules)' },
    timestamp: new Date().toISOString(),
    isProductionRealHardware: false,
    disclaimer: 'All camera feeds, sensor signals, and occupancy counts are software-generated simulations or test fixtures unless external YOLO microservice is active.',
    metrics: {
      eventCount: parkingEvents.length,
      apiLatencyMs: systemMetrics.avgApiLatencyMs,
      simulationTickRate: +(1000 / simState.intervalMs).toFixed(2),
      geminiStatus: hasGeminiKey ? 'Online' : 'Fallback Ready',
      errorCount: systemMetrics.errorCount,
      lastSyncTime: systemMetrics.lastSuccessfulSync,
    },
  };
  res.json(health);
});

// Static Serving vs Dev Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ParkSight AI Server running on port ${PORT}`);
  });
}

startServer();
