import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Notification({ notification, onClose }) {
  if (!notification) return null;

  const { type = 'info', message } = notification;

  const styles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    error: 'bg-rose-50 text-rose-800 border-rose-300',
    info: 'bg-blue-50 text-blue-800 border-blue-300',
  }[type] || 'bg-slate-50 text-slate-800 border-slate-300';

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  }[type] || Info;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md animate-fade-in shadow-xl">
      <div className={`flex items-start gap-3 p-4 rounded-xl border ${styles}`}>
        <Icon className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="flex-1 text-sm font-medium leading-relaxed">{message}</div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition p-0.5 rounded"
          aria-label="Yopish"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
