import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('college_erp_token');
      const storedUser = localStorage.getItem('college_erp_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Refresh user profile from backend
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('college_erp_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session restore failed:', err.message);
          localStorage.removeItem('college_erp_token');
          localStorage.removeItem('college_erp_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token, user } = res.data;
      localStorage.setItem('college_erp_token', token);
      localStorage.setItem('college_erp_user', JSON.stringify(user));
      setUser(user);
      return { success: true, user };
    }
    return { success: false, message: res.data.message };
  };

  const logout = () => {
    localStorage.removeItem('college_erp_token');
    localStorage.removeItem('college_erp_user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: Boolean(user),
        loading,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
