import React, { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import axiosInstance from '../api/axiosConfig';
import './FullMatchHistory.css'; // Import the CSS file

function FullMatchHistory() {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatchHistory = async () => {
      try {
        const response = await axiosInstance.get('/statistics/full_match_history');
        // Sort matches by date_played in descending order
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
    <div className="full-match-history">
      <h1 className="history-title">Full Match History</h1>
      
      {/* Desktop Table */}
      <Table striped bordered hover className="match-table d-none d-md-table">
        <thead>
          <tr>
            <th className="winner-section d-none d-md-table-cell">ELO Change</th>
            <th className="winner-section d-none d-md-table-cell">Average Rating</th>
            <th className="winner-section">Usernames</th>
            <th>Score</th>
            <th className="loser-section">Usernames</th>
            <th className="loser-section d-none d-md-table-cell">Average Rating</th>
            <th className="loser-section d-none d-md-table-cell">ELO Change</th>
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
              <td className="winner-section d-none d-md-table-cell"><strong>+{match.elo_change_winner}</strong></td>
              <td className="winner-section d-none d-md-table-cell">{Math.round(match.winner_avg_rating)}</td>
              <td className="winner-section">
                {match.winner_usernames.split(',').map((username, index) => (
                  <div key={index} className="username">{username.trim()}</div>
                ))}
              </td>
              <td className="score-section">
                {match.winner_score} - {match.loser_score}
                <div className="match-date">
                  {new Date(match.date_played).toLocaleDateString()}
                </div>
              </td>
              <td className="loser-section">
                {match.loser_usernames.split(',').map((username, index) => (
                  <div key={index} className="username">{username.trim()}</div>
                ))}
              </td>
              <td className="loser-section d-none d-md-table-cell">{Math.round(match.loser_avg_rating)}</td>
              <td className="loser-section d-none d-md-table-cell"><strong>{match.elo_change_loser}</strong></td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Mobile Table */}
      <div className="d-md-none">
        {matches.map((match) => (
          <div key={match.id} className="mobile-match-row" onClick={() => window.location.href = `/matches/${match.id}`} style={{ cursor: 'pointer' }}>
            <div className="mobile-winner-section">
              {match.winner_usernames.split(',').map((username, index) => (
                <div key={index} className="username">{username.trim()}</div>
              ))}
            </div>
            <div className="mobile-score-section">
              {match.winner_score} - {match.loser_score}
            </div>
            <div className="mobile-loser-section">
              {match.loser_usernames.split(',').map((username, index) => (
                <div key={index} className="username">{username.trim()}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FullMatchHistory;
