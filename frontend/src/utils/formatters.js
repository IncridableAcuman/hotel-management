export function formatMoney(amount) {
  if (amount === undefined || amount === null) return '0 so‘m';
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' so‘m';
}

export function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
}

export function formatDateTime(dateTimeString) {
  if (!dateTimeString) return '-';
  try {
    const d = new Date(dateTimeString);
    return d.toLocaleString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return dateTimeString;
  }
}

export const ROOM_TYPES = [
  { value: 'SINGLE', label: 'Bir kishilik (Single)', capacity: 1 },
  { value: 'DOUBLE', label: 'Ikki kishilik (Double)', capacity: 2 },
  { value: 'DELUXE', label: 'Lyuks (Deluxe)', capacity: 2 },
  { value: 'FAMILY', label: 'Oilaviy (Family)', capacity: 4 },
  { value: 'SUITE', label: 'Prezident Suitasi (Suite)', capacity: 3 },
];

export const BOOKING_STATUS_CONFIG = {
  PENDING: {
    label: 'Kutilmoqda',
    bg: 'bg-amber-100 text-amber-800 border-amber-300',
    dot: 'bg-amber-500',
  },
  CONFIRMED: {
    label: 'Tasdiqlangan',
    bg: 'bg-blue-100 text-blue-800 border-blue-300',
    dot: 'bg-blue-500',
  },
  CHECKED_IN: {
    label: 'Joylashgan (Check-in)',
    bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-500',
  },
  CHECKED_OUT: {
    label: 'Tugallangan (Check-out)',
    bg: 'bg-slate-100 text-slate-800 border-slate-300',
    dot: 'bg-slate-400',
  },
  CANCELLED: {
    label: 'Bekor qilingan',
    bg: 'bg-rose-100 text-rose-800 border-rose-300',
    dot: 'bg-rose-500',
  },
};
