import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext); // Custom hook to access AuthContext
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data);
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('token');
          setAuthError('Session expired, please login again.');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    } catch (error) {
      console.error('Login failed:', error);
      setAuthError('Invalid credentials');
    }
    setLoading(false);
  };

  const register = async (name,username, email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await api.post('/auth/register', {name, username, email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    } catch (error) {
      console.error('Registration failed:', error);
      setAuthError('Registration error');
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, authError, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
