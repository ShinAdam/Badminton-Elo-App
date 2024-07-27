import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import { Alert, Container, Nav, Navbar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './NavigationBar.css';

const NavigationBar = () => {
    const { isAuthenticated, logout, currentUserId, currentUsername } = useAuth();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
    }, [isAuthenticated]);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const handleCreateMatchClick = () => {
        if (!isAuthenticated) {
            setErrorMessage('You need to be logged in to create a match.');
            setTimeout(() => setErrorMessage(''), 3000);
            navigate('/auth/login');
        } else {
            navigate('/matches/create');
        }
    };

    const handleDashboardClick = () => {
        if (!isAuthenticated) {
            setErrorMessage('You need to be logged in to access the dashboard.');
            setTimeout(() => setErrorMessage(''), 3000);
            navigate('/auth/login');
        } else if (currentUserId) {
            navigate(`/users/${currentUserId}`);
        } else {
            setErrorMessage('Unable to retrieve user information.');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    return (
        <>
            <Navbar bg="light" expand="lg">
                <Container>
                    <Navbar.Brand as={Link} to="/">
                        ShuttleStats
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ml-auto">
                            <Nav.Link as={Link} to="/users/ranking">
                                Ranking
                            </Nav.Link>
                            <Nav.Link as={Link} to="/statistics/full_match_history">
                                Full Match History
                            </Nav.Link>
                            <Nav.Link as="button" onClick={handleDashboardClick}>
                                Dashboard
                            </Nav.Link>
                            <Nav.Link as="button" onClick={handleCreateMatchClick}>
                                Create Match
                            </Nav.Link>
                            {isAuthenticated ? (
                                <>
                                    <Nav.Link as="button" onClick={handleLogout}>
                                        Logout
                                    </Nav.Link>
                                    <Nav.Item className="d-flex align-items-center">
                                        <span className="mr-2">Logged in as {currentUsername}</span>
                                    </Nav.Item>
                                </>
                            ) : (
                                <Nav.Link as={Link} to="/auth/login">
                                    Login
                                </Nav.Link>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            {errorMessage && (
                <Container className="mt-3">
                    <Alert variant="danger" className="text-center">
                        {errorMessage}
                    </Alert>
                </Container>
            )}
        </>
    );
};

export default NavigationBar;
