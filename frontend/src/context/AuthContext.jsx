import React, { createContext, useContext, useState, useEffect } from 'react';
import { userLogin, adminLogin, getUserProfile, getAdminProfile } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    if (token) {
      loadUserProfile(token, userType);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserProfile = async (token, userType) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await (userType === 'admin' ? getAdminProfile(headers) : getUserProfile(headers));
      setUser({ ...response.data, userType });
    } catch (err) {
      console.error('Profile loading error:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials, isAdmin = false) => {
    setError(null);
    try {
      console.log('Login request:', { ...credentials, isAdmin }); // Debug log
      const response = await (isAdmin ? adminLogin(credentials) : userLogin(credentials));
      console.log('Login response:', response.data); // Debug log

      if (!response.data || !response.data.token) {
        throw new Error('Invalid response from server');
      }

      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userType', isAdmin ? 'admin' : 'user');
      localStorage.setItem('userId', userData._id); // Store user ID in localStorage
      setUser({ ...userData, userType: isAdmin ? 'admin' : 'user' });
      return response.data;
    } catch (err) {
      console.error('Login error:', err.response || err); // Debug log
      const errorMessage = err.response?.data?.error_message || err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId'); // Remove user ID from localStorage on logout
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.userType === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
