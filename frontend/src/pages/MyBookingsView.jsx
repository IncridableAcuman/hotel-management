import React, { useState, useEffect, useCallback } from 'react';
import { CalendarCheck, RefreshCw, AlertCircle, Ban, Bed, Users, Calendar, Clock, DollarSign } from 'lucide-react';
import { bookingsApi } from '../api/bookingsApi';
import { useAuth } from '../context/AuthContext';
import { formatMoney, formatDate, formatDateTime, BOOKING_STATUS_CONFIG } from '../utils/formatters';

export default function MyBookingsView({ onOpenAuth, notify }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchMyBookings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await bookingsApi.getMyBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      notify?.({ type: 'error', message: err.message || 'Bronlarni yuklashda xatolik' });
    } finally {
      setLoading(false);
    }
  }, [user, notify]);

  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Haqiqatdan ham ushbu bronni bekor qilmoqchimisiz?')) return;
    setCancellingId(bookingId);
    try {
      await bookingsApi.cancelBooking(bookingId);
      notify?.({ type: 'success', message: 'Bron muvaffaqiyatli bekor qilindi' });
      await fetchMyBookings();
    } catch (err) {
      notify?.({ type: 'error', message: err.message || 'Bronni bekor qilishda xatolik' });
    } finally {
      setCancellingId(null);
    }
  };

  if (!user) {
    return (
      <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 max-w-lg mx-auto shadow-sm">
        <CalendarCheck className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Profilingizga kiring</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Bronlaringizni ko‘rish va boshqarish uchun tizimga kirishingiz lozim.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow transition"
        >
          Tizimga kirish
        </button>
      </div>
    );
  }

  const activeCount = bookings.filter((b) => b.status === 'PENDING' || b.status === 'CONFIRMED').length;
  const totalSpent = bookings
    .filter((b) => b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-indigo-600" />
            <span>Mening Bronlarim</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Siz amalga oshirgan barcha bronlar tarixi va holati
          </p>
        </div>

        <button
          onClick={fetchMyBookings}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-900 bg-white border border-slate-200 shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Yangilash</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block">Jami buyurtmalar</span>
          <span className="text-2xl font-black text-slate-900">{bookings.length} ta</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block">Faol bronlar</span>
          <span className="text-2xl font-black text-indigo-600">{activeCount} ta</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block">Umumiy xarajat</span>
          <span className="text-2xl font-black text-emerald-600">{formatMoney(totalSpent)}</span>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Bronlar yuklanmoqda...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
          <Bed className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Sizda hali bronlar yo‘q</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Xonalar bo‘limiga o‘tib, o‘zingizga yoqqan xonani bir necha soniyada bron qilishingiz mumkin.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const statusConfig = BOOKING_STATUS_CONFIG[booking.status] || {
              label: booking.status,
              bg: 'bg-slate-100 text-slate-800 border-slate-200',
              dot: 'bg-slate-400',
            };

            const canCancel =
              booking.status === 'PENDING' || booking.status === 'CONFIRMED';

            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      ID: #{booking.id}
                    </span>
                    <span className="text-base font-black text-slate-900">
                      Xona № {booking.roomNumber}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                      <span>{statusConfig.label}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="text-slate-400 block text-[10px]">Muddat</span>
                        <strong>
                          {formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="text-slate-400 block text-[10px]">Mehmonlar</span>
                        <strong>{booking.guestsCount} kishi</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="text-slate-400 block text-[10px]">Bron vaqti</span>
                        <strong>{formatDateTime(booking.createdAt)}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block text-right">
                      Jami to‘lov
                    </span>
                    <span className="text-lg font-black text-indigo-700">
                      {formatMoney(booking.totalAmount)}
                    </span>
                  </div>

                  {canCancel && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={cancellingId === booking.id}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition flex items-center gap-1 active:scale-95 disabled:opacity-50"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Bekor qilish</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
