import React, { useEffect, useState } from 'react';
import { X, Bed, Users, DollarSign, Calendar, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { roomsApi } from '../api/roomsApi';
import { formatMoney, formatDateTime } from '../utils/formatters';

export default function RoomDetailModal({ roomId, isOpen, onClose, onBook }) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && roomId) {
      setLoading(true);
      setError(null);
      roomsApi
        .getRoomById(roomId)
        .then((data) => setRoom(data))
        .catch((err) => setError(err.message || 'Xona tafsilotlarini yuklab bo‘lmadi'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, roomId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 text-indigo-700">
            <Bed className="w-5 h-5" />
            <h3 className="font-bold text-slate-900">Xona haqida batafsil</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
              <span className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Ma’lumotlar yuklanmoqda...</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && room && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-sky-900 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-sky-200 font-semibold uppercase tracking-wider block">
                      Xona raqami
                    </span>
                    <h2 className="text-3xl font-black">№ {room.roomNumber}</h2>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 border border-white/20">
                    {room.type}
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-baseline">
                  <span className="text-xs text-sky-200">1 kecha uchun narx:</span>
                  <span className="text-xl font-black text-amber-300">
                    {formatMoney(room.pricePerNight)}
                  </span>
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-slate-500 block">Sig‘im:</span>
                    <strong className="text-slate-800">{room.capacity} kishi</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                  {room.isActive ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <span className="text-slate-500 block">Holati:</span>
                    <strong className={room.isActive ? 'text-emerald-700' : 'text-rose-700'}>
                      {room.isActive ? 'Band qilishga tayyor' : 'Nofaol (Ta’mirda)'}
                    </strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-slate-500 block">Yaratilgan sana:</span>
                    <strong className="text-slate-800">{formatDateTime(room.createdAt)}</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-slate-500 block">Oxirgi yangilanish:</span>
                    <strong className="text-slate-800">{formatDateTime(room.updatedAt)}</strong>
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <p className="font-semibold text-slate-800 mb-1">Xonadagi qulayliklar:</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <span>✓ Bepul Wi-Fi internet</span>
                  <span>✓ Konditsioner & isitgich</span>
                  <span>✓ Smart TV va mini bar</span>
                  <span>✓ Xususiy vanna va fen</span>
                  <span>✓ 24/7 xona xizmati</span>
                  <span>✓ Toza sochiq va xalat</span>
                </div>
              </div>

              {/* Footer action */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Yopish
                </button>
                <button
                  type="button"
                  disabled={!room.isActive}
                  onClick={() => {
                    onClose();
                    onBook?.(room);
                  }}
                  className={`px-5 py-2 text-xs font-semibold rounded-xl text-white shadow-sm transition ${
                    room.isActive
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  Xonani bron qilish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
