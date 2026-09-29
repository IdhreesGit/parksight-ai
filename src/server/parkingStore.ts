import {
  ParkingLot,
  ParkingBay,
  ParkingAlert,
  ParkingEvent,
  StatusFeedback,
  RecommendationFeedback,
  SimulationHistorySnapshot,
  BoundingBox,
  BayStatus,
  DetectionSourceType,
} from '../types';
import { INITIAL_LOTS, generateCampusBays, INITIAL_ALERTS, INITIAL_EVENTS } from '../data/seedData';

// Single source of truth storage
export const parkingLots: ParkingLot[] = JSON.parse(JSON.stringify(INITIAL_LOTS));
export const parkingBays: ParkingBay[] = generateCampusBays();
export let parkingAlerts: ParkingAlert[] = JSON.parse(JSON.stringify(INITIAL_ALERTS));
export const parkingEvents: ParkingEvent[] = JSON.parse(JSON.stringify(INITIAL_EVENTS));
export const feedbackQueue: StatusFeedback[] = [
  {
    id: 'fb-101',
    bayId: 'C4',
    lotId: 'campus-deck',
    reportedStatus: 'occupied',
    actualObservedStatus: 'occupied',
    comment: 'Vehicle parked with dark tint was briefly missed by camera angle.',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    resolved: true,
    resolutionNotes: 'Verified via manual operator check. System state confirmed occupied.',
  },
  {
    id: 'fb-102',
    bayId: 'A2',
    lotId: 'campus-deck',
    reportedStatus: 'available',
    actualObservedStatus: 'available',
    comment: 'Vehicle departed 2 minutes ago, confirmed empty.',
    submittedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    resolved: true,
    resolutionNotes: 'Updated occupancy state to Available.',
  },
];

// Human feedback on recommendation usefulness
export const recommendationFeedbackQueue: RecommendationFeedback[] = [
  {
    id: 'rf-001',
    recommendationBayId: 'A3',
    driverAccepted: true,
    userRating: 5,
    feedbackComment: 'Shortest walking route to Science Quad. Exactly as described.',
    chosenPreference: 'accessible_preserve',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'rf-002',
    recommendationBayId: 'B1',
    driverAccepted: true,
    userRating: 4,
    feedbackComment: 'EV charger worked properly.',
    chosenPreference: 'ev_priority',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

// Rolling simulation time-series buffer (max 120 points)
export const simulationHistoryBuffer: SimulationHistorySnapshot[] = [];

// Initialize history and temporal state for bays
parkingBays.forEach((bay) => {
  const isOccupied = bay.status === 'occupied';
  bay.temporalState = isOccupied ? 'confirmed_occupied' : 'confirmed_available';
  bay.consecutiveHits = 3;
  bay.requiredHits = 3;
  bay.confidence = isOccupied ? 0.94 : 0.98;
  bay.detectionSource = 'Simulation Engine';
  bay.history = [
    {
      status: bay.status,
      temporalState: bay.temporalState,
      consecutiveHits: 3,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      reason: 'Facility baseline operational initialization',
      confidence: bay.confidence,
      duration: '30m',
    },
  ];
});

// Populate initial historical timeline
const now = Date.now();
const campusInit = parkingLots.find((l) => l.id === 'campus-deck') || parkingLots[0];
const initialOccupancy = parkingBays.filter((b) => b.status === 'occupied').length;

for (let i = 14; i >= 0; i--) {
  const pastTime = new Date(now - i * 3 * 60 * 1000);
  const hour = pastTime.getHours();
  const minute = pastTime.getMinutes();
  const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const variance = Math.sin(i * 0.4) * 3;
  const occ = Math.max(10, Math.min(campusInit.totalBays, Math.round(initialOccupancy + variance)));
  const occPercent = Math.round((occ / campusInit.totalBays) * 100);

  simulationHistoryBuffer.push({
    tick: 15 - i,
    timestamp: pastTime.toISOString(),
    simulatedTime: timeStr,
    occupancyPercent: occPercent,
    occupiedCount: occ,
    availableCount: campusInit.totalBays - occ,
    arrivalsDelta: Math.max(0, Math.round(3 + Math.sin(i) * 2)),
    departuresDelta: Math.max(0, Math.round(2 + Math.cos(i) * 2)),
    turnoverRate: 3.2,
    searchTimeMin: +(2.2 + (occPercent / 100) * 3.6).toFixed(1),
  });
}

export function syncLotStats() {
  const campus = parkingLots.find((l) => l.id === 'campus-deck') || parkingLots[0];
  if (campus) {
    const occupied = parkingBays.filter((b) => b.status === 'occupied').length;
    const available = parkingBays.filter((b) => b.status === 'available').length;
    const reserved = parkingBays.filter((b) => b.status === 'reserved').length;
    const maintenance = parkingBays.filter((b) => b.status === 'maintenance').length;

    campus.occupiedBays = occupied;
    campus.availableBays = available;
    campus.reservedBays = reserved;
    campus.maintenanceBays = maintenance;
    campus.occupancyRate = Math.round((occupied / campus.totalBays) * 100);
    campus.status =
      campus.occupancyRate > 85 ? 'high_occupancy' : campus.occupancyRate > 70 ? 'moderate' : 'optimal';
  }
}

/**
 * Propagate Computer Vision Detections to Global Parking State
 * RULE 4: Preserves true source integrity:
 * - YOLO_REAL
 * - CANVAS_CV
 * - SIMULATOR
 * - MANUAL_DISPUTE
 * Never assigns simulated=false or YOLO_REAL when the source was a simulated fallback or fixture.
 */
export function propagateRealDetectionsToStore(
  detections: BoundingBox[],
  sourceType: DetectionSourceType = 'SIMULATOR',
  sourceLabel?: string
): { updatedBaysCount: number; transitions: number } {
  let updatedBaysCount = 0;
  let transitions = 0;
  const nowIso = new Date().toISOString();

  const isSimulated = sourceType === 'SIMULATOR';
  const effectiveDetectionSource: ParkingBay['detectionSource'] =
    sourceType === 'YOLO_REAL'
      ? 'Real YOLO Inference'
      : sourceType === 'CANVAS_CV'
      ? 'Canvas Vision Analyzer'
      : sourceType === 'MANUAL_DISPUTE'
      ? 'Manual Operator'
      : 'Simulation Engine';

  const label = sourceLabel || effectiveDetectionSource;

  detections.forEach((det) => {
    if (!det.bayId) return;
    const targetBay = parkingBays.find((b) => b.id === det.bayId);
    if (!targetBay) return;

    updatedBaysCount++;
    const prevStatus = targetBay.status;
    const newStatus: BayStatus = det.isOccupied ? 'occupied' : 'available';

    // Preserve individual detection source or fall back to overall source
    const baySource = det.source || sourceType;
    const baySimulated = det.simulated !== undefined ? det.simulated : isSimulated;

    targetBay.detectionSource = effectiveDetectionSource;
    targetBay.sourceType = baySource;
    targetBay.isSimulated = baySimulated;
    targetBay.confidence = det.confidence;
    targetBay.lastUpdated = nowIso;

    if (newStatus === 'occupied') {
      targetBay.vehicleDetected = {
        type: (det.class as any) || targetBay.vehicleDetected?.type || 'sedan',
        color: baySimulated ? 'Simulated Vehicle' : 'Verified Target',
        confidence: det.confidence,
        detectedAt: nowIso,
        plateMasked: targetBay.vehicleDetected?.plateMasked || (baySimulated ? `SIM-***${Math.floor(Math.random() * 89 + 10)}` : `REAL-***${Math.floor(Math.random() * 89 + 10)}`),
        source: baySource,
      };
    } else {
      targetBay.vehicleDetected = undefined;
    }

    if (prevStatus !== newStatus) {
      transitions++;
      targetBay.status = newStatus;
      targetBay.temporalState = newStatus === 'occupied' ? 'confirmed_occupied' : 'confirmed_available';
      targetBay.consecutiveHits = 3;

      // Add to bay audit history
      targetBay.history = [
        {
          status: newStatus,
          temporalState: targetBay.temporalState,
          consecutiveHits: 3,
          timestamp: nowIso,
          reason: `${label} [${baySource}] updated slot (Confidence: ${Math.round(det.confidence * 100)}%)`,
          confidence: det.confidence,
          duration: 'Just now',
        },
        ...(targetBay.history || []),
      ].slice(0, 15);

      // Add system event with true simulated flag and source
      parkingEvents.unshift({
        id: `ev-prop-${Date.now()}-${targetBay.id}`,
        timestamp: nowIso,
        bayId: targetBay.id,
        lotId: targetBay.lotId,
        eventType: 'real_detection_propagated',
        details: `Bay ${targetBay.id} transitioned to ${newStatus.toUpperCase()} via ${label} (Source: [${baySource}], Simulated: ${baySimulated}).`,
        simulated: baySimulated,
        confidence: det.confidence,
      });
    }
  });

  syncLotStats();
  return { updatedBaysCount, transitions };
}
