// axiosConfig.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
      'Content-Type': 'application/json',
  },
});

export const login = async (username, password) => {
  try {
    const data = new URLSearchParams({
      username: username,
      password: password
    });
    console.log('Login request data:', data.toString()); // Print request data for debugging
    const response = await axiosInstance.post('/auth/login', data);
    const { access_token } = response.data;
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
