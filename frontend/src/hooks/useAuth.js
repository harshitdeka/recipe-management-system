// hooks/useAuth.js
// Manages JWT token and user state across the app.
// Persists login across page refreshes using localStorage.

import { useState, useEffect } from 'react';
import { authStorage } from '../services/api.js';

export function useAuth() {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // true while restoring session

  // On first render: restore session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem(authStorage.tokenKey);
    const savedUser  = localStorage.getItem(authStorage.userKey);
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        // Corrupted data — clear it
        authStorage.clearSession();
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener(authStorage.expiredEvent, handleAuthExpired);
    return () => {
      window.removeEventListener(authStorage.expiredEvent, handleAuthExpired);
    };
  }, []);

  /** Call this after successful signup or login */
  const login = (authResponse) => {
    const userData = {
      userId:   authResponse.userId,
      username: authResponse.username,
      email:    authResponse.email,
    };
    authStorage.setSession({
      token: authResponse.token,
      user: userData,
    });
    setToken(authResponse.token);
    setUser(userData);
  };

  /** Clear session and return to login page */
  const logout = () => {
    authStorage.clearSession();
    setToken(null);
    setUser(null);
  };

  return {
    user,
    token,
    loading,
    login,
    logout,
    isLoggedIn: !!token,
  };
}
