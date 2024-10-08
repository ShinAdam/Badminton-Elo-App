import axios from 'axios';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: 'REACT_APP_API_BASE_URL',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to handle login
export const login = async (username, password) => {
  try {
    console.log('Sending login request:', { username, password });
    // Send login request
    const response = await axiosInstance.post('/auth/login', { username, password });
    const { access_token } = response.data;
    
    // Store token and set default headers
    localStorage.setItem('access_token', access_token);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    
    console.log('Login successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

// Add request interceptor to attach token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
