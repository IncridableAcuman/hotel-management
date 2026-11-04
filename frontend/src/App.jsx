import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Notification from './components/Notification';
import AuthModal from './components/AuthModal';
import BookingModal from './components/BookingModal';
import RoomDetailModal from './components/RoomDetailModal';
import HomeView from './pages/HomeView';
import MyBookingsView from './pages/MyBookingsView';
import AdminDashboardView from './pages/AdminDashboardView';

function MainApp() {
  const { user, isAdmin } = useAuth();

  // Active navigation view: 'home' | 'my-bookings' | 'admin'
  const [activeView, setActiveView] = useState('home');

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);
  const [bookingDates, setBookingDates] = useState({ checkIn: '', checkOut: '' });

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRoomId, setDetailRoomId] = useState(null);

  // Global Notification / Toast state
  const [notification, setNotification] = useState(null);

  const notify = ({ type = 'info', message }) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  const handleOpenBooking = (room, checkIn = '', checkOut = '') => {
    setSelectedRoomForBooking(room);
    setBookingDates({ checkIn, checkOut });
    setBookingModalOpen(true);
  };

  const handleViewRoomDetail = (roomId) => {
    setDetailRoomId(roomId);
    setDetailModalOpen(true);
  };

  const handleBookingSuccess = (booking) => {
    notify({
      type: 'success',
      message: `Xona № ${booking.roomNumber} muvaffaqiyatli band qilindi! ID: #${booking.id}`,
    });
    // Direct user to my-bookings view
    setActiveView('my-bookings');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        activeView={activeView}
        setActiveView={(view) => {
          if (view === 'admin' && !isAdmin) {
            notify({ type: 'error', message: 'Ushbu bo‘lim faqat Admin uchun mavjud' });
            return;
          }
          setActiveView(view);
        }}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeView === 'home' && (
          <HomeView
            onBookRoom={handleOpenBooking}
            onViewRoom={handleViewRoomDetail}
            notify={notify}
          />
        )}

        {activeView === 'my-bookings' && (
          <MyBookingsView
            onOpenAuth={() => setAuthModalOpen(true)}
            notify={notify}
          />
        )}

        {activeView === 'admin' && isAdmin && (
          <AdminDashboardView notify={notify} />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(msg) => notify({ type: 'success', message: msg })}
      />

      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        room={selectedRoomForBooking}
        initialCheckIn={bookingDates.checkIn}
        initialCheckOut={bookingDates.checkOut}
        onBookingSuccess={handleBookingSuccess}
        onRequireAuth={() => {
          setBookingModalOpen(false);
          setAuthModalOpen(true);
          notify({ type: 'info', message: 'Xonani bron qilish uchun avval profilingizga kiring' });
        }}
      />

      <RoomDetailModal
        roomId={detailRoomId}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setDetailRoomId(null);
        }}
        onBook={(room) => handleOpenBooking(room)}
      />

      {/* Notification Toast */}
      <Notification
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
