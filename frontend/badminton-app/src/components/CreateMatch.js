import React, { useEffect, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import './CreateMatch.css'; // Import the CSS file

const CreateMatch = () => {
    const navigate = useNavigate();
    const [usernames, setUsernames] = useState([]);
    const [winner1, setWinner1] = useState('');
    const [winner2, setWinner2] = useState('');
    const [loser1, setLoser1] = useState('');
    const [loser2, setLoser2] = useState('');
    const [winnerScore, setWinnerScore] = useState('');
    const [loserScore, setLoserScore] = useState('');
    const [datePlayed, setDatePlayed] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsernames = async () => {
            try {
                const response = await axiosInstance.get('/users/ranking');
                setUsernames(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUsernames();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Check if the selected date is in the future
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        if (datePlayed > today) {
            setError('Date cannot be in the future.');
            return;
        }
    
        const matchData = {
            winners: [winner1, winner2],
            losers: [loser1, loser2],
            winner_score: winnerScore,
            loser_score: loserScore,
            date_played: datePlayed,
        };
    
        try {
            const response = await axiosInstance.post('/matches/create', matchData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (response.status === 200) {
                console.log('Response data:', response.data); // Log the response data
                const { id: matchId } = response.data; // Extract match_id from response data
                
                if (matchId) {
                    navigate(`/matches/${matchId}`); // Redirect to the created match page
                } else {
                    setError('Match ID not received. Unable to navigate.');
                }
            } else {
                setError('Failed to create match. Please try again.');
            }
        } catch (error) {
            setError('Exactly 4 unique users must be provided in a match.');
        }
    };

    return (
        <div className="create-match-container">
            <div className="form-container">
                <h2 className="form-header">Create Match</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="form-group" controlId="formWinner1">
                        <Form.Label>Winner 1</Form.Label>
                        <Form.Control
                            as="select"
                            value={winner1}
                            onChange={(e) => setWinner1(e.target.value)}
                            required
                        >
                            <option value="" disabled>Select Winner 1</option>
                            {usernames.map((user) => (
                                <option key={user.id} value={user.id}>{user.username}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group className="form-group" controlId="formWinner2">
                        <Form.Label>Winner 2</Form.Label>
                        <Form.Control
                            as="select"
                            value={winner2}
                            onChange={(e) => setWinner2(e.target.value)}
                            required
                        >
                            <option value="" disabled>Select Winner 2</option>
                            {usernames.map((user) => (
                                <option key={user.id} value={user.id}>{user.username}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group className="form-group" controlId="formLoser1">
                        <Form.Label>Loser 1</Form.Label>
                        <Form.Control
                            as="select"
                            value={loser1}
                            onChange={(e) => setLoser1(e.target.value)}
                            required
                        >
                            <option value="" disabled>Select Loser 1</option>
                            {usernames.map((user) => (
                                <option key={user.id} value={user.id}>{user.username}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group className="form-group" controlId="formLoser2">
                        <Form.Label>Loser 2</Form.Label>
                        <Form.Control
                            as="select"
                            value={loser2}
                            onChange={(e) => setLoser2(e.target.value)}
                            required
                        >
                            <option value="" disabled>Select Loser 2</option>
                            {usernames.map((user) => (
                                <option key={user.id} value={user.id}>{user.username}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group className="form-group" controlId="formWinnerScore">
                        <Form.Label>Winner Score</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Winner Score"
                            value={winnerScore}
                            onChange={(e) => setWinnerScore(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="form-group" controlId="formLoserScore">
                        <Form.Label>Loser Score</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Loser Score"
                            value={loserScore}
                            onChange={(e) => setLoserScore(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="form-group" controlId="formDatePlayed">
                        <Form.Label>Date of Match</Form.Label>
                        <Form.Control
                            type="date"
                            placeholder="Date of Match"
                            value={datePlayed}
                            onChange={(e) => setDatePlayed(e.target.value)}
                            max={new Date().toISOString().split('T')[0]} // Restrict future dates
                            required
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" className="submit-button">
                        Create Match
                    </Button>
                </Form>
            </div>
        </div>
    );
};

export default CreateMatch;
