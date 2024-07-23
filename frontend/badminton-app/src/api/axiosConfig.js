import axios from 'axios';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to handle login
export const login = async (username, password) => {
  try {
    // Send login request
    const response = await axiosInstance.post('/auth/login', { username, password });
    const { access_token } = response.data;
    
    // Store token and set default headers
    localStorage.setItem('access_token', access_token);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

// Add request interceptor to attach token to headers
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;
