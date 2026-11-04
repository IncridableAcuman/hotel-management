import React, { useState, useMemo } from 'react';
import { X, Calendar, Users, DollarSign, Bed, AlertCircle, CheckCircle } from 'lucide-react';
import { formatMoney } from '../utils/formatters';
import { bookingsApi } from '../api/bookingsApi';
import { useAuth } from '../context/AuthContext';

export default function BookingModal({
  room,
  isOpen,
  onClose,
  initialCheckIn = '',
  initialCheckOut = '',
  onBookingSuccess,
  onRequireAuth,
}) {
  const { user } = useAuth();

  // Tomorrow helper
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [checkInDate, setCheckInDate] = useState(initialCheckIn || todayStr);
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOut || tomorrowStr);
  const [guestsCount, setGuestsCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !room) return null;

  // Calculate days & total
  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [checkInDate, checkOutDate]);

  const totalAmount = nights * (room.pricePerNight || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      onRequireAuth?.();
      return;
    }

    if (nights <= 0) {
      setError('Chiqish sanasi kirish sanasidan kamida 1 kun keyin bo‘lishi kerak');
      return;
    }

    if (guestsCount > room.capacity) {
      setError(`Mehmonlar soni xona sig‘imidan (${room.capacity} kishi) oshmasligi kerak`);
      return;
    }

    setLoading(true);
    try {
      const result = await bookingsApi.createBooking({
        roomId: room.id,
        checkInDate,
        checkOutDate,
        guestsCount: Number(guestsCount),
      });
      onBookingSuccess?.(result);
      onClose();
    } catch (err) {
      setError(err.message || 'Xonani bron qilishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 text-indigo-700">
            <Bed className="w-5 h-5" />
            <h3 className="font-bold text-slate-900">Xonani bron qilish</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Room Summary Card */}
          <div className="mb-5 p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block">
                Tanlangan xona
              </span>
              <span className="text-xl font-black text-slate-900">
                № {room.roomNumber} ({room.type})
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Maksimal sig‘im: <strong>{room.capacity} kishi</strong>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Kunlik narx:</span>
              <span className="text-base font-bold text-slate-900">
                {formatMoney(room.pricePerNight)}
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!user && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center justify-between">
              <span>Bron qilish uchun avval profilingizga kiring</span>
              <button
                type="button"
                onClick={onRequireAuth}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition"
              >
                Kirish
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kirish sanasi (Check-in)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chiqish sanasi (Check-out)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    required
                    min={checkInDate || todayStr}
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mehmonlar soni (Maksimal: {room.capacity} kishi)
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min="1"
                  max={room.capacity}
                  required
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Math.min(room.capacity, Math.max(1, Number(e.target.value))))}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Kunlar soni:</span>
                <span className="font-semibold text-slate-800">{nights} kecha</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>1 kecha narxi:</span>
                <span className="font-semibold text-slate-800">{formatMoney(room.pricePerNight)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
                <span className="font-bold text-slate-900">Jami to'lov:</span>
                <span className="text-base font-black text-indigo-700">{formatMoney(totalAmount)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={loading || nights <= 0}
                className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                <span>Bronni tasdiqlash</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
