import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import './UserProfile.css'; // Import the CSS file

function UserProfile() {
  const { user_id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [matches, setMatches] = useState([]);
  const [winPercentage, setWinPercentage] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get(`/users/${user_id}`);
        setUser(response.data);
        setWinPercentage(response.data.win_percentage);
        console.log('User Data:', response.data); // Debugging statement
      } catch (err) {
        setError('Failed to fetch user data');
        console.error('Error fetching user data:', err); // Debugging statement
      }
    };

    const fetchUserMatches = async () => {
      try {
        const response = await axiosInstance.get(`/users/${user_id}/matches`);
        setMatches(response.data);
        console.log('User Matches:', response.data); // Debugging statement
      } catch (err) {
        setError('Failed to fetch user matches');
        console.error('Error fetching user matches:', err); // Debugging statement
      }
    };

    const fetchCurrentUserId = async () => {
      try {
        const response = await axiosInstance.get('/auth/self');
        setCurrentUserId(response.data.id);
        console.log('Current User ID:', response.data.id); // Debugging statement
      } catch (err) {
        // Do not redirect to login; handle errors gracefully
        if (err.response && err.response.status === 401) {
          console.warn('Not authenticated, but still show user profile');
          // Optionally: show message or handle specific behavior
        } else {
          setError('Failed to fetch current user data');
          console.error('Error fetching current user data:', err); // Debugging statement
        }
      }
    };

    fetchUserData();
    fetchUserMatches();
    fetchCurrentUserId();
  }, [user_id, navigate]);

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!user) {
    return <p className="loading-message">Loading...</p>;
  }

  const pictureUrl = user.picture 
    ? `http://localhost:8000/static/${user.picture}`
    : `http://localhost:8000/static/default.jpg`;

  return (
    <div className="user-profile">
      <h1 className="user-profile-title">User Information</h1>
      <div className="user-details">
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Rating:</strong> {user.rating}</p>
        <p><strong>Win Percentage:</strong> {winPercentage.toFixed(2)}%</p>
        <p><strong>Bio:</strong> {user.bio || 'N/A'}</p>
        <p><strong>Picture:</strong></p>
        {user.picture && (
          <img src={pictureUrl} alt={`${user.username}'s profile`} className="profile-picture" />
        )}
      </div>
      {currentUserId && currentUserId.toString() === user.id.toString() && (
        <div className="edit-profile">
          <Link to={`/users/${user.id}/edit`} className="nav-button">
            Edit Profile
          </Link>
        </div>
      )}
      <h2 className="matches-title">Matches</h2>
      <div className="matches-container">
        {matches.length > 0 ? (
          matches.map((match) => (
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
          ))
        ) : (
          <p>No matches found.</p>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
