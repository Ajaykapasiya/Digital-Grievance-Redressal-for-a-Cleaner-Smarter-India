import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userLogin, adminLogin, getUserProfile, setAuthToken } from '../api/api';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = async (formData) => {
    try {
      console.log('Received formData:', formData); // ← add this debug line
      const email = formData.email;
      const password = formData.password;
      const isAdmin = formData.isAdmin || false;

      const payload = { email, password };
      console.log('Login payload:', payload);

      const res = isAdmin ? await adminLogin(payload) : await userLogin(payload);

      if (res?.data?.token) {
        localStorage.setItem('token', res.data.token);
        setAuthToken(res.data.token);
      }

      setUser(res.data.user || { name: res.data.user_name });
      navigate(isAdmin ? '/dashboard' : '/create-complaint');
      return res.data;
    } catch (err) {
      console.error('Login error:', err);
      console.error('Response data:', err.response?.data);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
    navigate('/login');
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
