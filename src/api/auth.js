import axios from 'axios';
import API_URL from './config';

export const signup = async (name, email, password) => {
  const response = await axios.post(`${API_URL}/auth/signup`, { name, email, password });
  return response.data;
};

export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  return response.data;
};

export const getMe = async (token) => {
  const response = await axios.get(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
