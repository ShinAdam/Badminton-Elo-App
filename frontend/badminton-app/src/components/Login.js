import { jwtDecode } from 'jwt-decode';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import './Login.css'; // Import the CSS file

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loginData = { username, password };

        try {
            const response = await axiosInstance.post('/auth/login', loginData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                const { access_token } = response.data;
                const decodedToken = jwtDecode(access_token); // Use named import
                const userId = decodedToken.id; // Extract user ID from token
                
                // Save the token in localStorage
                localStorage.setItem('access_token', access_token);

                // Update the global state or context if needed
                // Example: Force a navigation to trigger UI update
                navigate(`/users/${userId}`, { replace: true }); // Use replace to avoid adding to history stack
                window.location.reload(); // Reload the page
            } else {
                setErrorMessage('Login failed');
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setErrorMessage('Invalid username or password');
            } else {
                setErrorMessage('An unexpected error occurred.');
            }
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <form onSubmit={handleSubmit} className="login-form">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
            <div className="login-links">
                <button onClick={() => navigate('/')}>Back to Home</button>
                <button onClick={() => navigate('/auth/register')}>Register a New User</button>
            </div>
        </div>
    );
};

export default Login;
