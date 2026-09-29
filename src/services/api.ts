/**
 * REST API Client Service for ParkSight AI
 * Provides robust type-safe methods for all backend capabilities.
 */

import {
  ParkingLot,
  ParkingBay,
  UserPreferences,
  RecommendationResponse,
  ParkingAlert,
  StatusFeedback,
  DetectionResult,
  SystemHealth,
  SimulationSettings,
  StatisticalPrediction,
  NavigationRoute,
  RecommendationFeedback,
  BoundingBox,
  DetectionSourceType,
} from '../types';

export async function fetchParkingData(): Promise<{
  lots: ParkingLot[];
  bays: ParkingBay[];
  isDemo: boolean;
  lastUpdated: string;
}> {
  const res = await fetch('/api/parking');
  if (!res.ok) throw new Error('Failed to fetch parking data');
  return res.json();
}

export async function fetchOccupancyMetrics(): Promise<{
  totalBays: number;
  availableSpaces: number;
  occupiedSpaces: number;
  occupancyPercentage: number;
  activeVehicles: number;
  averageSearchTimeMinutes: number;
  currentAlertsCount: number;
  isSimulated: boolean;
  dataSource: string;
  lastUpdated: string;
}> {
  const res = await fetch('/api/occupancy');
  if (!res.ok) throw new Error('Failed to fetch occupancy metrics');
  return res.json();
}

export async function getRecommendations(preferences: UserPreferences): Promise<RecommendationResponse> {
  const res = await fetch('/api/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  });
  if (!res.ok) throw new Error('Failed to compute recommendations');
  return res.json();
}

export async function submitRecommendationFeedback(
  recommendationBayId: string,
  driverAccepted: boolean,
  userRating?: 1 | 2 | 3 | 4 | 5,
  feedbackComment?: string,
  chosenPreference?: string
): Promise<{ success: boolean; feedback: RecommendationFeedback }> {
  const res = await fetch('/api/recommendations/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recommendationBayId, driverAccepted, userRating, feedbackComment, chosenPreference }),
  });
  if (!res.ok) throw new Error('Failed to submit recommendation feedback');
  return res.json();
}

export async function fetchRecommendationFeedback(): Promise<{
  feedbackList: RecommendationFeedback[];
  total: number;
  accepted: number;
  acceptanceRate: number;
}> {
  const res = await fetch('/api/recommendations/feedback');
  if (!res.ok) throw new Error('Failed to fetch recommendation feedback stats');
  return res.json();
}

export async function fetchNavigationRoute(bayId: string, entrance: string): Promise<NavigationRoute> {
  const res = await fetch(`/api/navigation/route?bayId=${encodeURIComponent(bayId)}&entrance=${encodeURIComponent(entrance)}`);
  if (!res.ok) throw new Error('Failed to fetch navigation route');
  return res.json();
}

export async function fetchAnalytics(range: 'today' | '7d' | '30d'): Promise<{
  range: string;
  timeSeries: Array<{
    timestamp: string;
    occupancyPercent: number;
    occupiedBays: number;
    availableBays: number;
    vehicleArrivals: number;
    searchTimeMin: number;
  }>;
  summary: {
    peakOccupancyPeriod: string;
    averageOccupancyRate: string;
    dailyTurnoverRate: string;
    averageSearchTime: string;
    predictionNext30Min: {
      expectedOccupancy: string;
      expectedAvailability: string;
      trend: string;
      confidenceScore: string;
      method: string;
      validationStatus: string;
    };
  };
  predictionDetails: any;
  isSimulated: boolean;
  disclaimer: string;
}> {
  const res = await fetch(`/api/analytics?range=${range}`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function fetchAlerts(): Promise<{
  alerts: ParkingAlert[];
  unreadCount: number;
  anomalyStatus: 'Normal' | 'Warning' | 'Anomaly';
  recentEvents: any[];
  isDemo: boolean;
}> {
  const res = await fetch('/api/alerts');
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function markAlertRead(id: string): Promise<void> {
  await fetch(`/api/alerts/${id}/read`, { method: 'POST' });
}

export async function clearAlert(id: string): Promise<void> {
  await fetch(`/api/alerts/${id}/clear`, { method: 'POST' });
}

export async function submitStatusFeedback(
  bayId: string,
  reportedStatus: 'available' | 'occupied',
  comment?: string
): Promise<{ success: boolean; feedback: StatusFeedback }> {
  const res = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bayId, reportedStatus, comment }),
  });
  if (!res.ok) throw new Error('Failed to submit status correction');
  return res.json();
}

export async function fetchFeedbackList(): Promise<{
  feedback: StatusFeedback[];
  totalReports: number;
  resolvedReports: number;
  disputedBays: string[];
}> {
  const res = await fetch('/api/feedback');
  if (!res.ok) throw new Error('Failed to fetch feedback list');
  return res.json();
}

export async function resolveFeedbackItem(id: string, notes?: string): Promise<void> {
  await fetch(`/api/feedback/${id}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  });
}

export async function analyzeDetectionImage(
  engineType: 'simulation' | 'yolo_interface',
  imageBase64?: string,
  runGeminiInspection = false,
  yoloEndpoint?: string
): Promise<DetectionResult> {
  const res = await fetch('/api/detection/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ engineType, imageBase64, runGeminiInspection, yoloEndpoint }),
  });
  if (!res.ok) throw new Error('Detection request failed');
  return res.json();
}

export async function propagateDetections(
  detections: BoundingBox[],
  sourceType: DetectionSourceType = 'SIMULATOR',
  sourceLabel?: string
): Promise<{ success: boolean; updatedBaysCount: number; transitions: number; sourceType: DetectionSourceType }> {
  const res = await fetch('/api/detection/propagate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ detections, sourceType, sourceLabel }),
  });
  if (!res.ok) throw new Error('Failed to propagate detections');
  return res.json();
}

export async function fetchSystemStatus(): Promise<SystemHealth> {
  const res = await fetch('/api/system-status');
  if (!res.ok) throw new Error('Failed to fetch system status');
  return res.json();
}

export async function fetchSimulationState(): Promise<SimulationSettings> {
  const res = await fetch('/api/simulation/state');
  if (!res.ok) throw new Error('Failed to fetch simulation state');
  return res.json();
}

export async function updateSimulation(
  isRunning: boolean,
  speed?: '0.5x' | '1x' | '2x' | '5x',
  seed?: number,
  scenarioPreset?: 'morning_rush' | 'midday_turnover' | 'evening_exodus' | 'night_lull' | 'camera_failure' | 'unusual_spike'
): Promise<SimulationSettings> {
  const res = await fetch('/api/simulation/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isRunning, speed, seed, scenarioPreset }),
  });
  return res.json();
}

export async function fetchObservabilityMetrics(): Promise<{
  metrics: {
    eventCount: number;
    historyBufferLength: number;
    apiLatencyMs: number;
    simulationTickRateHz: number;
    detectionProcessingTimeMs: number;
    geminiStatus: string;
    errorCount: number;
    totalRequests: number;
    lastSuccessfulOperation: string;
    activeAlertsCount: number;
  };
  systemHealth: string;
}> {
  const res = await fetch('/api/observability');
  if (!res.ok) throw new Error('Failed to fetch observability metrics');
  return res.json();
}

export async function stepSimulation(): Promise<any> {
  const res = await fetch('/api/simulation/step', { method: 'POST' });
  return res.json();
}

export async function resetSimulationState(): Promise<any> {
  const res = await fetch('/api/simulation/reset', { method: 'POST' });
  return res.json();
}

export async function fetchStatisticalPrediction(horizonMinutes = 30): Promise<StatisticalPrediction> {
  const res = await fetch(`/api/prediction?horizon=${horizonMinutes}`);
  if (!res.ok) throw new Error('Failed to fetch statistical prediction');
  return res.json();
}
