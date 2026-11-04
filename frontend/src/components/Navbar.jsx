import React from 'react';
import { Hotel, User, LogOut, Shield, CalendarCheck, DoorOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeView, setActiveView, onOpenAuth }) {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveView('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition">
              <Hotel className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-900 to-sky-800 bg-clip-text text-transparent">
                LuxeStay
              </span>
              <span className="hidden sm:inline-block ml-1 text-xs px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold uppercase">
                Hotel
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveView('home')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeView === 'home'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <DoorOpen className="w-4 h-4" />
              <span>Xonalar</span>
            </button>

            {user && (
              <button
                onClick={() => setActiveView('my-bookings')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  activeView === 'my-bookings'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Mening bronlarim</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setActiveView('admin')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  activeView === 'admin'
                    ? 'bg-amber-100 text-amber-900 font-semibold border border-amber-300'
                    : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Admin Panel</span>
              </button>
            )}
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-medium text-slate-800 leading-tight">
                    {user.firstName} {user.lastName}
                  </span>
                  <div className="flex items-center justify-end gap-1">
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded font-semibold ${
                        isAdmin
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-semibold text-sm">
                  {user.firstName?.[0] || 'U'}
                </div>

                <button
                  onClick={logout}
                  title="Chiqish (Logout)"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition active:scale-95"
              >
                <User className="w-4 h-4" />
                <span>Kirish / Ro'yxatdan o'tish</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
