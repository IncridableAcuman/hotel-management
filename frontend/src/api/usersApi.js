import { api } from './client';

export const usersApi = {
  getMe: () => api.get('/users/me'),
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
};
