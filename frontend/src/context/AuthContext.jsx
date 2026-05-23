import React, { createContext, useState, useEffect } from 'react';
import axios from '../api/apiClient';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  // Removed useNavigate hook – AuthProvider is rendered outside Router


  const [repos, setRepos] = useState([]);
  const fetchSession = async (t) => {
    try {
      const res = await axios.get('/auth/session', { params: { token: t } });
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setRepos(res.data.repos || []);
    } catch (err) {
      console.error('Session fetch error', err);
    }
  };

  useEffect(() => {
    if (token) fetchSession(token);
  }, [token]);

  const login = () => {
    // Redirect to backend OAuth start
    window.location.href = 'http://localhost:3001/auth/github';
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    // Redirect to home page after logout
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, fetchSession, repos, setRepos }}>
      {children}
    </AuthContext.Provider>
  );
};
