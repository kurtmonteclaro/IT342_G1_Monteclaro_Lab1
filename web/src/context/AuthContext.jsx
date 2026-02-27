import React, { createContext, useCallback, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    const hydrate = async () => {
      try {
        if (!token) return;
        const me = await authAPI.getCurrentUser();
        setUser(me.data);
      } catch {
        setUser(null);
        setToken(null);
      }
    };

    hydrate().finally(() => setLoading(false));
  }, []);

  const login = useCallback((loginData) => {
    setUser(loginData);
    setToken(loginData.token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}
