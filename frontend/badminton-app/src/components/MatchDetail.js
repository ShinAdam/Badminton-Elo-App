import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import './MatchDetail.css'; // Import the CSS file

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

        // Fetch creator username
        const userResponse = await axiosInstance.get(`/users/${response.data.creator_id}`);
        setCreatorUsername(userResponse.data.username);
      } catch (err) {
        setError('Failed to fetch match details or creator username');
      }
    };

    fetchMatchDetails();
  }, [match_id]);

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!match) {
    return <p className="loading-message">Loading...</p>;
  }

  return (
    <div className="match-detail container">
      <h1 className="match-title text-center my-4">Match Details</h1>
      <div className="table-container">
        <table className="table table-bordered table-striped match-table">
          <thead className="thead-dark">
            <tr>
              <th className="text-center winner-section">ELO Change</th>
              <th className="text-center winner-section">Average Rating</th>
              <th className="text-center winner-section">Usernames</th>
              <th className="text-center score-section">Score</th>
              <th className="text-center loser-section">Usernames</th>
              <th className="text-center loser-section">Average Rating</th>
              <th className="text-center loser-section">ELO Change</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-center winner-section">
                <span className="elo-change"><strong>+{match.elo_change_winner}</strong></span>
              </td>
              <td className="text-center winner-section">
                {Math.round(match.winner_avg_rating)}
              </td>
              <td className="text-center winner-section">
                {match.winner_usernames.split(',').map((username, index) => (
                  <div key={index} className="username">{username.trim()}</div>
                ))}
              </td>
              <td className="text-center score-section">
                <span className="score">{match.winner_score} - {match.loser_score}</span>
                <div className="match-date">
                  {new Date(match.date_played).toLocaleDateString()}
                </div>
              </td>
              <td className="text-center loser-section">
                {match.loser_usernames.split(',').map((username, index) => (
                  <div key={index} className="username">{username.trim()}</div>
                ))}
              </td>
              <td className="text-center loser-section">
                {Math.round(match.loser_avg_rating)}
              </td>
              <td className="text-center loser-section">
                <span className="elo-change"><strong>{match.elo_change_loser}</strong></span>
              </td>
            </tr>
            <tr>
              <td colSpan="7" className="text-center">
                <strong>Match Creator:</strong> {creatorUsername}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Mobile Version */}
        <table className="table table-bordered table-striped match-table-mobile">
          <thead className="thead-dark">
            <tr>
              <th className="text-center winner-section">Usernames</th>
              <th className="text-center score-section">Score</th>
              <th className="text-center loser-section">Usernames</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-center winner-section">
                {match.winner_usernames.split(',').map((username, index) => (
                  <div key={index} className="username">{username.trim()}</div>
                ))}
              </td>
              <td className="text-center score-section">
                <span className="score">{match.winner_score} - {match.loser_score}</span>
                <div className="match-date">
                  {new Date(match.date_played).toLocaleDateString()}
                </div>
              </td>
              <td className="text-center loser-section">
                {match.loser_usernames.split(',').map((username, index) => (
                  <div key={index} className="username">{username.trim()}</div>
                ))}
              </td>
            </tr>
            <tr>
              <td colSpan="3" className="text-center">
                <strong>Match Creator:</strong> {creatorUsername}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MatchDetail;
