import { api } from './client';

export const roomsApi = {
  getRooms: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    const queryString = params.toString();
    return api.get(`/rooms${queryString ? `?${queryString}` : ''}`);
  },

  getRoomById: (id) => api.get(`/rooms/${id}`),

  createRoom: (roomData) => api.post('/rooms', {
    roomNumber: roomData.roomNumber,
    type: roomData.type,
    pricePerNight: Number(roomData.pricePerNight),
    capacity: Number(roomData.capacity),
  }),

  updateRoom: (id, roomData) => api.put(`/rooms/${id}`, {
    roomNumber: roomData.roomNumber,
    type: roomData.type,
    pricePerNight: Number(roomData.pricePerNight),
    capacity: Number(roomData.capacity),
    isActive: roomData.isActive,
  }),

  deleteRoom: (id) => api.delete(`/rooms/${id}`),
};
