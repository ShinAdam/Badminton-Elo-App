import 'chart.js/auto';
import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
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
  const [currentPage, setCurrentPage] = useState(1);
  const matchesPerPage = 10;
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString();
  };

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
        const sortedMatches = response.data.sort((a, b) => {
          const dateA = new Date(a.date_played);
          const dateB = new Date(b.date_played);
          if (dateA > dateB) return -1;
          if (dateA < dateB) return 1;
          return b.id - a.id;
        });
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
          // User is not authenticated
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

  const pictureUrl = user.picture ? `${user.picture}` : `default.jpg`;

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

  const totalPages = Math.ceil(matches.length / matchesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };

  const indexOfLastMatch = currentPage * matchesPerPage;
  const indexOfFirstMatch = indexOfLastMatch - matchesPerPage;
  const currentMatches = matches.slice(indexOfFirstMatch, indexOfLastMatch);

  const pageNumbers = [];
  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
    pageNumbers.push(i);
  }

  return (
    <Container className="user-profile-container">
      <Row className="mb-4">
        <Col xs={12}>
          <div className="user-profile">
            <div className="profile-header text-center">
              <img
                src={pictureUrl}
                alt={`${user.username}'s profile`}
                className="profile-picture"
              />
              <h1 className="profile-username">{user.username}</h1>
              <div className="profile-elo-container d-flex flex-column align-items-center">
                <p className="profile-elo">ELO: {Math.round(user.rating)}</p>
                <div className="win-percentage-chart">
                  <Doughnut data={winLossData} options={options} />
                  <div className="win-percentage-text">
                    {winPercentage}%
                  </div>
                </div>
              </div>
            </div>
            <div className="user-details mt-4">
              <p><strong>Bio:</strong> {user.bio || 'N/A'}</p>
            </div>
            {currentUserId && currentUserId.toString() === user.id.toString() && (
              <div className="edit-profile text-center mt-4">
                <Link to={`/users/${user.id}/edit`}>
                  Edit Profile
                </Link>
              </div>
            )}
          </div>
        </Col>
      </Row>
      <Row className="my-4">
        <Col>
          <h1 className="text-center mb-4">Match History</h1>
          <div className="container">
            <table className="table table-bordered table-striped table-custom">
              <thead>
                <tr>
                  <th className="text-center d-none d-md-table-cell compact-column">ELO Change</th>
                  <th className="text-center d-none d-md-table-cell compact-column">Average Rating</th>
                  <th className="text-center flex-column username-column">Usernames</th>
                  <th className="text-center compact-column">Score</th>
                  <th className="text-center flex-column username-column">Usernames</th>
                  <th className="text-center d-none d-md-table-cell compact-column">Average Rating</th>
                  <th className="text-center d-none d-md-table-cell compact-column">ELO Change</th>
                </tr>
              </thead>
              <tbody>
                {currentMatches.map((match) => {
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
                          <td className="text-center d-none d-md-table-cell winner-section compact-column"><strong>+{match.elo_change_winner}</strong></td>
                          <td className="text-center d-none d-md-table-cell winner-section compact-column">{Math.round(match.winner_avg_rating)}</td>
                          <td className="text-center winner-section flex-column username-column">
                            <div className="username-container">
                              {match.winner_usernames.split(',').map((username, index) => (
                                <div key={index} className="username" style={{ fontWeight: username.trim() === profileUsername ? 'bold' : 'normal' }}>
                                  {username.trim()}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="text-center winner-section compact-column">
                            {match.winner_score} - {match.loser_score}
                            <div className="text-center date-section">
                              {formatDate(match.date_played)}
                            </div>
                          </td>
                          <td className="text-center winner-section flex-column username-column">
                            <div className="username-container">
                              {match.loser_usernames.split(',').map((username, index) => (
                                <div key={index} className="username" style={{ fontWeight: username.trim() === profileUsername ? 'bold' : 'normal' }}>
                                  {username.trim()}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="text-center d-none d-md-table-cell winner-section compact-column">{Math.round(match.loser_avg_rating)}</td>
                          <td className="text-center d-none d-md-table-cell winner-section compact-column">{match.elo_change_loser}</td>
                        </>
                      ) : (
                        <>
                          <td className="text-center d-none d-md-table-cell loser-section compact-column"><strong>{match.elo_change_loser}</strong></td>
                          <td className="text-center d-none d-md-table-cell loser-section compact-column">{Math.round(match.loser_avg_rating)}</td>
                          <td className="text-center loser-section flex-column username-column">
                            <div className="username-container">
                              {match.loser_usernames.split(',').map((username, index) => (
                                <div key={index} className="username" style={{ fontWeight: username.trim() === profileUsername ? 'bold' : 'normal' }}>
                                  {username.trim()}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="text-center loser-section compact-column">
                            {match.loser_score} - {match.winner_score}
                            <div className="text-center date-section">
                              {formatDate(match.date_played)}
                            </div>
                          </td>
                          <td className="text-center loser-section flex-column username-column">
                            <div className="username-container">
                              {match.winner_usernames.split(',').map((username, index) => (
                                <div key={index} className="username" style={{ fontWeight: username.trim() === profileUsername ? 'bold' : 'normal' }}>
                                  {username.trim()}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="text-center d-none d-md-table-cell loser-section compact-column">{Math.round(match.winner_avg_rating)}</td>
                          <td className="text-center d-none d-md-table-cell loser-section compact-column">+{match.elo_change_winner}</td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="pagination text-center">
              <button
                onClick={handleFirstPage}
                disabled={currentPage === 1}
                className="page-item"
              >
                &lt;&lt;
              </button>
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`page-item ${currentPage === number ? 'active' : ''}`}
                >
                  {number}
                </button>
              ))}
              <button
                onClick={handleLastPage}
                disabled={currentPage === totalPages}
                className="page-item"
              >
                &gt;&gt;
              </button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default UserProfile;
