import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Bed,
  CalendarCheck,
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  LogIn,
  LogOut,
  Ban,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Eye,
  Filter,
} from 'lucide-react';
import { roomsApi } from '../api/roomsApi';
import { bookingsApi } from '../api/bookingsApi';
import { usersApi } from '../api/usersApi';
import { formatMoney, formatDate, formatDateTime, BOOKING_STATUS_CONFIG } from '../utils/formatters';
import AdminRoomModal from '../components/AdminRoomModal';
import UserDetailModal from '../components/UserDetailModal';

export default function AdminDashboardView({ notify }) {
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'rooms' | 'users' | 'stats'

  // Data states
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [userDetailId, setUserDetailId] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);

  // Filters for bookings
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');
  const [bookingSearch, setBookingSearch] = useState('');

  // Fetch all rooms (both active and inactive)
  const fetchRooms = useCallback(async () => {
    try {
      const data = await roomsApi.getRooms({ onlyActive: false });
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      notify?.({ type: 'error', message: err.message || 'Xonalarni yuklab bo‘lmadi' });
    }
  }, [notify]);

  // Fetch all bookings
  const fetchBookings = useCallback(async () => {
    try {
      const data = await bookingsApi.getAllBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      notify?.({ type: 'error', message: err.message || 'Bronlarni yuklab bo‘lmadi' });
    }
  }, [notify]);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      const data = await usersApi.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      notify?.({ type: 'error', message: err.message || 'Foydalanuvchilarni yuklab bo‘lmadi' });
    }
  }, [notify]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    await Promise.allSettled([fetchRooms(), fetchBookings(), fetchUsers()]);
    setLoading(false);
  }, [fetchRooms, fetchBookings, fetchUsers]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Room actions
  const handleCreateRoom = () => {
    setSelectedRoom(null);
    setRoomModalOpen(true);
  };

  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setRoomModalOpen(true);
  };

  const handleDeleteRoom = async (roomId, roomNumber) => {
    if (!window.confirm(`Xona № ${roomNumber} ni nofaol qilishga ishonchingiz komilmi?`)) return;
    try {
      await roomsApi.deleteRoom(roomId);
      notify?.({ type: 'success', message: `Xona № ${roomNumber} nofaol qilindi` });
      await fetchRooms();
    } catch (err) {
      notify?.({ type: 'error', message: err.message || 'Xonani o‘chirishda xatolik' });
    }
  };

  // Booking actions
  const handleConfirmBooking = async (id) => {
    try {
      await bookingsApi.confirmBooking(id);
      notify?.({ type: 'success', message: `Bron #${id} tasdiqlandi` });
      await fetchBookings();
    } catch (err) {
      notify?.({ type: 'error', message: err.message || 'Tasdiqlashda xatolik' });
    }
  };

  const handleCheckIn = async (id) => {
    try {
      await bookingsApi.checkIn(id);
      notify?.({ type: 'success', message: `Mehmon #${id} xonaga joylashtirildi (Check-in)` });
      await fetchBookings();
    } catch (err) {
      notify?.({ type: 'error', message: err.message || 'Check-in qilishda xatolik' });
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await bookingsApi.checkOut(id);
      notify?.({ type: 'success', message: `Bron #${id} tugatildi (Check-out)` });
      await fetchBookings();
    } catch (err) {
      notify?.({ type: 'error', message: err.message || 'Check-out qilishda xatolik' });
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm(`Haqiqatdan ham bron #${id} ni bekor qilmoqchimisiz?`)) return;
    try {
      await bookingsApi.cancelBooking(id);
      notify?.({ type: 'success', message: `Bron #${id} bekor qilindi` });
      await fetchBookings();
    } catch (err) {
      notify?.({ type: 'error', message: err.message || 'Bekor qilishda xatolik' });
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await bookingsApi.updateStatus(id, status);
      notify?.({ type: 'success', message: `Status yangilandi: ${status}` });
      await fetchBookings();
    } catch (err) {
      notify?.({ type: 'error', message: err.message || 'Statusni yangilashda xatolik' });
    }
  };

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    const matchStatus = bookingStatusFilter === 'ALL' || b.status === bookingStatusFilter;
    const searchLower = bookingSearch.toLowerCase();
    const matchSearch =
      !bookingSearch ||
      String(b.id).includes(searchLower) ||
      (b.userEmail && b.userEmail.toLowerCase().includes(searchLower)) ||
      (b.userFullName && b.userFullName.toLowerCase().includes(searchLower)) ||
      (b.roomNumber && b.roomNumber.toLowerCase().includes(searchLower));
    return matchStatus && matchSearch;
  });

  // Calculate statistics
  const totalRevenue = bookings
    .filter((b) => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN' || b.status === 'CHECKED_OUT')
    .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

  const activeRoomsCount = rooms.filter((r) => r.isActive).length;
  const pendingBookingsCount = bookings.filter((b) => b.status === 'PENDING').length;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-900 via-slate-900 to-indigo-950 text-white shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Boshqaruv Markazi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Mehmonxona Ma’muriyati
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Xonalar, bronlar, mehmonlar va moliyaviy hisobotlarni to‘liq boshqarish tizimi
          </p>
        </div>

        <button
          onClick={fetchAllData}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-md border border-white/20 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Barcha ma’lumotlarni yangilash</span>
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Bed className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Xonalar soni</span>
            <span className="text-xl font-black text-slate-900">
              {rooms.length} ta{' '}
              <span className="text-xs text-emerald-600 font-semibold">({activeRoomsCount} faol)</span>
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Jami Bronlar</span>
            <span className="text-xl font-black text-slate-900">
              {bookings.length} ta{' '}
              {pendingBookingsCount > 0 && (
                <span className="text-xs text-amber-600 font-semibold">
                  ({pendingBookingsCount} kutilmoqda)
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Foydalanuvchilar</span>
            <span className="text-xl font-black text-slate-900">{users.length} nafar</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Tasdiqlangan Daromad</span>
            <span className="text-xl font-black text-emerald-600">{formatMoney(totalRevenue)}</span>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-sm transition whitespace-nowrap ${
            activeTab === 'bookings'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Barcha Bronlar ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rooms')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-sm transition whitespace-nowrap ${
            activeTab === 'rooms'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bed className="w-4 h-4" />
          <span>Xonalar Boshqaruvi ({rooms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-sm transition whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Foydalanuvchilar ({users.length})</span>
        </button>
      </div>

      {/* Tab 1: Bookings Management */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {/* Booking Filters */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" /> Status bo‘yicha:
              </span>
              {['ALL', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setBookingStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    bookingStatusFilter === st
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'Barchasi' : st}
                </button>
              ))}
            </div>

            <div className="w-full md:w-64">
              <input
                type="text"
                placeholder="ID, ism, email yoki xona..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Mehmon</th>
                    <th className="py-3 px-4">Xona</th>
                    <th className="py-3 px-4">Sanalar</th>
                    <th className="py-3 px-4">To‘lov</th>
                    <th className="py-3 px-4">Holat</th>
                    <th className="py-3 px-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Bronlar topilmadi
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => {
                      const stConfig = BOOKING_STATUS_CONFIG[b.status] || {
                        label: b.status,
                        bg: 'bg-slate-100 text-slate-800',
                        dot: 'bg-slate-400',
                      };

                      return (
                        <tr key={b.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-bold text-slate-500">#{b.id}</td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-800 block">{b.userFullName}</span>
                            <span className="text-slate-400 text-[11px]">{b.userEmail}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900">№ {b.roomNumber}</span>
                            <span className="text-slate-400 text-[11px] block">{b.guestsCount} mehmon</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            <div>
                              <span className="text-slate-400 text-[10px] block">Kirish:</span>
                              <strong>{formatDate(b.checkInDate)}</strong>
                            </div>
                            <div className="mt-0.5">
                              <span className="text-slate-400 text-[10px] block">Chiqish:</span>
                              <strong>{formatDate(b.checkOutDate)}</strong>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-black text-indigo-700 text-sm">
                              {formatMoney(b.totalAmount)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-1 items-start">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold border ${stConfig.bg}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${stConfig.dot}`} />
                                <span>{stConfig.label}</span>
                              </span>

                              {/* Direct Status Selector */}
                              <select
                                value={b.status}
                                onChange={(e) => handleStatusChange(b.id, e.target.value)}
                                className="text-[11px] py-0.5 px-1 rounded border border-slate-300 bg-white text-slate-700"
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="CONFIRMED">CONFIRMED</option>
                                <option value="CHECKED_IN">CHECKED_IN</option>
                                <option value="CHECKED_OUT">CHECKED_OUT</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {b.status === 'PENDING' && (
                                <button
                                  onClick={() => handleConfirmBooking(b.id)}
                                  title="Tasdiqlash (Confirm)"
                                  className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold border border-blue-200 transition"
                                >
                                  Tasdiqlash
                                </button>
                              )}

                              {b.status === 'CONFIRMED' && (
                                <button
                                  onClick={() => handleCheckIn(b.id)}
                                  title="Check-In"
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold border border-emerald-200 transition"
                                >
                                  Check-in
                                </button>
                              )}

                              {b.status === 'CHECKED_IN' && (
                                <button
                                  onClick={() => handleCheckOut(b.id)}
                                  title="Check-Out"
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold border border-slate-300 transition"
                                >
                                  Check-out
                                </button>
                              )}

                              {b.status !== 'CANCELLED' && b.status !== 'CHECKED_OUT' && (
                                <button
                                  onClick={() => handleCancelBooking(b.id)}
                                  title="Bekor qilish"
                                  className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Rooms Management */}
      {activeTab === 'rooms' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Mehmonxonaning barcha xonalari ro‘yxati va holati
            </p>
            <button
              onClick={handleCreateRoom}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi xona qo‘shish</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Xona №</th>
                    <th className="py-3 px-4">Turi</th>
                    <th className="py-3 px-4">Sig‘im</th>
                    <th className="py-3 px-4">Narxi (kecha)</th>
                    <th className="py-3 px-4">Holati</th>
                    <th className="py-3 px-4">Yaratilgan</th>
                    <th className="py-3 px-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rooms.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Xonalar topilmadi
                      </td>
                    </tr>
                  ) : (
                    rooms.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-black text-slate-900 text-sm">
                          № {r.roomNumber}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {r.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {r.capacity} kishi
                        </td>
                        <td className="py-3 px-4 font-black text-slate-900">
                          {formatMoney(r.pricePerNight)}
                        </td>
                        <td className="py-3 px-4">
                          {r.isActive ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Faol
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Nofaol
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {formatDate(r.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEditRoom(r)}
                              title="Tahrirlash"
                              className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRoom(r.id, r.roomNumber)}
                              title="Nofaol qilish"
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Users List */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Tizimda ro‘yxatdan o‘tgan barcha foydalanuvchilar va xodimlar
          </p>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Ism va Familiya</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Telefon</th>
                    <th className="py-3 px-4">Roli</th>
                    <th className="py-3 px-4">Ro‘yxatdan o‘tgan</th>
                    <th className="py-3 px-4 text-right">Tafsilot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Foydalanuvchilar topilmadi
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-500">#{u.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {u.firstName} {u.lastName}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{u.email}</td>
                        <td className="py-3 px-4 text-slate-600">{u.phone || '-'}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                              u.role === 'ADMIN'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {formatDateTime(u.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setUserDetailId(u.id);
                              setUserModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
                            title="Batafsil ko‘rish"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Admin Room Modal */}
      <AdminRoomModal
        isOpen={roomModalOpen}
        onClose={() => setRoomModalOpen(false)}
        room={selectedRoom}
        onSuccess={(msg) => {
          notify?.({ type: 'success', message: msg });
          fetchRooms();
        }}
      />

      {/* User Detail Modal */}
      <UserDetailModal
        userId={userDetailId}
        isOpen={userModalOpen}
        onClose={() => {
          setUserModalOpen(false);
          setUserDetailId(null);
        }}
      />
    </div>
  );
}
