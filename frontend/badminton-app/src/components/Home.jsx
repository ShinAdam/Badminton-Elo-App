import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import axiosInstance from '../api/axiosConfig';
import './Home.css';

function Home() {
  const [recentMatches, setRecentMatches] = useState([]);

  useEffect(() => {
    const fetchRecentMatches = async () => {
      try {
        const response = await axiosInstance.get('/statistics/recent');
        const sortedMatches = response.data.sort((a, b) => {
          const dateA = new Date(a.date_played);
          const dateB = new Date(b.date_played);
          if (dateA > dateB) return -1;
          if (dateA < dateB) return 1;
          return b.id - a.id;
        });
        setRecentMatches(sortedMatches);
      } catch (error) {
        console.error('Failed to fetch recent matches', error);
      }
    };

    fetchRecentMatches();
  }, []);

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString();
  };

  return (
    <Container className="home-page">
      <Row className="text-center mb-4">
        <Col>
          <img src="/shuttlestats_logo.png" alt="ShuttleStats Logo" className="logo-image" />
        </Col>
      </Row>

      <Row className="getting-started-section text-center mb-4">
        <Col>
          <h2>Getting Started 🏁</h2>
          <ol className="list-unstyled">
            <li><span role="img" aria-label="Register" className="step-icon">📝</span> Register your account.</li>
            <li><span role="img" aria-label="Create Match" className="step-icon">🔨</span> Create your doubles matches.</li>
            <li><span role="img" aria-label="Track Performance" className="step-icon">📊</span> Track performance.</li>
            <li><span role="img" aria-label="View Rankings" className="step-icon">🏆</span> View rankings.</li>
            <li><span role="img" aria-label="View Rankings" className="step-icon">🏸</span> Compete with friends.</li>
          </ol>
        </Col>
      </Row>

      <Row className="recent-matches-section text-center mb-4">
        <Col>
          <h2>Recent Matches</h2>
          {recentMatches.length === 0 ? (
            <p>No recent matches found.</p>
          ) : (
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
                {recentMatches.map((match) => (
                  <tr
                    key={match.id}
                    className="match-row"
                    onClick={() => window.location.href = `/matches/${match.id}`}
                    style={{ cursor: 'pointer' }}
                  >
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
                      {match.winner_score} - {match.loser_score}
                      <div className="text-center date-section">
                        {formatDate(match.date_played)}
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
                ))}
              </tbody>
            </table>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
