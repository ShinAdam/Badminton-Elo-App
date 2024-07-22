import React, { useEffect, useState } from 'react';
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
                // Assuming response.data is an array of user objects
                setUsernames(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUsernames();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

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
                navigate('/'); // Redirect after successful match creation
            } else {
                setError('Failed to create match. Please try again.');
            }
        } catch (error) {
            console.error('Error creating match:', error);
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="create-match-container">
            <h2>Create Match</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit} className="create-match-form">
                <select value={winner1} onChange={(e) => setWinner1(e.target.value)} required>
                    <option value="" disabled>Select Winner 1</option>
                    {usernames.map((user) => (
                        <option key={user.id} value={user.id}>{user.username}</option>
                    ))}
                </select>
                <select value={winner2} onChange={(e) => setWinner2(e.target.value)} required>
                    <option value="" disabled>Select Winner 2</option>
                    {usernames.map((user) => (
                        <option key={user.id} value={user.id}>{user.username}</option>
                    ))}
                </select>
                <select value={loser1} onChange={(e) => setLoser1(e.target.value)} required>
                    <option value="" disabled>Select Loser 1</option>
                    {usernames.map((user) => (
                        <option key={user.id} value={user.id}>{user.username}</option>
                    ))}
                </select>
                <select value={loser2} onChange={(e) => setLoser2(e.target.value)} required>
                    <option value="" disabled>Select Loser 2</option>
                    {usernames.map((user) => (
                        <option key={user.id} value={user.id}>{user.username}</option>
                    ))}
                </select>
                <input
                    type="number"
                    placeholder="Winner Score"
                    value={winnerScore}
                    onChange={(e) => setWinnerScore(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Loser Score"
                    value={loserScore}
                    onChange={(e) => setLoserScore(e.target.value)}
                    required
                />
                <input
                    type="date"
                    placeholder="Date of Match"
                    value={datePlayed}
                    onChange={(e) => setDatePlayed(e.target.value)}
                    required
                />
                <button type="submit">Create Match</button>
            </form>
        </div>
    );
};

export default CreateMatch;
