import axios from 'axios';

// Base URL for the API
const API_URL = 'http://localhost:8000';

export const login = (credentials) => {
  return axios.post(`${API_URL}/auth/login`, credentials);
};

export const register = (userData) => {
  return axios.post(`${API_URL}/auth/register`, userData);
};

export const getRankings = () => {
  return axios.get(`${API_URL}/statistics/rankings`);
};
