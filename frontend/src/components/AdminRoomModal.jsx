import React, { useState, useEffect } from 'react';
import { X, Bed, Plus, Edit2, AlertCircle } from 'lucide-react';
import { roomsApi } from '../api/roomsApi';
import { ROOM_TYPES } from '../utils/formatters';

export default function AdminRoomModal({ isOpen, onClose, room, onSuccess }) {
  const isEditing = Boolean(room?.id);

  const [roomNumber, setRoomNumber] = useState('');
  const [type, setType] = useState('SINGLE');
  const [pricePerNight, setPricePerNight] = useState('');
  const [capacity, setCapacity] = useState('1');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (room) {
      setRoomNumber(room.roomNumber || '');
      setType(room.type || 'SINGLE');
      setPricePerNight(room.pricePerNight ? String(room.pricePerNight) : '');
      setCapacity(room.capacity ? String(room.capacity) : '1');
      setIsActive(room.isActive !== undefined ? room.isActive : true);
    } else {
      setRoomNumber('');
      setType('SINGLE');
      setPricePerNight('');
      setCapacity('1');
      setIsActive(true);
    }
    setError(null);
  }, [room, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        roomNumber,
        type,
        pricePerNight: Number(pricePerNight),
        capacity: Number(capacity),
        ...(isEditing ? { isActive } : {}),
      };

      if (isEditing) {
        await roomsApi.updateRoom(room.id, payload);
        onSuccess?.('Xona muvaffaqiyatli yangilandi');
      } else {
        await roomsApi.createRoom(payload);
        onSuccess?.('Yangi xona muvaffaqiyatli yaratildi');
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Xonani saqlashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 text-indigo-700">
            {isEditing ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            <h3 className="font-bold text-slate-900">
              {isEditing ? `Xona № ${room.roomNumber} ni tahrirlash` : 'Yangi xona qo‘shish'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Xona raqami
            </label>
            <input
              type="text"
              required
              placeholder="Masalan: 401"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Xona turi
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {ROOM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sig‘im (kishi)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kunlik narx (so‘m)
            </label>
            <input
              type="number"
              min="1000"
              step="50000"
              required
              placeholder="350000"
              value={pricePerNight}
              onChange={(e) => setPricePerNight(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {isEditing && (
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Xona faol (mijozlar bron qilishi mumkin)
                </span>
              </label>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{isEditing ? 'Saqlash' : 'Yaratish'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
