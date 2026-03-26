import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

function setAuthHeader(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('waysafe_token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('waysafe_user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    setAuthHeader(token);
  }, [token]);

  function persist(nextToken, nextUser) {
    localStorage.setItem('waysafe_token', nextToken);
    if (nextUser) localStorage.setItem('waysafe_user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser || null);
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    persist(data.token, data.user);
    return data.user;
  }

  async function register(dati) {
    const { data } = await api.post('/auth/register', dati);
    persist(data.token, data.user);
    return data.user;
  }

  function loginConToken(nextToken) {
    persist(nextToken, null);
  }

  function logout() {
    localStorage.removeItem('waysafe_token');
    localStorage.removeItem('waysafe_user');
    setAuthHeader(null);
    setToken(null);
    setUser(null);
  }

  function updateUser(nextUser) {
    localStorage.setItem('waysafe_user', JSON.stringify(nextUser));
    setUser(nextUser);
  }

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token),
    login,
    register,
    loginConToken,
    updateUser,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
