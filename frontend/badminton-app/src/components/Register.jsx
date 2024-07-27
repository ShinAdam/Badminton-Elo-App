import React, { useEffect, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import './Register.css';

const Register = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [bio, setBio] = useState('');
    const [selectedPicture, setSelectedPicture] = useState('');
    const [presetPictures, setPresetPictures] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [dropdownVisible, setDropdownVisible] = useState(false);

    useEffect(() => {
        // Fetch the list of preset pictures
        const fetchPresetPictures = async () => {
            try {
                const response = await axiosInstance.get('/preset_pictures');
                if (response.status === 200) {
                    const pictures = response.data.pictures.map(pic => `http://localhost:8000${pic}`);
                    setPresetPictures(pictures);
                } else {
                    console.error('Failed to fetch preset pictures');
                }
            } catch (error) {
                console.error('Error fetching preset pictures:', error);
            }
        };

        fetchPresetPictures();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation for username
        const usernameRegex = /^[a-zA-Z0-9]{6,15}$/;
        if (!usernameRegex.test(username)) {
            setErrorMessage('Username must be between 6 and 15 characters long and contain only letters and numbers.');
            return;
        }

        // Validation for password
        if (password.length < 8) {
            setErrorMessage('Password must be at least 8 characters long.');
            return;
        }

        const data = {
            username,
            password,
            bio,
            picture: selectedPicture
        };

        try {
            const response = await axiosInstance.post('/auth/register', data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 201) {
                navigate('/');
            } else {
                console.error('Registration failed');
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setErrorMessage(error.response.data.detail);
            } else {
                setErrorMessage('An unexpected error occurred.');
            }
            console.error('Error:', error);
        }
    };

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handlePictureSelect = (picUrl) => {
        setSelectedPicture(picUrl);
        setDropdownVisible(false);
    };

    return (
        <div className="register-container">
            <div className="form-container">
                <h2 className="mb-4">Register</h2>
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
                        {/* Display error message if username is invalid */}
                        {!/^[a-zA-Z0-9]{6,20}$/.test(username) && (
                            <Form.Text className="text-danger">
                                Username must be between 6 and 20 characters long and contain only letters and numbers.
                            </Form.Text>
                        )}
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
                        {/* Display error message if password is too short */}
                        {password.length > 0 && password.length < 8 && (
                            <Form.Text className="text-danger">
                                Password must be at least 8 characters long.
                            </Form.Text>
                        )}
                    </Form.Group>
                    <Form.Group className="form-group" controlId="formBio">
                        <Form.Label>Bio</Form.Label>
                        <Form.Control
                            as="textarea"
                            placeholder="Tell us about yourself"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="form-group" controlId="formPicture">
                        <Form.Label>Profile Picture</Form.Label>
                        <div className="custom-dropdown">
                            <div
                                className="custom-dropdown-button"
                                onClick={toggleDropdown}
                            >
                                {selectedPicture ? (
                                    <img src={selectedPicture} alt="Selected" />
                                ) : (
                                    'Select a picture'
                                )}
                            </div>
                            <div className={`custom-dropdown-menu ${dropdownVisible ? 'show' : ''}`}>
                                {presetPictures.map((picUrl, index) => (
                                    <div
                                        key={index}
                                        className="custom-dropdown-item"
                                        onClick={() => handlePictureSelect(picUrl)}
                                    >
                                        <img src={picUrl} alt={`Preset ${index}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Form.Group>
                    <Button variant="primary" type="submit" className="submit-button">
                        Register
                    </Button>
                </Form>
                <div className="action-buttons">
                    <Button variant="link" onClick={() => navigate('/')}>
                        Back to Home
                    </Button>
                    <Button variant="link" onClick={() => navigate('/auth/login')}>
                        Already a user? Sign in
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Register;
