import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosConfig';
import './FullMatchHistory.css';

function FullMatchHistory() {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatchHistory = async () => {
      try {
        const response = await axiosInstance.get('/statistics/full_match_history');
        const sortedMatches = response.data.sort((a, b) => new Date(b.date_played) - new Date(a.date_played));
        setMatches(sortedMatches);
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
    <div className="container my-4">
      <h1 className="text-center mb-4">Full Match History</h1>
      
        <table className="table table-bordered table-striped table-custom">
          <thead>
            <tr>
              <th className="text-center d-none d-md-table-cell">ELO Change</th>
              <th className="text-center d-none d-md-table-cell">Average Rating</th>
              <th className="text-center">Usernames</th>
              <th className="text-center">Score</th>
              <th className="text-center">Usernames</th>
              <th className="text-center d-none d-md-table-cell">Average Rating</th>
              <th className="text-center d-none d-md-table-cell">ELO Change</th>
            </tr>
          </thead>
          <tbody>
          {matches.map((match) => (
            <tr
              key={match.id}
              className="match-row"
              onClick={() => window.location.href = `/matches/${match.id}`}
              style={{ cursor: 'pointer' }}
            >
              <td className="text-center d-none d-md-table-cell winner-section"><strong>+{match.elo_change_winner}</strong></td>
              <td className="text-center d-none d-md-table-cell winner-section">{Math.round(match.winner_avg_rating)}</td>
              <td className="text-center winner-section">
                {match.winner_usernames.split(',').map((username, index) => (
                  <div key={index} className="username">{username.trim()}</div>
                ))}
              </td>
              <td className="text-center score-section">
                {match.winner_score} - {match.loser_score}
                <div className="text-center date-section">
                  {new Date(match.date_played).toLocaleDateString()}
                </div>
              </td>
              <td className="text-center loser-section">
                {match.loser_usernames.split(',').map((username, index) => (
                  <div key={index} className="username">{username.trim()}</div>
                ))}
              </td>
              <td className="text-center d-none d-md-table-cell loser-section">{Math.round(match.loser_avg_rating)}</td>
              <td className="text-center d-none d-md-table-cell loser-section"><strong>{match.elo_change_loser}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FullMatchHistory;
