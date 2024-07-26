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
            <tr>
              <td className="text-center d-none d-md-table-cell winner-section">
                <strong>+{match.elo_change_winner}</strong>
              </td>
              <td className="text-center d-none d-md-table-cell winner-section">
                {Math.round(match.winner_avg_rating)}
              </td>
              <td className="text-center winner-section">
                {match.winner_usernames.split(',').map((username, index) => (
                  <div key={index} className="username">{username.trim()}</div>
                ))}
              </td>
              <td className="text-center score-section">
                <span>{match.winner_score} - {match.loser_score}</span>
                <div className="text-center date-section">
                  {new Date(match.date_played).toLocaleDateString()}
                </div>
              </td>
              <td className="text-center loser-section">
                {match.loser_usernames.split(',').map((username, index) => (
                  <div key={index} className="username">{username.trim()}</div>
                ))}
              </td>
              <td className="text-center d-none d-md-table-cell loser-section">
                {Math.round(match.loser_avg_rating)}
              </td>
              <td className="text-center d-none d-md-table-cell loser-section">
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
      </div>
  )}

export default MatchDetail;
