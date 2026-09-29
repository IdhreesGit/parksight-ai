/**
 * ParkSight AI - TypeScript Domain Types & Interfaces
 * Phase 2 Enterprise Academic Prototype Domain Model
 */

export type BayStatus = 'available' | 'occupied' | 'reserved' | 'maintenance' | 'unknown' | 'low_confidence';
export type BayType = 'standard' | 'ev' | 'accessible' | 'reserved' | 'maintenance';
export type VehicleType = 'normal' | 'ev';
export type SystemMode = 'REAL' | 'SIMULATED' | 'PROTOTYPE' | 'FUTURE';

// Temporal confirmation states for computer vision stability
export type TemporalState =
  | 'confirmed_available'
  | 'candidate_occupied'
  | 'confirmed_occupied'
  | 'candidate_available';

export interface VehicleDetectionInfo {
  type: 'sedan' | 'suv' | 'truck' | 'compact' | 'ev' | 'motorcycle' | 'bus';
  color?: string;
  confidence: number; // 0.0 - 1.0 (Detection / Inference Confidence)
  simulationCertainty?: number; // 0.0 - 1.0 (if simulated)
  detectedAt: string;
  plateMasked?: string; // Anonymized: "SIM-***42" or "PROT-***99"
  source: 'YOLO_REAL' | 'SIMULATOR' | 'MANUAL_DISPUTE' | 'CANVAS_CV';
}

export interface BayPolygonPoint {
  x: number; // Percentage coordinate (0 - 100%)
  y: number; // Percentage coordinate (0 - 100%)
}

export interface BayStateHistoryItem {
  status: BayStatus;
  temporalState?: TemporalState;
  consecutiveHits?: number;
  timestamp: string;
  reason: string;
  duration?: string;
  confidence?: number;
}

export interface ParkingBay {
  id: string; // e.g. "A1", "A2", "B4"
  lotId: string;
  section: string; // "North Deck", "South Wing", "East Annex", "West Deck"
  row: string; // "A", "B", "C", "D", "E", "F"
  level: number; // 1 (Ground), 2 (Upper)
  type: BayType;
  status: BayStatus;
  temporalState?: TemporalState;
  consecutiveHits?: number; // Multi-frame temporal counter (e.g. 1/3, 2/3, 3/3)
  requiredHits?: number; // Threshold frames for confirmation (default 3)
  confidence?: number; // 0.0 - 1.0
  distanceToEntranceMeters: number;
  estimatedWalkingMinutes: number;
  lastUpdated: string;
  vehicleDetected?: VehicleDetectionInfo;
  detectionSource?: 'Simulation Engine' | 'Real YOLO Inference' | 'Canvas Vision Analyzer' | 'Manual Operator';
  sourceType?: DetectionSourceType;
  isSimulated?: boolean;
  // 2D Normalized Coordinates (0 - 100%)
  x: number;
  y: number;
  width: number;
  height: number;
  polygon?: BayPolygonPoint[];
  history?: BayStateHistoryItem[];
}

export interface ParkingLot {
  id: string;
  name: string;
  location: string;
  totalBays: number;
  availableBays: number;
  occupiedBays: number;
  reservedBays: number;
  maintenanceBays: number;
  occupancyRate: number; // percentage (0 - 100)
  status: 'optimal' | 'moderate' | 'high_occupancy' | 'full';
  levels: number;
  entrances: string[];
  operatingHours: string;
  ratePerHour: string;
  amenities: string[];
  isDemo: boolean;
}

export interface UserPreferences {
  vehicleType: VehicleType;
  accessibilityRequired: boolean;
  preferredEntrance: string;
  maxWalkingDistanceMeters: number;
  preferredSection: string;
  strictConstraintsOnly?: boolean;
}

export interface RecommendationScoreBreakdown {
  availabilityWeight: number; // 0 or 25 points baseline
  distanceWeight: number; // up to 25 points (normalized decay from chosen entrance)
  accessibilityWeight: number; // up to 15 points (strict ADA match)
  bayTypePreference: number; // up to 15 points (EV charging match / penalty)
  sectionCongestionScore: number; // up to 10 points (lower congestion = higher score)
  bayStabilityBonus: number; // up to 10 points (temporal confirmation stability)
}

export interface NavigationStep {
  stepNumber: number;
  instruction: string;
  distanceMeters: number;
  checkpoint: string;
}

export interface NavigationRoute {
  entrance: string;
  destinationBayId: string;
  totalDistanceMeters: number;
  estimatedWalkingMinutes: number;
  steps: NavigationStep[];
  waypoints: Array<{ x: number; y: number; label?: string }>;
}

export interface RecommendationResult {
  bay: ParkingBay;
  totalScore: number; // 0 to 100 (Prototype Score)
  breakdown: RecommendationScoreBreakdown;
  reasons: string[];
  rank: number;
  isAlternative?: boolean;
  navigationRoute?: NavigationRoute;
}

export interface RecommendationResponse {
  preferences: UserPreferences;
  totalEligible: number;
  bestMatch: RecommendationResult | null;
  alternatives: RecommendationResult[];
  algorithm: string;
  scoreType: 'PROTOTYPE HEURISTIC SCORE';
  isSimulated: boolean;
  warning?: string;
}

export interface RecommendationFeedback {
  id: string;
  recommendationBayId: string;
  driverAccepted: boolean;
  userRating?: 1 | 2 | 3 | 4 | 5;
  feedbackComment?: string;
  chosenPreference: string;
  timestamp: string;
}

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertType =
  | 'high_occupancy'
  | 'section_full'
  | 'rapid_occupancy_surge'
  | 'rapid_occupancy_drop'
  | 'abnormal_bay_transition'
  | 'sensor_camera_interruption'
  | 'detection_confidence_collapse'
  | 'prolonged_overstay'
  | 'ev_occupied'
  | 'accessible_occupied'
  | 'unusual_change'
  | 'detection_error';

export interface AnomalyExplanation {
  whatHappened: string;
  whyFlagged: string;
  recommendedAction: string;
  detectionRule: string;
  metricObserved?: string;
  expectedThreshold?: string;
}

export interface ParkingAlert {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  type: AlertType;
  isRead: boolean;
  lotId?: string;
  bayId?: string;
  source: 'Rule-based Anomaly Engine' | 'CV Edge Monitor' | 'Hardware Heartbeat';
  anomalyExplanation?: AnomalyExplanation;
  anomalyDetails?: {
    metric: string;
    expectedRange: string;
    observedValue: string;
    reason: string;
    section?: string;
    observedRate?: string;
  };
}

export interface ParkingEvent {
  id: string;
  timestamp: string;
  bayId: string;
  lotId: string;
  eventType:
    | 'vehicle_parked'
    | 'vehicle_departed'
    | 'status_override'
    | 'alert_triggered'
    | 'temporal_transition'
    | 'real_detection_propagated';
  details: string;
  simulated: boolean;
  confidence?: number;
}

export interface StatusFeedback {
  id: string;
  bayId: string;
  lotId: string;
  reportedStatus: 'available' | 'occupied';
  actualObservedStatus: string;
  comment?: string;
  submittedAt: string;
  resolved: boolean;
  resolutionNotes?: string;
}

export type DetectionSourceType = 'YOLO_REAL' | 'CANVAS_CV' | 'SIMULATOR' | 'MANUAL_DISPUTE';

export type SubsystemStatus =
  | 'ONLINE'
  | 'OFFLINE'
  | 'DEGRADED'
  | 'NOT CONFIGURED'
  | 'REAL YOLO ONLINE'
  | 'REAL YOLO OFFLINE'
  | 'SIMULATED FALLBACK'
  | 'GEMINI ONLINE'
  | 'GEMINI FALLBACK';

export interface SystemHealthItem {
  status: SubsystemStatus;
  label: string;
  latencyMs?: number;
  details?: string;
}

export interface SystemHealth {
  frontend: SystemHealthItem;
  backend: SystemHealthItem;
  api: SystemHealthItem;
  database: SystemHealthItem;
  detectionEngine: SystemHealthItem;
  simulationEngine: SystemHealthItem;
  prediction: SystemHealthItem;
  geminiVision: SystemHealthItem;
  alerts: SystemHealthItem;
  timestamp: string;
  isProductionRealHardware: boolean;
  disclaimer: string;
  metrics?: {
    eventCount: number;
    apiLatencyMs: number;
    simulationTickRate: number;
    geminiStatus: string;
    errorCount: number;
    lastSyncTime: string;
  };
}

export interface BoundingBox {
  x: number; // percentage 0 - 100
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
  bayId?: string;
  isOccupied: boolean;
  class?: string;
  source?: DetectionSourceType;
  simulated?: boolean;
}

export interface GeminiSceneAnalysis {
  lighting: string;
  weather: string;
  obstructions: string;
  notes: string;
  detectionReliability: 'High' | 'Moderate' | 'Low / Degraded';
  simulated?: boolean;
}

export interface DetectionResult {
  engine: 'SimulationDetectionEngine' | 'RealYOLODetectionEngine' | 'SyntheticBenchmarkEngine';
  mode: SystemMode;
  statusLabel: string;
  serviceAvailable: boolean;
  isFallbackActive?: boolean;
  source: DetectionSourceType;
  processingTimeMs: number;
  totalBaysEvaluated: number;
  occupiedCount: number;
  availableCount: number;
  unknownCount?: number;
  detections: BoundingBox[];
  summaryText: string;
  imageDimensions?: { width: number; height: number };
  timestamp: string;
  geminiSceneAnalysis?: GeminiSceneAnalysis;
  propagatedToLiveState?: boolean;
  pipelineStages?: Array<{
    stage: string;
    status: 'completed' | 'in_progress' | 'skipped';
    durationMs: number;
    details: string;
  }>;
}

export interface SimulationHistorySnapshot {
  tick: number;
  timestamp: string;
  simulatedTime: string;
  occupancyPercent: number;
  occupiedCount: number;
  availableCount: number;
  arrivalsDelta: number;
  departuresDelta: number;
  turnoverRate: number;
  searchTimeMin: number;
}

export interface SimulationSettings {
  isRunning: boolean;
  speed: '0.5x' | '1x' | '2x' | '5x';
  intervalMs: number;
  lastUpdated: string;
  baysChangedLastTick: number;
  totalTicks: number;
  activeVehicles: number;
  averageSearchTimeMinutes: number;
  simulatedTime: string;
  flowRateInVehiclesPerHour: number;
  flowRateOutVehiclesPerHour: number;
  seed?: number | string;
  scenarioPreset?:
    | 'morning_rush'
    | 'midday_turnover'
    | 'evening_exodus'
    | 'night_lull'
    | 'camera_failure'
    | 'unusual_spike';
  historyLength?: number;
}

export interface StatisticalPrediction {
  method: "Holt's Double Exponential Smoothing (Level + Trend Extrapolation)";
  horizonMinutes: number;
  currentOccupancyPercent: number;
  predictedOccupancyPercent: number;
  predictedOccupiedBays?: number;
  expectedAvailableSpaces: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  trendDirection?: string;
  confidenceScore: string;
  confidenceInterval?: string;
  explanation: string;
  predictionExplanation?: string;
  validationStatus: string;
  modelType: 'PROTOTYPE HEURISTIC / TIME-SERIES EXTENSION';
  historicalPoints?: Array<{ timestamp: string; occupancyPercent: number }>;
  predictionBounds?: {
    lowerPercent: number;
    upperPercent: number;
  };
  forecastSeries?: Array<{ minuteOffset: number; predictedPercent: number; lower: number; upper: number }>;
}
