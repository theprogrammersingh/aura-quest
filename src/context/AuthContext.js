'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { registerAutoSync, syncOfflineEntries } from '@/lib/offlineStore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncNotification, setSyncNotification] = useState(null);

  // Set up Authorization headers
  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Safe client-side local storage extraction to avoid SSR mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      } else {
        setLoading(false);
      }
    }
  }, []);

  // Load user details if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Error loading user:', err);
        // If offline, we keep the session active
        if (typeof window !== 'undefined' && !navigator.onLine) {
          const cachedUser = localStorage.getItem('cached_user');
          if (cachedUser) {
            setUser(JSON.parse(cachedUser));
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Set up offline automatic sync listener when user logs in
  useEffect(() => {
    if (token && user) {
      registerAutoSync(token, (syncResult) => {
        // Callback when an offline entry is synced successfully
        if (syncResult.user) {
          setUser(syncResult.user);
        }
        setSyncNotification({
          message: 'Offline entries successfully synced with AuraQuest backend!',
          entry: syncResult.entry
        });
        setTimeout(() => setSyncNotification(null), 5000);
      });
      
      // Perform initial sync if online
      if (typeof window !== 'undefined' && navigator.onLine) {
        syncOfflineEntries(token, (syncResult) => {
          if (syncResult.user) {
            setUser(syncResult.user);
          }
        });
      }
    }
  }, [token, user?.id]);

  // Login handler
  const login = async (username, password) => {
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('cached_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Register handler
  const register = async (username, email, password) => {
    setError(null);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('cached_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('cached_user');
    setToken(null);
    setUser(null);
  };

  // Refresh user data (e.g. after earning XP or friends list update)
  const refreshUser = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('cached_user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated,
        syncNotification,
        login,
        register,
        logout,
        refreshUser,
        getHeaders
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
