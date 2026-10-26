/**
 * ParkSight AI - Advanced Smart Parking Platform
 * Review 3 Architecture Entry Point (Task 01 C29 - Rathinam Technical Campus)
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ParkingProvider, useParking } from './context/ParkingContext';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { LiveParkingView } from './components/parking/LiveParkingView';
import { DemoModal } from './components/common/DemoModal';
import { SearchModal } from './components/common/SearchModal';
import { ReportFeedbackModal } from './components/feedback/ReportFeedbackModal';
import { ParkingBay } from './types';

const NavigationView = lazy(() =>
  import('./components/navigation/NavigationView').then((m) => ({ default: m.NavigationView }))
);
const AIDetectionView = lazy(() =>
  import('./components/detection/AIDetectionView').then((m) => ({ default: m.AIDetectionView }))
);
const DigitalTwinView = lazy(() =>
  import('./components/digitaltwin/DigitalTwinView').then((m) => ({ default: m.DigitalTwinView }))
);
const AnalyticsView = lazy(() =>
  import('./components/analytics/AnalyticsView').then((m) => ({ default: m.AnalyticsView }))
);
const RecommendationsView = lazy(() =>
  import('./components/recommendations/RecommendationsView').then((m) => ({ default: m.RecommendationsView }))
);
const ParkingLotsView = lazy(() =>
  import('./components/lots/ParkingLotsView').then((m) => ({ default: m.ParkingLotsView }))
);
const AlertsView = lazy(() =>
  import('./components/alerts/AlertsView').then((m) => ({ default: m.AlertsView }))
);
const HowItWorksView = lazy(() =>
  import('./components/architecture/HowItWorksView').then((m) => ({ default: m.HowItWorksView }))
);
const PrivacyView = lazy(() =>
  import('./components/privacy/PrivacyView').then((m) => ({ default: m.PrivacyView }))
);
const AboutStatusView = lazy(() =>
  import('./components/about/AboutStatusView').then((m) => ({ default: m.AboutStatusView }))
);

function MainLayout() {
  const [currentRoute, setCurrentRoute] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const { selectedBay, setSelectedBay, setIsSearchOpen } = useParking();

  // Keyboard shortcut: Pressing "/" or "Ctrl/Cmd + K" opens search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  const handleSelectBay = (bay: ParkingBay | null) => {
    setSelectedBay(bay);
    if (bay && currentRoute !== 'parking' && currentRoute !== 'navigation') {
      setCurrentRoute('parking');
    }
  };

  const renderActiveView = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <DashboardView onNavigate={setCurrentRoute} onSelectBay={handleSelectBay} />;
      case 'parking':
        return (
          <LiveParkingView
            selectedBay={selectedBay}
            onSelectBay={setSelectedBay}
            onNavigate={setCurrentRoute}
          />
        );
      case 'navigation':
        return <NavigationView onSelectBay={handleSelectBay} onNavigate={setCurrentRoute} />;
      case 'detection':
        return <AIDetectionView />;
      case 'digital-twin':
        return <DigitalTwinView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'recommendations':
        return <RecommendationsView onSelectBay={handleSelectBay} onNavigate={setCurrentRoute} />;
      case 'lots':
        return <ParkingLotsView onNavigate={setCurrentRoute} />;
      case 'alerts':
        return <AlertsView onNavigate={setCurrentRoute} />;
      case 'architecture':
        return <HowItWorksView />;
      case 'privacy':
        return <PrivacyView />;
      case 'about':
        return <AboutStatusView />;
      default:
        return <DashboardView onNavigate={setCurrentRoute} onSelectBay={handleSelectBay} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sticky Header */}
      <Header
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onNavigate={setCurrentRoute}
      />

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Sidebar Navigation */}
        <Sidebar
          currentRoute={currentRoute}
          onNavigate={setCurrentRoute}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          <Suspense
            fallback={
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 font-mono text-center">
                Loading workspace module...
              </div>
            }
          >
            {renderActiveView()}
          </Suspense>
        </main>
      </div>

      {/* Global Modals */}
      <DemoModal />
      <SearchModal onSelectBay={handleSelectBay} onNavigate={setCurrentRoute} />
      <ReportFeedbackModal />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ParkingProvider>
        <MainLayout />
      </ParkingProvider>
    </LanguageProvider>
  );
}
