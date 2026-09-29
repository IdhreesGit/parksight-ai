import { ParkingLot, ParkingBay, ParkingAlert, ParkingEvent } from '../types';

export const INITIAL_LOTS: ParkingLot[] = [
  {
    id: 'campus-deck',
    name: 'Campus Parking Structure',
    location: 'Main University Blvd (Gate 1)',
    totalBays: 96,
    availableBays: 47,
    occupiedBays: 49,
    reservedBays: 4,
    maintenanceBays: 2,
    occupancyRate: 51,
    status: 'moderate',
    levels: 2,
    entrances: ['Main Entrance (North)', 'East Walkway', 'South Ramp', 'West Transit Center'],
    operatingHours: '24/7 Mon-Sun',
    ratePerHour: '$2.50 / hr ($18 max/day)',
    amenities: ['Level 2 EV Chargers', 'ADA Accessible Corridors', 'Covered Deck', 'Elevator', 'CCTV Optical Monitoring'],
    isDemo: true,
  },
  {
    id: 'north-lot',
    name: 'North Surface Parking',
    location: 'Engineering Complex North',
    totalBays: 120,
    availableBays: 32,
    occupiedBays: 88,
    reservedBays: 6,
    maintenanceBays: 1,
    occupancyRate: 73,
    status: 'high_occupancy',
    levels: 1,
    entrances: ['Engineering Ring Road'],
    operatingHours: '06:00 - 23:00',
    ratePerHour: '$2.00 / hr',
    amenities: ['Permit Zone', 'Open Air Surface', 'Bicycle Racks'],
    isDemo: true,
  },
  {
    id: 'south-lot',
    name: 'South Commuter Lot',
    location: 'Athletics & Transit Hub',
    totalBays: 80,
    availableBays: 55,
    occupiedBays: 25,
    reservedBays: 2,
    maintenanceBays: 0,
    occupancyRate: 31,
    status: 'optimal',
    levels: 1,
    entrances: ['Transit Loop South', 'Stadium Way'],
    operatingHours: '24/7',
    ratePerHour: '$1.50 / hr',
    amenities: ['Express Shuttle Ingress', 'Park & Ride'],
    isDemo: true,
  },
  {
    id: 'visitor-deck',
    name: 'Visitor & Administration Lot',
    location: 'Administration Building Front',
    totalBays: 45,
    availableBays: 12,
    occupiedBays: 33,
    reservedBays: 5,
    maintenanceBays: 1,
    occupancyRate: 73,
    status: 'high_occupancy',
    levels: 1,
    entrances: ['Welcome Center Drive'],
    operatingHours: '07:00 - 20:00',
    ratePerHour: '$3.00 / hr',
    amenities: ['Visitor Validation', 'VIP Guest Bays', 'Fast EV DC'],
    isDemo: true,
  },
];

// Generate 96 realistic bays for Campus Parking Structure
export function generateCampusBays(): ParkingBay[] {
  const bays: ParkingBay[] = [];
  const sections = [
    { name: 'North Deck', level: 1, row: 'A', count: 12, startY: 10 },
    { name: 'North Deck', level: 1, row: 'B', count: 12, startY: 28 },
    { name: 'South Wing', level: 1, row: 'C', count: 12, startY: 52 },
    { name: 'South Wing', level: 1, row: 'D', count: 12, startY: 70 },
    { name: 'East Courtyard', level: 2, row: 'E', count: 24, startY: 15 },
    { name: 'East Courtyard', level: 2, row: 'F', count: 24, startY: 55 },
  ];

  let bayCounter = 1;

  sections.forEach((sec) => {
    for (let i = 1; i <= sec.count; i++) {
      const bayId = `${sec.row}${i}`;
      let type: ParkingBay['type'] = 'standard';
      let status: ParkingBay['status'] = 'available';

      // Designate special bays deterministically
      if (sec.row === 'A' && (i === 1 || i === 2 || i === 3)) {
        type = 'accessible';
      } else if (sec.row === 'B' && (i === 1 || i === 2 || i === 3 || i === 4)) {
        type = 'ev';
      } else if (sec.row === 'C' && (i === 1 || i === 2)) {
        type = 'reserved';
      } else if (sec.row === 'D' && i === 12) {
        type = 'maintenance';
      }

      // Initial occupancy: ~51% occupied (49 occupied, 47 available)
      const isOccupiedInitially = (bayCounter * 7 + i * 3) % 2 === 0;
      bayCounter++;

      if (type === 'maintenance') {
        status = 'maintenance';
      } else if (type === 'reserved' && i === 1) {
        status = 'reserved';
      } else if (isOccupiedInitially) {
        status = 'occupied';
      } else {
        status = 'available';
      }

      const vehicleModels = ['Tesla Model 3', 'Honda Civic', 'Toyota RAV4', 'Ford F-150', 'Hyundai Ioniq 5', 'BMW i4', 'Nissan Leaf'];
      const vehicleColors = ['Midnight Blue', 'Pearl White', 'Slate Grey', 'Deep Black', 'Silver Metallic'];
      const vehicleType = type === 'ev' ? 'ev' : ((i % 3 === 0) ? 'suv' : 'compact');
      const colIndex = (i - 1) % 12;
      const x = +(8 + colIndex * 7.5).toFixed(1); // percent
      const y = sec.startY;
      const width = 6.2;
      const height = 12.0;
      const distance = Math.round(15 + colIndex * 8 + (sec.level === 2 ? 45 : 0) + (sec.row === 'D' ? 30 : 0));
      const walkingMinutes = +(distance / 65).toFixed(1);

      // Define 4 polygon corner points (top-left, top-right, bottom-right, bottom-left)
      const polygon = [
        { x, y },
        { x: +(x + width).toFixed(1), y },
        { x: +(x + width).toFixed(1), y: +(y + height).toFixed(1) },
        { x, y: +(y + height).toFixed(1) },
      ];

      bays.push({
        id: bayId,
        lotId: 'campus-deck',
        section: sec.name,
        row: sec.row,
        level: sec.level,
        type,
        status,
        temporalState: status === 'occupied' ? 'confirmed_occupied' : 'confirmed_available',
        consecutiveHits: 3,
        requiredHits: 3,
        confidence: status === 'occupied' ? 0.94 : 0.98,
        distanceToEntranceMeters: distance,
        estimatedWalkingMinutes: Math.max(0.5, walkingMinutes),
        lastUpdated: new Date(Date.now() - (i * 45000)).toISOString(),
        vehicleDetected: status === 'occupied' ? {
          type: vehicleType as any,
          color: vehicleColors[i % vehicleColors.length],
          confidence: +(0.88 + (i % 10) * 0.01).toFixed(2),
          simulationCertainty: 1.0,
          detectedAt: new Date(Date.now() - (i * 75000)).toISOString(),
          plateMasked: `SIM-***${10 + i}`,
          source: 'SIMULATOR',
        } : undefined,
        detectionSource: 'Simulation Engine',
        x,
        y,
        width,
        height,
        polygon,
      });
      bayCounter++;
    }
  });

  return bays;
}

export const INITIAL_ALERTS: ParkingAlert[] = [
  {
    id: 'alert-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    title: 'High Occupancy Threshold Reached',
    description: 'Campus Parking Level 1 occupancy exceeded 85%. Automated diversion signage recommended.',
    severity: 'warning',
    type: 'high_occupancy',
    isRead: false,
    lotId: 'campus-deck',
    source: 'Rule-based Anomaly Engine',
    anomalyExplanation: {
      whatHappened: 'Level 1 occupancy surpassed 85% capacity threshold during academic class changeover.',
      whyFlagged: 'Facility operational safety guideline mandates congestion diversion when ground deck exceeds 85%.',
      recommendedAction: 'Direct incoming vehicles via digital signage to Level 2 (East Courtyard) where 18 bays remain vacant.',
      detectionRule: 'RULE_SECTION_SATURATION_EXCEEDED (Threshold: > 85%)',
      metricObserved: '86.4% Level 1 Occupancy',
      expectedThreshold: '< 85.0%',
    },
    anomalyDetails: {
      metric: 'Level 1 Occupancy Rate',
      expectedRange: '45% - 75%',
      observedValue: '86.4%',
      reason: 'Rapid morning influx between 08:30 and 09:00 AM (Class changeover).',
      section: 'North Deck Level 1',
    },
  },
  {
    id: 'alert-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    title: 'EV Charging Bay Occupied by Non-EV Vehicle',
    description: 'Bay B2 (EV Charging) occupied by standard ICE vehicle (Sedan detected).',
    severity: 'warning',
    type: 'ev_occupied',
    isRead: false,
    lotId: 'campus-deck',
    bayId: 'B2',
    source: 'Rule-based Anomaly Engine',
    anomalyExplanation: {
      whatHappened: 'A conventional internal combustion sedan was detected parked in dedicated Level-2 EV charging bay B2.',
      whyFlagged: 'EV charging infrastructure rule prevents non-electric vehicles from blocking charging hardware.',
      recommendedAction: 'Issue courtesy notification or dispatch parking attendant to verify vehicle powertrain.',
      detectionRule: 'RULE_EV_INFRASTRUCTURE_MISMATCH (VehicleType == standard && BayType == ev)',
      metricObserved: 'Standard ICE Vehicle in EV Charging Slot',
      expectedThreshold: 'Electric Vehicle / Plug-in Hybrid',
    },
    anomalyDetails: {
      metric: 'Vehicle Classification vs Bay Type',
      expectedRange: 'EV / Hybrid Plug-in',
      observedValue: 'Gasoline Compact Sedan (Confidence 0.91)',
      reason: 'Computer vision classification flagged non-charging vehicle parked at active charger.',
      section: 'North Deck Row B',
    },
  },
  {
    id: 'alert-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    title: 'Sensor Churn Anomaly: Frequent State Churn',
    description: 'Bay D4 toggled between Available and Occupied 6 times in 5 minutes.',
    severity: 'critical',
    type: 'abnormal_bay_transition',
    isRead: false,
    lotId: 'campus-deck',
    bayId: 'D4',
    source: 'CV Edge Monitor',
    anomalyExplanation: {
      whatHappened: 'Bay D4 registered rapid back-and-forth occupancy oscillations (6 state changes within 5 minutes).',
      whyFlagged: 'Indicates physical sensor occlusion, tree branch shadow flickering across painted bay lines, or camera vibration.',
      recommendedAction: 'Trigger temporal hysteresis buffer stabilization and inspect camera optical alignment on Section South Wing.',
      detectionRule: 'RULE_BAY_FLICKER_DETECTION (Transitions > 3 in 5 min)',
      metricObserved: '6 oscillations / 5 min',
      expectedThreshold: '< 2 transitions / hour',
    },
    anomalyDetails: {
      metric: 'Bay Transition Frequency',
      expectedRange: '< 2 transitions/hour',
      observedValue: '6 transitions / 5 min',
      reason: 'Possible optical occlusion, tree branch shadow flickering, or sensor calibration drift.',
      section: 'South Wing Row D',
    },
  },
  {
    id: 'alert-004',
    timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    title: 'Accessible Bay Occupancy Registered',
    description: 'Bay A1 (Accessible) was occupied. Designated priority slot monitored.',
    severity: 'info',
    type: 'accessible_occupied',
    isRead: true,
    lotId: 'campus-deck',
    bayId: 'A1',
    source: 'Rule-based Anomaly Engine',
    anomalyExplanation: {
      whatHappened: 'Bay A1 ADA accessible stall transitioned from vacant to occupied.',
      whyFlagged: 'Priority accessibility bay monitoring ensures reserved stall availability telemetry is actively logged.',
      recommendedAction: 'Telemetry recorded. Accessible parking capacity updated in real-time guidance system.',
      detectionRule: 'RULE_ACCESSIBLE_BAY_TELEMETRY',
      metricObserved: 'Bay A1 Occupied',
      expectedThreshold: 'Audited Telemetry Log',
    },
  },
];

export const INITIAL_EVENTS: ParkingEvent[] = [
  {
    id: 'ev-1',
    timestamp: new Date(Date.now() - 1000 * 45).toISOString(),
    bayId: 'B4',
    lotId: 'campus-deck',
    eventType: 'vehicle_parked',
    details: 'Vehicle entered Bay B4 (EV Charging). Temporal verification confirmed (3/3 frames).',
    simulated: true,
    confidence: 0.95,
  },
  {
    id: 'ev-2',
    timestamp: new Date(Date.now() - 1000 * 120).toISOString(),
    bayId: 'A3',
    lotId: 'campus-deck',
    eventType: 'vehicle_departed',
    details: 'Bay A3 vacated. Status transitioned from Occupied to Available after clearance buffer.',
    simulated: true,
    confidence: 0.98,
  },
  {
    id: 'ev-3',
    timestamp: new Date(Date.now() - 1000 * 240).toISOString(),
    bayId: 'E10',
    lotId: 'campus-deck',
    eventType: 'vehicle_parked',
    details: 'Vehicle parked in Level 2 Bay E10. Ingress recorded via East Walkway.',
    simulated: true,
    confidence: 0.92,
  },
];
