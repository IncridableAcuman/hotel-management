import React, { useEffect, useState } from 'react';
import { X, User, Mail, Phone, Shield, Calendar, Clock } from 'lucide-react';
import { usersApi } from '../api/usersApi';
import { formatDateTime } from '../utils/formatters';

export default function UserDetailModal({ userId, isOpen, onClose }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      setError(null);
      usersApi
        .getUserById(userId)
        .then((data) => setUserData(data))
        .catch((err) => setError(err.message || 'Foydalanuvchi ma’lumotini yuklab bo‘lmadi'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 text-indigo-700">
            <User className="w-5 h-5" />
            <h3 className="font-bold text-slate-900">Foydalanuvchi ma’lumotlari</h3>
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
            <div className="py-10 flex flex-col items-center justify-center gap-2 text-slate-500">
              <span className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Yuklanmoqda...</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && userData && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-sm">
                  {userData.firstName?.[0] || 'U'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">
                    {userData.firstName} {userData.lastName}
                  </h4>
                  <span
                    className={`inline-block mt-0.5 text-[11px] font-semibold px-2 py-0.5 rounded ${
                      userData.role === 'ADMIN'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {userData.role}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-slate-500 block">Email:</span>
                    <strong className="text-slate-800">{userData.email}</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-slate-500 block">Telefon:</span>
                    <strong className="text-slate-800">{userData.phone || '-'}</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-slate-500 block">Ro‘yxatdan o‘tgan sana:</span>
                    <strong className="text-slate-800">{formatDateTime(userData.createdAt)}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Yopish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
