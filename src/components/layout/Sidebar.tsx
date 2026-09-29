import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  ScanEye,
  LineChart,
  Sparkles,
  Building2,
  BellRing,
  GitBranch,
  Info,
  X,
  Activity,
  Cpu,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from '../common/LanguageSelector';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  labelKey: string;
  defaultLabel: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { unreadAlertCount, anomalyStatus, systemMode } = useParking();
  const { t } = useLanguage();

  const navItems: NavItem[] = [
    { id: 'dashboard', labelKey: 'nav.dashboard', defaultLabel: 'Dashboard', icon: LayoutDashboard },
    { id: 'parking', labelKey: 'nav.parking', defaultLabel: 'Live Parking Map', icon: MapPin },
    { id: 'navigation', labelKey: 'nav.navigation', defaultLabel: 'Indoor Navigation', icon: Compass, badge: 'Interactive', badgeColor: 'bg-blue-500/15 text-blue-300 border border-blue-500/30' },
    { id: 'detection', labelKey: 'nav.detection', defaultLabel: 'CV Workspace', icon: ScanEye, badge: systemMode === 'REAL' ? 'Real CV' : 'YOLOv8', badgeColor: systemMode === 'REAL' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' },
    { id: 'recommendations', labelKey: 'nav.recommendations', defaultLabel: 'Recommendations', icon: Sparkles },
    { id: 'digital-twin', labelKey: 'nav.digitalTwin', defaultLabel: 'Digital Twin Sim', icon: Cpu },
    { id: 'analytics', labelKey: 'nav.analytics', defaultLabel: 'Predictive Analytics', icon: LineChart },
    { id: 'lots', labelKey: 'nav.lots', defaultLabel: 'Facility Lots', icon: Building2 },
    {
      id: 'alerts',
      labelKey: 'nav.alerts',
      defaultLabel: 'Alerts & Anomalies',
      icon: BellRing,
      badge: unreadAlertCount > 0 ? unreadAlertCount : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    },
    { id: 'architecture', labelKey: 'nav.architecture', defaultLabel: '10-Stage Pipeline', icon: GitBranch },
    { id: 'privacy', labelKey: 'nav.privacy', defaultLabel: 'Privacy & Edge', icon: ShieldCheck },
    { id: 'about', labelKey: 'nav.about', defaultLabel: 'About & Status', icon: Info },
  ];

  const content = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300">
      {/* Mobile Header with Close Button */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-bold text-sm">
            P
          </div>
          <span className="font-bold text-white">ParkSight AI</span>
        </div>
        <button
          onClick={onCloseMobile}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Close navigation drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          {t('nav.platformNav', 'Platform Navigation')}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{t(item.labelKey, item.defaultLabel)}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.badgeColor || ''}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Language Selector in Sidebar */}
      <div className="px-3 py-2 border-t border-slate-800/80">
        <div className="px-1 pb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Language
        </div>
        <LanguageSelector variant="sidebar" />
      </div>

      {/* System Status Mini Widget */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 m-2 rounded-xl text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-cyan-400" />
            Anomaly Status
          </span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
              anomalyStatus === 'Normal'
                ? 'text-emerald-400 bg-emerald-500/10'
                : anomalyStatus === 'Warning'
                ? 'text-amber-400 bg-amber-500/10'
                : 'text-rose-400 bg-rose-500/10'
            }`}
          >
            {anomalyStatus}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center justify-between">
          <span>Vision Mode:</span>
          <span className="text-cyan-300 font-mono text-[10px]">{systemMode}</span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
          <span>Review Stage:</span>
          <span className="text-emerald-400 font-mono text-[10px]">Review 2 Prep</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {content}
      </aside>
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
