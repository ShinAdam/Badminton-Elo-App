import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import './Register.css'; // Import the CSS file

const Register = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [bio, setBio] = useState('');
    const [picture, setPicture] = useState(null);
    const [errorMessage, setErrorMessage] = useState(''); // Add error message state

    const handleSubmit = async (e) => {
        e.preventDefault();

        let pictureData = null;

        if (picture) {
            // Convert image to base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                pictureData = reader.result;
                const data = {
                    username,
                    password,
                    bio,
                    picture: pictureData
                };

                try {
                    const response = await axiosInstance.post('/auth/register', data, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.status === 201) { // Check for 201 Created
                        navigate('/'); // Redirect to home page
                    } else {
                        console.error('Registration failed');
                    }
                } catch (error) {
                    if (error.response && error.response.status === 400) {
                        setErrorMessage(error.response.data.detail); // Set error message
                    } else {
                        setErrorMessage('An unexpected error occurred.');
                    }
                    console.error('Error:', error);
                }
            };
            reader.readAsDataURL(picture);
        } else {
            const data = {
                username,
                password,
                bio
            };

            try {
                const response = await axiosInstance.post('/auth/register', data, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.status === 201) { // Check for 201 Created
                    navigate('/'); // Redirect to home page
                } else {
                    console.error('Registration failed');
                }
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    setErrorMessage(error.response.data.detail); // Set error message
                } else {
                    setErrorMessage('An unexpected error occurred.');
                }
                console.error('Error:', error);
            }
        }
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Conditionally render error message */}
            <form onSubmit={handleSubmit} className="register-form">
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
                <textarea
                    placeholder="Bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPicture(e.target.files[0])}
                />
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;
