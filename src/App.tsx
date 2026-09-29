/**
 * ParkSight AI - Advanced Smart Parking Platform
 * Review 2 Architecture Entry Point
 */

import React, { useState, useEffect } from 'react';
import { ParkingProvider, useParking } from './context/ParkingContext';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { LiveParkingView } from './components/parking/LiveParkingView';
import { NavigationView } from './components/navigation/NavigationView';
import { AIDetectionView } from './components/detection/AIDetectionView';
import { DigitalTwinView } from './components/digitaltwin/DigitalTwinView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { RecommendationsView } from './components/recommendations/RecommendationsView';
import { ParkingLotsView } from './components/lots/ParkingLotsView';
import { AlertsView } from './components/alerts/AlertsView';
import { HowItWorksView } from './components/architecture/HowItWorksView';
import { PrivacyView } from './components/privacy/PrivacyView';
import { AboutStatusView } from './components/about/AboutStatusView';
import { DemoModal } from './components/common/DemoModal';
import { SearchModal } from './components/common/SearchModal';
import { ReportFeedbackModal } from './components/feedback/ReportFeedbackModal';
import { ParkingBay } from './types';

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
          {renderActiveView()}
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
