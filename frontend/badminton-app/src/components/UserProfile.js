import 'chart.js/auto';
import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import './UserProfile.css';

function UserProfile() {
  const { user_id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [matches, setMatches] = useState([]);
  const [winPercentage, setWinPercentage] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [profileUsername, setProfileUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get(`/users/${user_id}`);
        setUser(response.data);
        setWinPercentage(Math.round(response.data.win_percentage));
        setProfileUsername(response.data.username);
      } catch (err) {
        setError('Failed to fetch user data');
      }
    };

    const fetchUserMatches = async () => {
      try {
        const response = await axiosInstance.get(`/users/${user_id}/matches`);
        const sortedMatches = response.data.sort((a, b) => new Date(b.date_played) - new Date(a.date_played));
        setMatches(sortedMatches);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setMatches([]);
        } else {
          setError('Failed to fetch user matches');
        }
      }
    };

    const fetchCurrentUserId = async () => {
      try {
        const response = await axiosInstance.get('/auth/self');
        setCurrentUserId(response.data.id);
      } catch (err) {
        if (err.response && err.response.status === 401) {
        } else {
          setError('Failed to fetch current user data');
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
    ? `${user.picture}`
    : `default.jpg`;

  const winLossData = {
    labels: ['Wins', 'Losses'],
    datasets: [
      {
        data: [winPercentage, 100 - winPercentage],
        backgroundColor: ['#4171d6', '#e84057'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    cutout: '70%',
  };

  return (
    <div className="user-profile">
      <div className="profile-header">
        <img 
          src={pictureUrl} 
          alt={`${user.username}'s profile`} 
          className="profile-picture" 
        />
        <h1 className="profile-username">{user.username}</h1>
        <div className="profile-elo-container">
          <p className="profile-elo">ELO: {Math.round(user.rating)}</p>
          <div className="win-percentage-chart">
            <Doughnut data={winLossData} options={options} />
            <div className="win-percentage-text">
              {winPercentage}%
            </div>
          </div>
        </div>
      </div>
      <div className="user-details">
        <p><strong>Bio:</strong> {user.bio || 'N/A'}</p>
      </div>
      {currentUserId && currentUserId.toString() === user.id.toString() && (
        <div className="edit-profile">
          <Link to={`/users/${user.id}/edit`} className="nav-button">
            Edit Profile
          </Link>
        </div>
      )}
<div className="container my-4">
      <h1 className="text-center mb-4">Match History</h1>
      
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
            {matches.map((match) => {
              const isUserWinner = match.winner_usernames.includes(user.username);
              return (
                <tr
                  key={match.id}
                  className="match-row"
                  onClick={() => window.location.href = `/matches/${match.id}`}
                  style={{ cursor: 'pointer' }}
                >
                  {isUserWinner ? (
                    <>
                      <td className="text-center d-none d-md-table-cell winner-section"><strong>+{match.elo_change_winner}</strong></td>
                      <td className="text-center d-none d-md-table-cell winner-section">{Math.round(match.winner_avg_rating)}</td>
                      <td className="text-center winner-section">
                        {match.winner_usernames.split(',').map((username, index) => (
                          <div key={index} style={{ fontWeight: username.trim() === profileUsername ? 'bold' : 'normal' }}>
                            {username.trim()}
                          </div>
                        ))}
                      </td>
                      <td className="text-center winner-section">
                        {match.winner_score} - {match.loser_score}
                        <div className="text-center date-section">
                          {new Date(match.date_played).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="text-center winner-section">
                        {match.loser_usernames.split(',').map((username, index) => (
                          <div key={index} style={{ fontWeight: username.trim() === profileUsername ? 'bold' : 'normal' }}>
                            {username.trim()}
                          </div>
                        ))}
                      </td>
                      <td className="text-center d-none d-md-table-cell winner-section">{Math.round(match.loser_avg_rating)}</td>
                      <td className="text-center d-none d-md-table-cell winner-section">{match.elo_change_loser}</td>
                    </>
                  ) : (
                    <>
                      <td className="text-center d-none d-md-table-cell loser-section"><strong>{match.elo_change_loser}</strong></td>
                      <td className="text-center d-none d-md-table-cell loser-section">{Math.round(match.loser_avg_rating)}</td>
                      <td className="text-center loser-section">
                        {match.loser_usernames.split(',').map((username, index) => (
                          <div key={index} style={{ fontWeight: username.trim() === profileUsername ? 'bold' : 'normal' }}>
                            {username.trim()}
                          </div>
                        ))}
                      </td>
                      <td className="text-center loser-section">
                        {match.loser_score} - {match.winner_score}
                        <div className="text-center date-section">
                          {new Date(match.date_played).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="text-center loser-section">
                        {match.winner_usernames.split(',').map((username, index) => (
                          <div key={index} style={{ fontWeight: username.trim() === profileUsername ? 'bold' : 'normal' }}>
                            {username.trim()}
                          </div>
                        ))}
                      </td>
                      <td className="text-center d-none d-md-table-cell loser-section">{Math.round(match.winner_avg_rating)}</td>
                      <td className="text-center d-none d-md-table-cell loser-section">+{match.elo_change_winner}</td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
          </table>
    </div>
    </div>
  );
}

export default UserProfile;
