import React from 'react';
import { Search, RotateCcw, Filter, Calendar, Users, DollarSign } from 'lucide-react';
import { ROOM_TYPES } from '../utils/formatters';

export default function RoomFilterBar({ filters, setFilters, onSearch, onReset, loading }) {
  const handleChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm mb-8"
    >
      <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold text-sm">
        <Filter className="w-4 h-4 text-indigo-600" />
        <span>Xonalarni qidirish va filtrlash</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Room Type */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Xona turi</label>
          <select
            value={filters.type || ''}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          >
            <option value="">Barchasi</option>
            {ROOM_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Mehmonlar soni</span>
            </span>
          </label>
          <input
            type="number"
            min="1"
            max="10"
            placeholder="Masalan: 2"
            value={filters.capacity || ''}
            onChange={(e) => handleChange('capacity', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        {/* Min Price */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              <span>Min narx (so‘m)</span>
            </span>
          </label>
          <input
            type="number"
            min="0"
            step="50000"
            placeholder="100 000"
            value={filters.minPrice || ''}
            onChange={(e) => handleChange('minPrice', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              <span>Max narx (so‘m)</span>
            </span>
          </label>
          <input
            type="number"
            min="0"
            step="50000"
            placeholder="1 000 000"
            value={filters.maxPrice || ''}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        {/* Check In Date */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Kirish sanasi</span>
            </span>
          </label>
          <input
            type="date"
            value={filters.checkInDate || ''}
            onChange={(e) => handleChange('checkInDate', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        {/* Check Out Date */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Chiqish sanasi</span>
            </span>
          </label>
          <input
            type="date"
            value={filters.checkOutDate || ''}
            onChange={(e) => handleChange('checkOutDate', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Filtrni tozalash</span>
        </button>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition disabled:opacity-50"
        >
          {loading ? (
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5" />
          )}
          <span>Qidirish</span>
        </button>
      </div>
    </form>
  );
}
