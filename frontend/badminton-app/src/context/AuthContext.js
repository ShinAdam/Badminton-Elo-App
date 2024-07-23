import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthentication = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setIsAuthenticated(false);
                return;
            }

            try {
                await axiosInstance.get('/auth/self', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsAuthenticated(true);
            } catch (err) {
                setIsAuthenticated(false);
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
        } catch (err) {
            console.error('Login failed', err);
        }
    };

    const logout = async () => {
        try {
            await axiosInstance.post('/auth/logout');
            localStorage.removeItem('access_token');
            setIsAuthenticated(false);
            navigate('/auth/login'); // Redirect to login page
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
