import React from 'react';
import { Users, Sparkles, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';
import { formatMoney } from '../utils/formatters';

const TYPE_THEMES = {
  SINGLE: { label: 'Single', color: 'from-slate-600 to-slate-800', bg: 'bg-slate-100 text-slate-800' },
  DOUBLE: { label: 'Double', color: 'from-emerald-600 to-teal-700', bg: 'bg-emerald-100 text-emerald-800' },
  DELUXE: { label: 'Deluxe', color: 'from-purple-600 to-indigo-700', bg: 'bg-purple-100 text-purple-800' },
  FAMILY: { label: 'Family', color: 'from-blue-600 to-cyan-700', bg: 'bg-blue-100 text-blue-800' },
  SUITE: { label: 'Suite', color: 'from-amber-500 to-orange-600', bg: 'bg-amber-100 text-amber-800' },
};

export default function RoomCard({ room, onBook, onViewDetails }) {
  const theme = TYPE_THEMES[room.type] || {
    label: room.type,
    color: 'from-indigo-600 to-blue-600',
    bg: 'bg-indigo-100 text-indigo-800',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">
      {/* Top Banner */}
      <div className={`h-24 bg-gradient-to-r ${theme.color} p-4 flex items-start justify-between text-white relative`}>
        <div className="z-10">
          <span className="text-xs uppercase tracking-wider font-semibold opacity-90">
            Xona raqami
          </span>
          <h3 className="text-2xl font-black tracking-tight flex items-center gap-1.5">
            № {room.roomNumber}
          </h3>
        </div>
        <div className="z-10 flex flex-col items-end gap-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/20">
            {theme.label}
          </span>
          {!room.isActive && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/80 text-white flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Nofaol
            </span>
          )}
        </div>
        {/* Subtle background decoration */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <Users className="w-4 h-4 text-slate-400" />
              <span>Sig‘imi:</span>
              <strong className="text-slate-700">{room.capacity} kishi</strong>
            </span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Qulayliklar mavjud</span>
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Narxi (1 kecha):</span>
              <span className="text-lg font-bold text-slate-900">
                {formatMoney(room.pricePerNight)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
          <button
            onClick={() => onViewDetails(room)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
          >
            Tafsilotlar
          </button>
          <button
            onClick={() => onBook(room)}
            disabled={!room.isActive}
            className={`px-3 py-2 text-xs font-semibold rounded-xl text-white shadow-sm transition flex items-center justify-center gap-1.5 ${
              room.isActive
                ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            <span>Band qilish</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
