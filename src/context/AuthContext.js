import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nexabi_token'));
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const userData = await authApi.getMe(token);
          setUser(userData);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Token verification failed:', error);
          logout();
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, [token]);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    if (data.access_token) {
      setToken(data.access_token);
      localStorage.setItem('nexabi_token', data.access_token);
      setIsLoggedIn(true);
      const userData = await authApi.getMe(data.access_token);
      setUser(userData);
      return true;
    }
    return false;
  };

  const signup = async (name, email, password) => {
    await authApi.signup(name, email, password);
    return await login(email, password);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('nexabi_token');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, isLoggedIn, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
