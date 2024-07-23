import axios from 'axios';

// Base URL for the API
const API_URL = 'http://localhost:8000';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = (credentials) => {
    return axiosInstance.post('/auth/login', credentials);
};

export const register = (userData) => {
    return axiosInstance.post('/auth/register', userData);
};

export const getRankings = () => {
    return axiosInstance.get('/statistics/rankings');
};

export default axiosInstance;
