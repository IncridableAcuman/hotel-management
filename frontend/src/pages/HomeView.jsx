import React, { useState, useEffect, useCallback } from 'react';
import { Bed, Sparkles, RefreshCw, AlertCircle, ShieldCheck, Wifi, Coffee, Utensils } from 'lucide-react';
import RoomCard from '../components/RoomCard';
import RoomFilterBar from '../components/RoomFilterBar';
import { roomsApi } from '../api/roomsApi';
import heroImg from '../assets/hero.png';

export default function HomeView({ onBookRoom, onViewRoom, notify }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    type: '',
    minPrice: '',
    maxPrice: '',
    capacity: '',
    checkInDate: '',
    checkOutDate: '',
  });

  const fetchRooms = useCallback(async (currentFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await roomsApi.getRooms({
        ...currentFilters,
        onlyActive: true,
      });
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Xonalarni yuklashda xatolik yuz berdi');
      notify?.({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  }, [filters, notify]);

  // Initial load
  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSearch = () => {
    fetchRooms(filters);
  };

  const handleReset = () => {
    const defaultFilters = {
      type: '',
      minPrice: '',
      maxPrice: '',
      capacity: '',
      checkInDate: '',
      checkOutDate: '',
    };
    setFilters(defaultFilters);
    fetchRooms(defaultFilters);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-12 sm:py-16 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Oliy darajadagi dam olish va qulaylik</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              LuxeStay Hotelga <br />
              <span className="bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">
                Xush Kelibsiz!
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Eng shinam xonalar, qulay narxlar va 24/7 oliy darajadagi xizmat. O‘zingiz va oilangiz uchun eng munosib xonani tanlang va bir necha soniyada bron qiling!
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                <Wifi className="w-3.5 h-3.5 text-sky-400" /> Tezkor Wi-Fi
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                <Coffee className="w-3.5 h-3.5 text-sky-400" /> Nonushta
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> 100% Xavfsiz
              </span>
            </div>
          </div>

          <div className="relative shrink-0 max-w-xs sm:max-w-sm lg:max-w-md">
            <img
              src={heroImg}
              alt="Hotel Illustration"
              className="w-full h-auto drop-shadow-2xl rounded-2xl transform hover:scale-102 transition duration-500"
            />
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div>
        <RoomFilterBar
          filters={filters}
          setFilters={setFilters}
          onSearch={handleSearch}
          onReset={handleReset}
          loading={loading}
        />
      </div>

      {/* Rooms List Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Bed className="w-6 h-6 text-indigo-600" />
              <span>Mavjud Xonalar</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Jami {rooms.length} ta faol xona topildi
            </p>
          </div>

          <button
            onClick={() => fetchRooms()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Yangilash</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Xonalar yuklanmoqda...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <Bed className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Ushbu filtr bo‘yicha xonalar topilmadi
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Qidiruv parametrlarini o‘zgartirib yoki tozalab qaytadan urinib ko‘ring.
            </p>
            <button
              onClick={handleReset}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-indigo-700 transition"
            >
              Filtrlarni tozalash
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onBook={() => onBookRoom(room, filters.checkInDate, filters.checkOutDate)}
                onViewDetails={() => onViewRoom(room.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
