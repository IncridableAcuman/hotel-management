import { api } from './client';

export const bookingsApi = {
  createBooking: (data) => api.post('/bookings', {
    roomId: Number(data.roomId),
    checkInDate: data.checkInDate,
    checkOutDate: data.checkOutDate,
    guestsCount: Number(data.guestsCount),
  }),

  getMyBookings: () => api.get('/bookings/my'),

  getBookingById: (id) => api.get(`/bookings/${id}`),

  cancelBooking: (id) => api.patch(`/bookings/${id}/cancel`),

  getAllBookings: () => api.get('/bookings'),

  confirmBooking: (id) => api.patch(`/bookings/${id}/confirm`),

  checkIn: (id) => api.patch(`/bookings/${id}/check-in`),

  checkOut: (id) => api.patch(`/bookings/${id}/check-out`),

  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
};
