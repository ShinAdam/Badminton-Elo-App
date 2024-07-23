import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './NavigationBar.css'; // Import the CSS file for styling

const NavigationBar = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        console.log('NavigationBar - isAuthenticated:', isAuthenticated);
    }, [isAuthenticated]);

    const handleLogout = async () => {
        try {
            await logout(); // Call the logout function from context
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const handleCreateMatchClick = () => {
        if (!isAuthenticated) {
            setErrorMessage('You need to be logged in to create a match.');
            setTimeout(() => setErrorMessage(''), 3000); // Clear the message after 3 seconds
            navigate('/auth/login'); // Redirect to login if not authenticated
        } else {
            navigate('/matches/create'); // Navigate to create match if authenticated
        }
    };

    return (
        <nav className="navbar">
            <ul className="navbar-links">
                <li>
                    <Link to="/users/ranking">Ranking</Link>
                </li>
                <li>
                    <Link to="/statistics/full_match_history">Full Match History</Link>
                </li>
                <li>
                    <button onClick={handleCreateMatchClick} className="nav-button">
                        Create Match
                    </button>
                </li>
                {isAuthenticated ? (
                    <>
                        <li>
                            <button onClick={handleLogout} className="nav-button">
                                Logout
                            </button>
                        </li>
                    </>
                ) : (
                    <li>
                        <Link to="/auth/login">Login</Link>
                    </li>
                )}
            </ul>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
        </nav>
    );
};

export default NavigationBar;
