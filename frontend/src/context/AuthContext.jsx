import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { usersApi } from '../api/usersApi';
import { getStoredToken, setStoredToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await usersApi.getMe();
      setUser(profile);
      return profile;
    } catch (err) {
      console.warn('Failed to load profile:', err.message);
      setUser(null);
      setStoredToken(null);
      return null;
    }
  }, []);

  // Check existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken();
      if (token) {
        await fetchProfile();
      } else {
        // Try refresh token from cookie
        try {
          const res = await authApi.refresh();
          if (res?.accessToken) {
            await fetchProfile();
          }
        } catch (e) {
          // No active session
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [fetchProfile]);

  const login = async (credentials) => {
    setAuthError(null);
    try {
      const data = await authApi.login(credentials);
      const profile = await fetchProfile();
      return { success: true, user: profile, token: data.accessToken };
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const register = async (userData) => {
    setAuthError(null);
    try {
      const data = await authApi.register(userData);
      const profile = await fetchProfile();
      return { success: true, user: profile, token: data.accessToken };
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout warning:', err.message);
    } finally {
      setUser(null);
      setStoredToken(null);
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        isAdmin,
        login,
        register,
        logout,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
