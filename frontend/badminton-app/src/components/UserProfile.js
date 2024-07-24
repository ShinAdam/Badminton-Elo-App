import 'chart.js/auto';
import React, { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { Doughnut } from 'react-chartjs-2';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import './UserProfile.css'; // Import your CSS file

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
        setError('Failed to fetch user matches');
      }
    };

    const fetchCurrentUserId = async () => {
      try {
        const response = await axiosInstance.get('/auth/self');
        setCurrentUserId(response.data.id);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          console.warn('Not authenticated, but still show user profile');
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
        backgroundColor: ['#007bff', '#dc3545'],
        hoverBackgroundColor: ['#0056b3', '#a71d2a'],
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
      <div className="matches-container">
        <h2 className="matches-title">Match History</h2>
        {/* Desktop View Table */}
        <Table striped bordered hover className="match-table d-none d-md-table">
          <thead>
            <tr>
              <th>ELO Change</th>
              <th>Average Rating</th>
              <th>Usernames</th>
              <th>Score</th>
              <th>Usernames</th>
              <th>Average Rating</th>
              <th>ELO Change</th>
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
                      <td className="winner-section d-none d-md-table-cell"><strong>+{match.elo_change_winner}</strong></td>
                      <td className="winner-section d-none d-md-table-cell">{Math.round(match.winner_avg_rating)}</td>
                      <td className="winner-section d-none d-md-table-cell">
                        {match.winner_usernames.split(',').map((username, index) => (
                          <div key={index} style={{ fontWeight: username.trim() === profileUsername ? 'bold' : 'normal' }}>
                            {username.trim()}
                          </div>
                        ))}
                      </td>
                      <td className="winner-section d-none d-md-table-cell">
                        {match.winner_score} - {match.loser_score}
                        <div className="match-date">
                          {new Date(match.date_played).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="winner-section d-none d-md-table-cell">
                        {match.loser_usernames.split(',').map((username, index) => (
                          <div key={index} style={{ fontWeight: username.trim() === profileUsername ? 'bold' : 'normal' }}>
                            {username.trim()}
                          </div>
                        ))}
                      </td>
                      <td className="winner-section d-none d-md-table-cell">{Math.round(match.loser_avg_rating)}</td>
                      <td className="winner-section d-none d-md-table-cell">{match.elo_change_loser}</td>
                    </>
                  ) : (
                    <>
                      <td className="loser-section d-none d-md-table-cell"><strong>{match.elo_change_loser}</strong></td>
                      <td className="loser-section d-none d-md-table-cell">{Math.round(match.loser_avg_rating)}</td>
                      <td className="loser-section d-none d-md-table-cell">
                        {match.loser_usernames.split(',').map((username, index) => (
                          <div key={index} style={{ fontWeight: username.trim() === profileUsername ? 'bold' : 'normal' }}>
                            {username.trim()}
                          </div>
                        ))}
                      </td>
                      <td className="loser-section d-none d-md-table-cell">
                        {match.loser_score} - {match.winner_score}
                        <div className="match-date">
                          {new Date(match.date_played).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="loser-section d-none d-md-table-cell">
                        {match.winner_usernames.split(',').map((username, index) => (
                          <div key={index} style={{ fontWeight: username.trim() === profileUsername ? 'bold' : 'normal' }}>
                            {username.trim()}
                          </div>
                        ))}
                      </td>
                      <td className="loser-section d-none d-md-table-cell">{Math.round(match.winner_avg_rating)}</td>
                      <td className="loser-section d-none d-md-table-cell">+{match.elo_change_winner}</td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </Table>

        {/* Mobile Table */}
        <div className="d-md-none">
          {matches.map((match) => {
            const isUserWinner = match.winner_usernames.includes(user.username);
            return (
              <div
                key={match.id}
                className="mobile-match-row"
                onClick={() => window.location.href = `/matches/${match.id}`}
                style={{ cursor: 'pointer' }}
              >
                {isUserWinner ? (
                  <>
                    <div className="mobile-winner-section">
                      {match.winner_usernames.split(',').map((username, index) => (
                        <div key={index} style={{ fontWeight: username.trim() === profileUsername ? 'bold' : 'normal' }}>
                          {username.trim()}
                        </div>
                      ))}
                    </div>
                    <div className="mobile-winner-section">
                      {match.winner_score} - {match.loser_score}
                      <div className="match-date">
                        {new Date(match.date_played).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mobile-winner-section">
                      {match.loser_usernames.split(',').map((username, index) => (
                        <div key={index} style={{ fontWeight: username.trim() === profileUsername ? 'bold' : 'normal' }}>
                          {username.trim()}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mobile-loser-section">
                      {match.loser_usernames.split(',').map((username, index) => (
                        <div key={index} style={{ fontWeight: username.trim() === profileUsername ? 'bold' : 'normal' }}>
                          {username.trim()}
                        </div>
                      ))}
                    </div>
                    <div className="mobile-loser-section">
                      {match.loser_score} - {match.winner_score}
                      <div className="match-date">
                        {new Date(match.date_played).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mobile-loser-section">
                      {match.winner_usernames.split(',').map((username, index) => (
                        <div key={index} style={{ fontWeight: username.trim() === profileUsername ? 'bold' : 'normal' }}>
                          {username.trim()}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
