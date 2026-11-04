import { api, setStoredToken } from './client';

export const authApi = {
  login: async (credentials) => {
    const data = await api.post('/auth/login', credentials);
    if (data.accessToken) {
      setStoredToken(data.accessToken);
    }
    return data;
  },

  register: async (userData) => {
    const data = await api.post('/auth/register', userData);
    if (data.accessToken) {
      setStoredToken(data.accessToken);
    }
    return data;
  },

  refresh: async () => {
    const data = await api.post('/auth/refresh');
    if (data.accessToken) {
      setStoredToken(data.accessToken);
    }
    return data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setStoredToken(null);
    }
  },
};
