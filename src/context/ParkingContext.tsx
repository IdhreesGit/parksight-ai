import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ParkingLot,
  ParkingBay,
  UserPreferences,
  ParkingAlert,
  ParkingEvent,
  RecommendationResponse,
  StatusFeedback,
  SystemHealth,
  NavigationRoute,
  BoundingBox,
  RecommendationFeedback,
  SystemMode,
  DetectionSourceType,
} from '../types';
import * as api from '../services/api';

interface SimulationContextState {
  isRunning: boolean;
  speed: '0.5x' | '1x' | '2x' | '5x';
  toggleRunning: () => void;
  setSpeed: (speed: '0.5x' | '1x' | '2x' | '5x') => void;
  stepForward: () => Promise<void>;
  reset: () => Promise<void>;
  setScenario: (preset: 'morning_rush' | 'midday_turnover' | 'evening_exodus' | 'night_lull' | 'camera_failure' | 'unusual_spike') => Promise<void>;
  baysChangedLastTick: number;
  lastUpdated: string;
  simulatedTime: string;
  flowRateIn: number;
  flowRateOut: number;
}

interface ParkingContextType {
  lots: ParkingLot[];
  bays: ParkingBay[];
  selectedLot: ParkingLot | null;
  setSelectedLotId: (id: string) => void;
  selectedBay: ParkingBay | null;
  setSelectedBay: (bay: ParkingBay | null) => void;
  navigationTarget: ParkingBay | null;
  setNavigationTarget: (bay: ParkingBay | null) => void;
  activeNavigationRoute: NavigationRoute | null;
  preferences: UserPreferences;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  occupancyMetrics: {
    totalBays: number;
    availableSpaces: number;
    occupiedSpaces: number;
    occupancyPercentage: number;
    activeVehicles: number;
    averageSearchTimeMinutes: number;
    currentAlertsCount: number;
    lastUpdated: string;
  };
  alerts: ParkingAlert[];
  unreadAlertCount: number;
  anomalyStatus: 'Normal' | 'Warning' | 'Anomaly';
  recentEvents: ParkingEvent[];
  markAlertAsRead: (id: string) => Promise<void>;
  clearAlertById: (id: string) => Promise<void>;
  simulation: SimulationContextState;
  recommendations: RecommendationResponse | null;
  refreshRecommendations: () => Promise<void>;
  submitRecFeedback: (bayId: string, accepted: boolean, rating?: 1 | 2 | 3 | 4 | 5, comment?: string) => Promise<void>;
  recFeedbackStats: { total: number; accepted: number; rate: number };
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  isFeedbackModalOpen: boolean;
  feedbackTargetBay: ParkingBay | null;
  openFeedbackModal: (bay?: ParkingBay) => void;
  closeFeedbackModal: () => void;
  isDemoModalOpen: boolean;
  setIsDemoModalOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  refreshData: () => Promise<void>;
  submitFeedback: (bayId: string, reportedStatus: 'available' | 'occupied', comment?: string) => Promise<void>;
  propagateRealDetections: (detections: BoundingBox[], sourceType?: DetectionSourceType, sourceLabel?: string) => Promise<void>;
  systemHealth: SystemHealth | null;
  systemMode: SystemMode;
  setSystemMode: (mode: SystemMode) => void;
}

const defaultPreferences: UserPreferences = {
  vehicleType: 'normal',
  accessibilityRequired: false,
  preferredEntrance: 'Main Entrance (North)',
  maxWalkingDistanceMeters: 180,
  preferredSection: 'all',
  strictConstraintsOnly: true,
};

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export const ParkingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [bays, setBays] = useState<ParkingBay[]>([]);
  const [selectedLotId, setSelectedLotId] = useState<string>('campus-deck');
  const [selectedBay, setSelectedBay] = useState<ParkingBay | null>(null);
  const [navigationTarget, setNavigationTargetState] = useState<ParkingBay | null>(null);
  const [activeNavigationRoute, setActiveNavigationRoute] = useState<NavigationRoute | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [alerts, setAlerts] = useState<ParkingAlert[]>([]);
  const [anomalyStatus, setAnomalyStatus] = useState<'Normal' | 'Warning' | 'Anomaly'>('Normal');
  const [recentEvents, setRecentEvents] = useState<ParkingEvent[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [systemMode, setSystemMode] = useState<SystemMode>('SIMULATED');
  const [recFeedbackStats, setRecFeedbackStats] = useState({ total: 2, accepted: 2, rate: 100 });

  // Simulation state
  const [isSimRunning, setIsSimRunning] = useState(true);
  const [simSpeed, setSimSpeed] = useState<'0.5x' | '1x' | '2x' | '5x'>('1x');
  const [baysChanged, setBaysChanged] = useState(0);
  const [simulatedTime, setSimulatedTime] = useState('10:34');
  const [flowRateIn, setFlowRateIn] = useState(44);
  const [flowRateOut, setFlowRateOut] = useState(26);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());

  // UI state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackTargetBay, setFeedbackTargetBay] = useState<ParkingBay | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [occupancyMetrics, setOccupancyMetrics] = useState({
    totalBays: 96,
    availableSpaces: 47,
    occupiedSpaces: 49,
    occupancyPercentage: 51,
    activeVehicles: 49,
    averageSearchTimeMinutes: 3.2,
    currentAlertsCount: 0,
    lastUpdated: new Date().toISOString(),
  });

  const setNavigationTarget = useCallback((targetBay: ParkingBay | null) => {
    setNavigationTargetState(targetBay);
    if (targetBay) {
      api.fetchNavigationRoute(targetBay.id, preferences.preferredEntrance)
        .then(setActiveNavigationRoute)
        .catch(console.warn);
    } else {
      setActiveNavigationRoute(null);
    }
  }, [preferences.preferredEntrance]);

  const refreshRecommendations = useCallback(async () => {
    try {
      const rec = await api.getRecommendations(preferences);
      setRecommendations(rec);
      // If no navigation target is active, default navigation to top recommended bay
      if (!navigationTarget && rec.bestMatch) {
        setNavigationTargetState(rec.bestMatch.bay);
        setActiveNavigationRoute(rec.bestMatch.navigationRoute || null);
      }
    } catch (e) {
      console.warn('Failed to compute recommendations:', e);
    }
  }, [preferences, navigationTarget]);

  const refreshData = useCallback(async () => {
    try {
      const [parkingData, occ, alertData, simState, fbStats] = await Promise.all([
        api.fetchParkingData(),
        api.fetchOccupancyMetrics(),
        api.fetchAlerts(),
        api.fetchSimulationState().catch(() => null),
        api.fetchRecommendationFeedback().catch(() => null),
      ]);

      setLots(parkingData.lots);
      setBays(parkingData.bays);
      setOccupancyMetrics(occ);
      setAlerts(alertData.alerts);
      setAnomalyStatus(alertData.anomalyStatus);
      setRecentEvents(alertData.recentEvents);
      setLastUpdated(parkingData.lastUpdated);

      if (fbStats) {
        setRecFeedbackStats({
          total: fbStats.total,
          accepted: fbStats.accepted,
          rate: fbStats.acceptanceRate,
        });
      }

      if (simState) {
        setIsSimRunning(simState.isRunning);
        setSimSpeed(simState.speed as any);
        setBaysChanged(simState.baysChangedLastTick);
        setSimulatedTime(simState.simulatedTime);
        setFlowRateIn(simState.flowRateInVehiclesPerHour);
        setFlowRateOut(simState.flowRateOutVehiclesPerHour);
      }

      setSelectedBay((prev) => {
        if (!prev) return null;
        const fresh = parkingData.bays.find((b) => b.id === prev.id);
        return fresh || prev;
      });

      setNavigationTargetState((prev) => {
        if (!prev) return null;
        const fresh = parkingData.bays.find((b) => b.id === prev.id);
        return fresh || prev;
      });
    } catch (err) {
      console.warn('Data refresh failed:', err);
    }
  }, []);

  useEffect(() => {
    refreshData();
    refreshRecommendations();
    api.fetchSystemStatus().then(setSystemHealth).catch(() => null);

    const interval = setInterval(() => {
      refreshData();
    }, 3200);
    return () => clearInterval(interval);
  }, [refreshData, refreshRecommendations]);

  // Sync theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...newPrefs };
      api.getRecommendations(updated).then(setRecommendations).catch(() => null);
      return updated;
    });
  };

  const submitRecFeedback = async (
    bayId: string,
    accepted: boolean,
    rating?: 1 | 2 | 3 | 4 | 5,
    comment?: string
  ) => {
    try {
      await api.submitRecommendationFeedback(
        bayId,
        accepted,
        rating,
        comment,
        preferences.vehicleType
      );
      const fb = await api.fetchRecommendationFeedback();
      setRecFeedbackStats({
        total: fb.total,
        accepted: fb.accepted,
        rate: fb.acceptanceRate,
      });
    } catch (err) {
      console.warn('Error submitting recommendation feedback:', err);
    }
  };

  const markAlertAsRead = async (id: string) => {
    try {
      await api.markAlertRead(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
    } catch {
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
    }
  };

  const clearAlertById = async (id: string) => {
    try {
      await api.clearAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const toggleRunning = async () => {
    const nextState = !isSimRunning;
    setIsSimRunning(nextState);
    await api.updateSimulation(nextState, simSpeed);
  };

  const setSpeed = async (speed: '0.5x' | '1x' | '2x' | '5x') => {
    setSimSpeed(speed);
    await api.updateSimulation(isSimRunning, speed);
  };

  const setScenario = async (
    preset: 'morning_rush' | 'midday_turnover' | 'evening_exodus' | 'night_lull' | 'camera_failure' | 'unusual_spike'
  ) => {
    await api.updateSimulation(isSimRunning, simSpeed, undefined, preset);
    await refreshData();
  };

  const stepForward = async () => {
    await api.stepSimulation();
    await refreshData();
  };

  const reset = async () => {
    await api.resetSimulationState();
    await refreshData();
    await refreshRecommendations();
  };

  const openFeedbackModal = (bay?: ParkingBay) => {
    setFeedbackTargetBay(bay || selectedBay || null);
    setIsFeedbackModalOpen(true);
  };

  const closeFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setFeedbackTargetBay(null);
  };

  const submitFeedback = async (
    bayId: string,
    reportedStatus: 'available' | 'occupied',
    comment?: string
  ) => {
    await api.submitStatusFeedback(bayId, reportedStatus, comment);
    await refreshData();
    await refreshRecommendations();
    closeFeedbackModal();
  };

  const propagateRealDetections = async (
    detections: BoundingBox[],
    sourceType: DetectionSourceType = 'SIMULATOR',
    sourceLabel?: string
  ) => {
    await api.propagateDetections(detections, sourceType, sourceLabel);
    setSystemMode(sourceType === 'YOLO_REAL' ? 'REAL' : 'SIMULATED');
    await refreshData();
    await refreshRecommendations();
  };

  const selectedLot = lots.find((l) => l.id === selectedLotId) || lots[0] || null;
  const unreadAlertCount = alerts.filter((a) => !a.isRead).length;

  return (
    <ParkingContext.Provider
      value={{
        lots,
        bays,
        selectedLot,
        setSelectedLotId,
        selectedBay,
        setSelectedBay,
        navigationTarget,
        setNavigationTarget,
        activeNavigationRoute,
        preferences,
        updatePreferences,
        occupancyMetrics,
        alerts,
        unreadAlertCount,
        anomalyStatus,
        recentEvents,
        markAlertAsRead,
        clearAlertById,
        simulation: {
          isRunning: isSimRunning,
          speed: simSpeed,
          toggleRunning,
          setSpeed,
          stepForward,
          reset,
          setScenario,
          baysChangedLastTick: baysChanged,
          lastUpdated,
          simulatedTime,
          flowRateIn,
          flowRateOut,
        },
        recommendations,
        refreshRecommendations,
        submitRecFeedback,
        recFeedbackStats,
        theme,
        toggleTheme,
        isFeedbackModalOpen,
        feedbackTargetBay,
        openFeedbackModal,
        closeFeedbackModal,
        isDemoModalOpen,
        setIsDemoModalOpen,
        isSearchOpen,
        setIsSearchOpen,
        refreshData,
        submitFeedback,
        propagateRealDetections,
        systemHealth,
        systemMode,
        setSystemMode,
      }}
    >
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = () => {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
};
