import { jwtDecode } from 'jwt-decode'; // Corrected the import statement
import React, { useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
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
            <div className="form-container">
                <h2 className="login-header">Login</h2>
                {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="form-group" controlId="formUsername">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="form-group" controlId="formPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" className="submit-button">
                        Login
                    </Button>
                </Form>
                <div className="action-buttons">
                    <Button variant="link" onClick={() => navigate('/')}>
                        Back to Home
                    </Button>
                    <Button variant="link" onClick={() => navigate('/auth/register')}>
                        Don't have an account? Sign up
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Login;
