import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentUsername, setCurrentUsername] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthentication = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setIsAuthenticated(false);
                setCurrentUserId(null);
                setCurrentUsername('');
                return;
            }

            try {
                const response = await axiosInstance.get('/auth/self', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsAuthenticated(true);
                setCurrentUserId(response.data.id);
                setCurrentUsername(response.data.username);
            } catch (err) {
                setIsAuthenticated(false);
                setCurrentUserId(null);
                setCurrentUsername('');
            }
        };

        checkAuthentication();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axiosInstance.post('/auth/login', { username, password });
            const { access_token } = response.data;
            localStorage.setItem('access_token', access_token);
            setIsAuthenticated(true);

            // Fetch the user details after logging in
            const userResponse = await axiosInstance.get('/auth/self', {
                headers: { Authorization: `Bearer ${access_token}` }
            });
            setCurrentUserId(userResponse.data.id);
            setCurrentUsername(userResponse.data.username);
        } catch (err) {
            console.error('Login failed', err);
        }
    };

    const logout = async () => {
        try {
            await axiosInstance.post('/auth/logout');
            localStorage.removeItem('access_token');
            setIsAuthenticated(false);
            setCurrentUserId(null);
            setCurrentUsername('');
            navigate('/auth/login');
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, currentUserId, currentUsername }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
