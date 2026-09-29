import {
  parkingLots,
  parkingBays,
  parkingEvents,
  simulationHistoryBuffer,
  syncLotStats,
} from './parkingStore';
import { checkAndGenerateAnomalies, triggerCameraInterruption } from './anomalyService';
import { createPRNG, PRNG } from './prng';
import { TemporalState, BayStateHistoryItem, BayStatus } from '../types';

export type SimSpeed = '0.5x' | '1x' | '2x' | '5x';
export type ScenarioPreset =
  | 'morning_rush'
  | 'midday_turnover'
  | 'evening_exodus'
  | 'night_lull'
  | 'camera_failure'
  | 'unusual_spike';

interface SimulationState {
  isRunning: boolean;
  speed: SimSpeed;
  intervalMs: number;
  totalTicks: number;
  baysChangedLastTick: number;
  lastTickTime: string;
  simulatedHour: number;
  simulatedMinute: number;
  flowRateIn: number;
  flowRateOut: number;
  seed: number | string;
  scenarioPreset: ScenarioPreset;
}

const SPEED_INTERVALS: Record<SimSpeed, number> = {
  '0.5x': 6000,
  '1x': 3000,
  '2x': 1500,
  '5x': 600,
};

let simPRNG: PRNG = createPRNG(42);

const simState: SimulationState = {
  isRunning: true,
  speed: '1x',
  intervalMs: 3000,
  totalTicks: 15,
  baysChangedLastTick: 0,
  lastTickTime: new Date().toISOString(),
  simulatedHour: 10,
  simulatedMinute: 30,
  flowRateIn: 44,
  flowRateOut: 26,
  seed: 42,
  scenarioPreset: 'morning_rush',
};

let timerId: NodeJS.Timeout | null = null;

function advanceSimulatedClock() {
  simState.simulatedMinute += 2;
  if (simState.simulatedMinute >= 60) {
    simState.simulatedMinute = 0;
    simState.simulatedHour = (simState.simulatedHour + 1) % 24;
  }
}

/**
 * Executes a deterministic, seedable simulation cycle.
 * Incorporates 3-frame temporal computer-vision verification logic and updates
 * the single-source-of-truth time-series history buffer.
 */
export function performSimulationCycle(): { changedCount: number; eventsGenerated: number } {
  simState.totalTicks++;
  simState.lastTickTime = new Date().toISOString();
  advanceSimulatedClock();

  let changedCount = 0;
  let eventsCount = 0;
  const nowIso = new Date().toISOString();

  // 1. Process Temporal Filter State Machine (3-frame confirmation requirement)
  parkingBays.forEach((bay) => {
    // Transition towards OCCUPIED
    if (bay.temporalState === 'candidate_occupied') {
      const hits = (bay.consecutiveHits || 1) + 1;
      bay.consecutiveHits = hits;
      const required = bay.requiredHits || 3;

      if (hits >= required) {
        bay.temporalState = 'confirmed_occupied';
        bay.status = 'occupied';
        bay.lastUpdated = nowIso;
        bay.confidence = 0.96;
        bay.detectionSource = 'Simulation Engine';

        const historyItem: BayStateHistoryItem = {
          status: 'occupied',
          temporalState: 'confirmed_occupied',
          consecutiveHits: hits,
          timestamp: nowIso,
          reason: `Temporal 3-frame confirmation verified (${hits}/${required} agreement)`,
          confidence: 0.96,
          duration: 'Active',
        };
        bay.history = [historyItem, ...(bay.history || [])].slice(0, 15);

        parkingEvents.unshift({
          id: `ev-${Date.now()}-${bay.id}`,
          timestamp: nowIso,
          bayId: bay.id,
          lotId: bay.lotId,
          eventType: 'temporal_transition',
          details: `Bay ${bay.id} state confirmed: Occupied (Temporal Filter: 3/3 consecutive frames verified).`,
          simulated: true,
          confidence: 0.96,
        });

        changedCount++;
        eventsCount++;
      } else {
        bay.history = [
          {
            status: 'available' as BayStatus,
            temporalState: 'candidate_occupied' as TemporalState,
            consecutiveHits: hits,
            timestamp: nowIso,
            reason: `Occupancy detected; temporal stability verification in progress (${hits}/${required} frames)`,
            confidence: 0.75,
          },
          ...(bay.history || []),
        ].slice(0, 15);
      }
    }
    // Transition towards AVAILABLE
    else if (bay.temporalState === 'candidate_available') {
      const hits = (bay.consecutiveHits || 1) + 1;
      bay.consecutiveHits = hits;
      const required = bay.requiredHits || 3;

      if (hits >= required) {
        bay.temporalState = 'confirmed_available';
        bay.status = 'available';
        bay.lastUpdated = nowIso;
        bay.vehicleDetected = undefined;
        bay.confidence = 0.98;
        bay.detectionSource = 'Simulation Engine';

        const historyItem: BayStateHistoryItem = {
          status: 'available',
          temporalState: 'confirmed_available',
          consecutiveHits: hits,
          timestamp: nowIso,
          reason: `Vacancy confirmed after ${hits} consecutive clear frames`,
          confidence: 0.98,
          duration: 'Vacant',
        };
        bay.history = [historyItem, ...(bay.history || [])].slice(0, 15);

        parkingEvents.unshift({
          id: `ev-${Date.now()}-${bay.id}`,
          timestamp: nowIso,
          bayId: bay.id,
          lotId: bay.lotId,
          eventType: 'temporal_transition',
          details: `Bay ${bay.id} state confirmed: Available (Temporal Filter: 3/3 vacancy frames verified).`,
          simulated: true,
          confidence: 0.98,
        });

        changedCount++;
        eventsCount++;
      } else {
        bay.history = [
          {
            status: 'occupied' as BayStatus,
            temporalState: 'candidate_available' as TemporalState,
            consecutiveHits: hits,
            timestamp: nowIso,
            reason: `Clearance detected; temporal stability verification in progress (${hits}/${required} frames)`,
            confidence: 0.70,
          },
          ...(bay.history || []),
        ].slice(0, 15);
      }
    }
  });

  // 2. Realistic Poisson-based Arrival/Departure Dynamics
  const campus = parkingLots.find((l) => l.id === 'campus-deck') || parkingLots[0];
  const currentOccupancy = parkingBays.filter((b) => b.status === 'occupied').length;
  const occupancyRatio = currentOccupancy / (campus.totalBays || 96);

  let arrivalProbability = 0.5;
  if (simState.scenarioPreset === 'morning_rush' || (simState.simulatedHour >= 8 && simState.simulatedHour <= 10)) {
    arrivalProbability = 0.76;
  } else if (simState.scenarioPreset === 'evening_exodus' || (simState.simulatedHour >= 16 && simState.simulatedHour <= 19)) {
    arrivalProbability = 0.22;
  } else if (simState.scenarioPreset === 'midday_turnover' || (simState.simulatedHour >= 11 && simState.simulatedHour <= 14)) {
    arrivalProbability = 0.48;
  } else if (simState.scenarioPreset === 'night_lull') {
    arrivalProbability = 0.18;
  } else if (simState.scenarioPreset === 'unusual_spike') {
    arrivalProbability = 0.92;
  }

  // Safety boundaries
  if (occupancyRatio > 0.90) arrivalProbability = 0.10;
  if (occupancyRatio < 0.25) arrivalProbability = 0.90;

  const eligibleBays = parkingBays.filter((b) => b.type === 'standard' || b.type === 'ev');
  const shouldAttemptTransition = simPRNG.boolean(0.70);
  let arrivalsThisTick = 0;
  let departuresThisTick = 0;

  if (shouldAttemptTransition && eligibleBays.length > 0) {
    const isArrival = simPRNG.boolean(arrivalProbability);
    if (isArrival) {
      const availableBays = eligibleBays.filter(
        (b) => b.status === 'available' && b.temporalState === 'confirmed_available'
      );
      if (availableBays.length > 0) {
        const targetBay = simPRNG.choice(availableBays);
        targetBay.temporalState = 'candidate_occupied';
        targetBay.consecutiveHits = 1;
        targetBay.requiredHits = 3;

        const colors = ['Silver Metallic', 'Deep Navy', 'Pearl White', 'Obsidian Black', 'Graphite Gray', 'Crimson Red'];
        targetBay.vehicleDetected = {
          type: targetBay.type === 'ev' ? 'ev' : 'sedan',
          color: simPRNG.choice(colors),
          confidence: 0.92,
          detectedAt: nowIso,
          plateMasked: `SIM-***${simPRNG.int(10, 99)}`,
          source: 'SIMULATOR',
        };

        targetBay.history = [
          {
            status: 'available' as BayStatus,
            temporalState: 'candidate_occupied' as TemporalState,
            consecutiveHits: 1,
            timestamp: nowIso,
            reason: 'Vehicle ingress detected by CCTV feed; temporal verification initiated (Frame 1/3)',
            confidence: 0.70,
          },
          ...(targetBay.history || []),
        ].slice(0, 15);

        parkingEvents.unshift({
          id: `ev-${Date.now()}-${targetBay.id}`,
          timestamp: nowIso,
          bayId: targetBay.id,
          lotId: targetBay.lotId,
          eventType: 'vehicle_parked',
          details: `Vehicle detected entering Bay ${targetBay.id} (${targetBay.section}). Hysteresis counter 1/3.`,
          simulated: true,
          confidence: 0.70,
        });

        changedCount++;
        eventsCount++;
        arrivalsThisTick++;
      }
    } else {
      const occupiedBays = eligibleBays.filter(
        (b) => b.status === 'occupied' && b.temporalState === 'confirmed_occupied'
      );
      if (occupiedBays.length > 0) {
        const targetBay = simPRNG.choice(occupiedBays);
        targetBay.temporalState = 'candidate_available';
        targetBay.consecutiveHits = 1;
        targetBay.requiredHits = 3;

        targetBay.history = [
          {
            status: 'occupied' as BayStatus,
            temporalState: 'candidate_available' as TemporalState,
            consecutiveHits: 1,
            timestamp: nowIso,
            reason: 'Clearance detected; temporal verification initiated (Frame 1/3)',
            confidence: 0.70,
          },
          ...(targetBay.history || []),
        ].slice(0, 15);

        parkingEvents.unshift({
          id: `ev-${Date.now()}-${targetBay.id}`,
          timestamp: nowIso,
          bayId: targetBay.id,
          lotId: targetBay.lotId,
          eventType: 'vehicle_departed',
          details: `Vehicle departure detected from Bay ${targetBay.id}. Vacancy confirmation pending (Frame 1/3).`,
          simulated: true,
          confidence: 0.70,
        });

        changedCount++;
        eventsCount++;
        departuresThisTick++;
      }
    }
  }

  simState.flowRateIn = Math.round(arrivalProbability * 65);
  simState.flowRateOut = Math.round((1 - arrivalProbability) * 55);
  simState.baysChangedLastTick = changedCount;

  if (parkingEvents.length > 100) {
    parkingEvents.length = 100;
  }

  syncLotStats();

  // 3. Record snapshot into time-series buffer
  const formattedTime = `${String(simState.simulatedHour).padStart(2, '0')}:${String(
    simState.simulatedMinute
  ).padStart(2, '0')}`;
  const totalBays = campus.totalBays || 96;
  const currentOccupied = parkingBays.filter((b) => b.status === 'occupied').length;
  const currentAvailable = totalBays - currentOccupied;
  const occPercent = Math.round((currentOccupied / totalBays) * 100);
  const searchTime = +(2.0 + (occPercent / 100) * 3.8).toFixed(1);

  simulationHistoryBuffer.push({
    tick: simState.totalTicks,
    timestamp: nowIso,
    simulatedTime: formattedTime,
    occupancyPercent: occPercent,
    occupiedCount: currentOccupied,
    availableCount: currentAvailable,
    arrivalsDelta: arrivalsThisTick,
    departuresDelta: departuresThisTick,
    turnoverRate: +(3.2 + Math.sin(simState.totalTicks * 0.1) * 0.4).toFixed(1),
    searchTimeMin: searchTime,
  });

  if (simulationHistoryBuffer.length > 120) {
    simulationHistoryBuffer.shift();
  }

  // 4. Anomaly Inspection
  checkAndGenerateAnomalies(occupancyRatio);

  return { changedCount, eventsGenerated: eventsCount };
}

function startLoop() {
  if (timerId) clearInterval(timerId);
  timerId = setInterval(() => {
    if (simState.isRunning) {
      performSimulationCycle();
    }
  }, simState.intervalMs);
}

export function initSimulationEngine() {
  startLoop();
}

export function setSimulationRunning(running: boolean) {
  simState.isRunning = running;
}

export function setSimulationSpeed(speed: SimSpeed) {
  simState.speed = speed;
  simState.intervalMs = SPEED_INTERVALS[speed] || 3000;
  startLoop();
}

export function setScenarioPreset(scenario: ScenarioPreset) {
  simState.scenarioPreset = scenario;
  if (scenario === 'morning_rush') {
    simState.simulatedHour = 8;
    simState.simulatedMinute = 45;
  } else if (scenario === 'midday_turnover') {
    simState.simulatedHour = 12;
    simState.simulatedMinute = 30;
  } else if (scenario === 'evening_exodus') {
    simState.simulatedHour = 17;
    simState.simulatedMinute = 15;
  } else if (scenario === 'night_lull') {
    simState.simulatedHour = 23;
    simState.simulatedMinute = 0;
  } else if (scenario === 'camera_failure') {
    triggerCameraInterruption('CAM-04-NORTH-DECK');
  } else if (scenario === 'unusual_spike') {
    simState.simulatedHour = 9;
    simState.simulatedMinute = 0;
    // Advance occupancy rapidly
    for (let i = 0; i < 6; i++) {
      const avail = parkingBays.filter((b) => b.status === 'available');
      if (avail.length > 0) {
        avail[0].status = 'occupied';
        avail[0].temporalState = 'confirmed_occupied';
      }
    }
    syncLotStats();
    checkAndGenerateAnomalies(parkingBays.filter((b) => b.status === 'occupied').length / 96);
  }
}

export function reseedSimulation(seed: number | string) {
  simState.seed = seed;
  simPRNG = createPRNG(seed);
  resetSimulation();
}

export function getSimulationState() {
  const campus = parkingLots.find((l) => l.id === 'campus-deck') || parkingLots[0];
  const formattedTime = `${String(simState.simulatedHour).padStart(2, '0')}:${String(
    simState.simulatedMinute
  ).padStart(2, '0')}`;

  return {
    isRunning: simState.isRunning,
    speed: simState.speed,
    intervalMs: simState.intervalMs,
    totalTicks: simState.totalTicks,
    baysChangedLastTick: simState.baysChangedLastTick,
    lastUpdated: simState.lastTickTime,
    simulatedTime: formattedTime,
    activeVehicles: campus ? campus.occupiedBays : 49,
    averageSearchTimeMinutes: +(2.2 + ((campus?.occupancyRate || 50) / 100) * 3.6).toFixed(1),
    flowRateInVehiclesPerHour: simState.flowRateIn,
    flowRateOutVehiclesPerHour: simState.flowRateOut,
    seed: simState.seed,
    scenarioPreset: simState.scenarioPreset,
    historyLength: simulationHistoryBuffer.length,
  };
}

export function resetSimulation() {
  simState.totalTicks = 0;
  simState.baysChangedLastTick = 0;
  simState.simulatedHour = 9;
  simState.simulatedMinute = 0;
  parkingEvents.length = 0;

  parkingBays.forEach((bay, index) => {
    const isOccupied = index % 2 === 0;
    bay.status = isOccupied ? 'occupied' : 'available';
    bay.temporalState = isOccupied ? 'confirmed_occupied' : 'confirmed_available';
    bay.consecutiveHits = 3;
    bay.requiredHits = 3;
    bay.confidence = isOccupied ? 0.94 : 0.98;
    bay.lastUpdated = new Date().toISOString();

    if (isOccupied) {
      bay.vehicleDetected = {
        type: bay.type === 'ev' ? 'ev' : 'sedan',
        color: 'Pearl White',
        confidence: 0.94,
        detectedAt: new Date().toISOString(),
        plateMasked: `SIM-***${(index * 7) % 90 + 10}`,
        source: 'SIMULATOR',
      };
    } else {
      bay.vehicleDetected = undefined;
    }

    bay.history = [
      {
        status: bay.status,
        temporalState: bay.temporalState,
        consecutiveHits: 3,
        timestamp: new Date().toISOString(),
        reason: 'Scenario reset to baseline deterministic state',
        confidence: bay.confidence,
      },
    ];
  });

  syncLotStats();
}
