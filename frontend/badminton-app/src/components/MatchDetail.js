import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import './MatchDetail.css'; // Import the CSS file

function MatchDetail() {
  const { match_id } = useParams();
  const [match, setMatch] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        const response = await axiosInstance.get(`/matches/${match_id}`);
        setMatch(response.data);
      } catch (err) {
        setError('Failed to fetch match details');
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
    <div className="match-detail">
      <h1 className="match-title">Match Details</h1>
      <div className="match-info">
        <p><strong>Match ID:</strong> {match.id}</p>
        <p><strong>Date Played:</strong> {new Date(match.date_played).toLocaleDateString()}</p>
        <p><strong>Creator ID:</strong> {match.creator_id}</p>
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
    </div>
  );
}

export default MatchDetail;
