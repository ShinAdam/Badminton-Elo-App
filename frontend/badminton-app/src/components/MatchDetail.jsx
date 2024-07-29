import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';

function MatchDetail() {
  const { match_id } = useParams();
  const [match, setMatch] = useState(null);
  const [creatorUsername, setCreatorUsername] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        const response = await axiosInstance.get(`/matches/${match_id}`);
        setMatch(response.data);

        const userResponse = await axiosInstance.get(`/users/${response.data.creator_id}`);
        setCreatorUsername(userResponse.data.username);
      } catch (err) {
        setError('Failed to fetch match details or creator username');
      }
    };

    fetchMatchDetails();
  }, [match_id]);

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString();
  };

  if (error) {
    return <p className="error-message text-center">{error}</p>;
  }

  if (!match) {
    return <p className="text-center">Loading...</p>;
  }

  return (
    <div className="container my-4">
      <h1 className="text-center mb-4">Match Details</h1>

      <table className="table table-bordered table-striped table-custom">
        <thead>
          <tr>
            <th className="text-center d-none d-md-table-cell compact-column">ELO Change</th>
            <th className="text-center d-none d-md-table-cell compact-column">Average Rating</th>
            <th className="text-center">Usernames</th>
            <th className="text-center compact-column">Score</th>
            <th className="text-center">Usernames</th>
            <th className="text-center d-none d-md-table-cell compact-column">Average Rating</th>
            <th className="text-center d-none d-md-table-cell compact-column">ELO Change</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-center d-none d-md-table-cell winner-section compact-column">
              <strong>+{match.elo_change_winner}</strong>
            </td>
            <td className="text-center d-none d-md-table-cell winner-section compact-column">
              {Math.round(match.winner_avg_rating)}
            </td>
            <td className="text-center winner-section">
              {match.winner_usernames.split(',').map((username, index) => (
                <div key={index} className="username">{username.trim()}</div>
              ))}
            </td>
            <td className="text-center score-section compact-column">
              <span>{match.winner_score} - {match.loser_score}</span>
              <div className="text-center date-section">
                {formatDate(match.date_played)}
              </div>
            </td>
            <td className="text-center loser-section">
              {match.loser_usernames.split(',').map((username, index) => (
                <div key={index} className="username">{username.trim()}</div>
              ))}
            </td>
            <td className="text-center d-none d-md-table-cell loser-section compact-column">
              {Math.round(match.loser_avg_rating)}
            </td>
            <td className="text-center d-none d-md-table-cell loser-section compact-column">
              <strong>{match.elo_change_loser}</strong>
            </td>
          </tr>
          <tr>
            <td colSpan="7" className="text-center">
              <strong>Match Creator:</strong> {creatorUsername}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Mobile-only container */}
      <div className="d-block d-md-none mt-4">
        <h3 className="text-center mb-3">Match Summary</h3>
        <div className="mobile-summary text-center">
          <div>
            <strong>Winner ELO Change:</strong> +{match.elo_change_winner}
          </div>
          <div>
            <strong>Winner Average Rating:</strong> {Math.round(match.winner_avg_rating)}
          </div>
          <div>
            <strong>Loser ELO Change:</strong> {match.elo_change_loser}
          </div>
          <div>
            <strong>Loser Average Rating:</strong> {Math.round(match.loser_avg_rating)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchDetail;
