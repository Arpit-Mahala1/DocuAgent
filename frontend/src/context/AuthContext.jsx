import React, { createContext, useState, useEffect } from 'react';
import axios from '../api/apiClient';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const storedToken = localStorage.getItem('token');
  const validStored = storedToken && storedToken !== 'undefined' ? storedToken : null;

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(validStored);
  const [repos, setRepos] = useState([]);

  // ✅ KEY FIX: if we already have a token in localStorage, optimistically
  // treat the user as authenticated immediately — before the async
  // fetchSession call completes. This prevents the guard in App.jsx from
  // firing and redirecting to '/' during the brief window between mount
  // and the session API response.
  const [authenticated, setAuthenticated] = useState(Boolean(validStored));

  // sessionResolved = we've finished checking (success OR failure)
  // Start as true only if there's no token to check (nothing to wait for)
  const [sessionResolved, setSessionResolved] = useState(!validStored);
  const [authLoading, setAuthLoading] = useState(Boolean(validStored));

  const fetchSession = async (t) => {
    const incomingToken = t && t !== 'undefined' ? t : null;

    setAuthLoading(true);

    if (incomingToken) {
      localStorage.setItem('token', incomingToken);
      setToken(incomingToken);
      // Optimistically mark authenticated so guard doesn't fire mid-flight
      setAuthenticated(true);
    }

    try {
      const sessionRes = await axios.get('/auth/session');
      const data = sessionRes.data;

      const returnedToken = data.token && data.token !== 'undefined' ? data.token : null;
      if (returnedToken && !incomingToken) {
        localStorage.setItem('token', returnedToken);
        setToken(returnedToken);
      }

      setUser({ login: data.username, avatar_url: data.avatar_url });
      setRepos(data.repos || []);
      setAuthenticated(true);
      setAuthLoading(false);
      setSessionResolved(true);
      return true;
    } catch (err) {
      console.error('[Auth] /auth/session failed:', err);
      const status = err?.response?.status;

      if (status === 401) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setRepos([]);
        setAuthenticated(false);
        setAuthLoading(false);
        setSessionResolved(true);
        return false;
      }

      // Network/5xx — try fallback endpoints
      try {
        const [userRes, reposRes] = await Promise.all([
          axios.get('/api/user'),
          axios.get('/api/repos'),
        ]);
        setUser(userRes.data.user);
        setRepos(reposRes.data.repos || []);
        setAuthenticated(true);
        setAuthLoading(false);
        setSessionResolved(true);
        return true;
      } catch (fallbackErr) {
        console.error('[Auth] Fallback auth failed:', fallbackErr);
        if (fallbackErr?.response?.status === 401) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setRepos([]);
          setAuthenticated(false);
        }
        setAuthLoading(false);
        setSessionResolved(true);
        return false;
      }
    }
  };

  // On mount: restore session from stored token
  useEffect(() => {
    if (validStored) {
      fetchSession(validStored);
    }
    // If no stored token, sessionResolved is already true (set in useState)
  }, []);

  const login = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    window.location.href = `${apiUrl}/auth/github`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setRepos([]);
    setAuthenticated(false);
    setSessionResolved(true);
    setAuthLoading(false);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      authenticated,
      login,
      logout,
      fetchSession,
      repos,
      setRepos,
      authLoading,
      sessionResolved,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
