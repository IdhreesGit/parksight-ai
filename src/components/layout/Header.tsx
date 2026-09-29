import React, { useState, useEffect } from 'react';
import {
  Car,
  Play,
  Pause,
  RotateCcw,
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  ShieldAlert,
  Radio,
  Cpu,
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from '../common/LanguageSelector';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onNavigate: (route: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, onNavigate }) => {
  const {
    simulation,
    theme,
    toggleTheme,
    unreadAlertCount,
    alerts,
    setIsDemoModalOpen,
    setIsSearchOpen,
    systemMode,
  } = useParking();
  const { t } = useLanguage();
  const [isAlertsDropdownOpen, setIsAlertsDropdownOpen] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo((prev) => (prev >= 60 ? 1 : prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 transition-colors">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left: Mobile Toggle + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Open mobile navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                  ParkSight<span className="text-cyan-400">AI</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
                  Review 2
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium hidden sm:block">
                Smart Parking Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Center: System Status Mode Badge & Simulation Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Active Mode Badge */}
          <button
            onClick={() => setIsDemoModalOpen(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors shadow-sm ${
              systemMode === 'REAL'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
            }`}
            title="Click to view transparency regarding real vs simulated components"
          >
            {systemMode === 'REAL' ? (
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>MODE: {systemMode}</span>
            <span className="text-[10px] opacity-75 font-normal ml-0.5">&bull; Info</span>
          </button>

          {/* Simulation Controls Group */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1 text-xs gap-2">
            <button
              onClick={simulation.toggleRunning}
              className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 font-medium ${
                simulation.isRunning
                  ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                  : 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
              }`}
              title={simulation.isRunning ? 'Pause state simulation' : 'Resume simulation'}
            >
              {simulation.isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline text-[11px] font-semibold">{t('header.liveSim', 'Live Sim')}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline text-[11px] font-semibold">{t('header.paused', 'Paused')}</span>
                </>
              )}
            </button>

            <div className="h-4 w-px bg-slate-800" />

            {/* Speed selector */}
            <div className="flex items-center gap-0.5">
              {(['0.5x', '1x', '2x', '5x'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => simulation.setSpeed(s)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors ${
                    simulation.speed === s
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-slate-800" />

            <button
              onClick={simulation.reset}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
              title={t('header.resetSim', 'Reset baseline')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="hidden xl:flex items-center text-[10px] text-slate-500 pl-1 font-mono">
              Tick: {secondsAgo}s
            </div>
          </div>
        </div>

        {/* Right: Search, Language, Alerts, Theme, Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-400 text-xs transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Search bay...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] bg-slate-900 border border-slate-700 rounded text-slate-400 font-mono">
              /
            </kbd>
          </button>

          <LanguageSelector variant="header" />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsAlertsDropdownOpen(!isAlertsDropdownOpen)}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                  {unreadAlertCount}
                </span>
              )}
            </button>

            {isAlertsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {t('header.recentAlerts', 'Active Alerts')} ({unreadAlertCount} {t('header.unread', 'unread')})
                  </span>
                  <button
                    onClick={() => {
                      setIsAlertsDropdownOpen(false);
                      onNavigate('alerts');
                    }}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    {t('header.viewAll', 'View All')}
                  </button>
                </div>
                <div className="space-y-1.5 max-h-64 overflow-y-auto divide-y divide-slate-800/50">
                  {alerts.slice(0, 4).map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        setIsAlertsDropdownOpen(false);
                        onNavigate('alerts');
                      }}
                      className="p-2 rounded-lg hover:bg-slate-800/60 cursor-pointer text-xs transition-colors"
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span
                          className={
                            alert.severity === 'critical'
                              ? 'text-rose-400'
                              : alert.severity === 'warning'
                              ? 'text-amber-400'
                              : 'text-cyan-400'
                          }
                        >
                          {alert.title}
                        </span>
                        {!alert.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {alert.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>

          <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-700 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
              PS
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-xs font-semibold text-white leading-tight">Review 2 Evaluator</div>
              <div className="text-[10px] text-slate-400">Computer Vision &amp; AI</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
