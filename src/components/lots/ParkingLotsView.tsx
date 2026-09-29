import React from 'react';
import {
  Building2,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';

interface ParkingLotsViewProps {
  onNavigate: (route: string) => void;
}

export const ParkingLotsView: React.FC<ParkingLotsViewProps> = ({ onNavigate }) => {
  const { lots, selectedLot, setSelectedLotId } = useParking();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Campus Parking Facilities &amp; Lot Directory
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
              {lots.length} Facilities Cataloged
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage multi-lot campus infrastructure, monitor aggregate capacity, and select active telemetry decks.
          </p>
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lots.map((lot) => {
          const isSelected = selectedLot?.id === lot.id;
          const occRate = lot.occupancyRate || Math.round(((lot.totalBays - lot.availableBays) / lot.totalBays) * 100);

          return (
            <div
              key={lot.id}
              className={`p-5 sm:p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500 shadow-xl ring-1 ring-cyan-500/40'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Title & Status Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{lot.name}</h3>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          Active Monitoring
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      {lot.location}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                      lot.status === 'optimal'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : lot.status === 'moderate'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {lot.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Capacity & Occupancy bar */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 my-3">
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-slate-400">Occupancy Status</span>
                    <span className="text-white font-bold font-mono">
                      {lot.availableBays} Free / {lot.totalBays} Total ({occRate}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        occRate > 85 ? 'bg-rose-500' : occRate > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occRate}%` }}
                    />
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-300 mt-3">
                  <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-0.5">
                      <Clock className="w-3 h-3 text-cyan-400" /> Operating Hours
                    </div>
                    <div className="font-semibold text-white">{lot.operatingHours}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-0.5">
                      <DollarSign className="w-3 h-3 text-emerald-400" /> Hourly Rate
                    </div>
                    <div className="font-semibold text-white">{lot.ratePerHour}</div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mt-3.5 pt-3 border-t border-slate-800/80">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Facility Amenities:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {lot.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded-md bg-slate-800/80 text-[11px] text-slate-300 border border-slate-700/60 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        <span>{amenity}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {lot.id === 'campus-deck' ? 'Digital twin active' : 'Simulated lot profile'}
                </span>
                <button
                  onClick={() => {
                    setSelectedLotId(lot.id);
                    onNavigate('parking');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-sm'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <span>{isSelected ? 'View Live Map' : 'Select Lot'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
