import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosConfig';
import './FullMatchHistory.css'; // Import the CSS file

function FullMatchHistory() {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatchHistory = async () => {
      try {
        const response = await axiosInstance.get('/statistics/full_match_history');
        setMatches(response.data);
      } catch (err) {
        setError('Failed to fetch match history');
      }
    };

    fetchMatchHistory();
  }, []);

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (matches.length === 0) {
    return <p className="loading-message">No matches found.</p>;
  }

  return (
    <div className="full-match-history">
      <h1 className="history-title">Full Match History</h1>
      <div className="matches-container">
        {matches.map((match) => (
          <div key={match.id} className="match-card">
            <div className="match-info">
              <div className="winner-stats">
                <h3>Winners</h3>
                <p><strong>Rating Change:</strong> {match.elo_change_winner}</p>
                <p><strong>Average Rating:</strong> {match.winner_avg_rating}</p>
                <p><strong>Usernames:</strong> {match.winner_usernames.split(',').join(', ')}</p>
                <p><strong>Score:</strong> {match.winner_score}</p>
              </div>
              <div className="loser-stats">
                <h3>Losers</h3>
                <p><strong>Rating Change:</strong> {match.elo_change_loser}</p>
                <p><strong>Average Rating:</strong> {match.loser_avg_rating}</p>
                <p><strong>Usernames:</strong> {match.loser_usernames.split(',').join(', ')}</p>
                <p><strong>Score:</strong> {match.loser_score}</p>
              </div>
            </div>
            <p><strong>Date Played:</strong> {new Date(match.date_played).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FullMatchHistory;
