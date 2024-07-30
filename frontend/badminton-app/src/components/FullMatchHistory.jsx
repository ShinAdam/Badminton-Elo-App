import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosConfig';
import './FullMatchHistory.css';

function FullMatchHistory() {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const matchesPerPage = 20;

  useEffect(() => {
    const fetchMatchHistory = async () => {
      try {
        const response = await axiosInstance.get('/statistics/full_match_history');
        const sortedMatches = response.data.sort((a, b) => {
          const dateA = new Date(a.date_played);
          const dateB = new Date(b.date_played);
          if (dateA > dateB) return -1;
          if (dateA < dateB) return 1;
          return b.id - a.id;
        });
        setMatches(sortedMatches);
      } catch (err) {
        setError('Failed to fetch match history');
      }
    };

    fetchMatchHistory();
  }, []);

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

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString();
  };

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (matches.length === 0) {
    return <p className="loading-message">No matches found.</p>;
  }

  const pageNumbers = [];
  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="container my-4">
      <h1 className="text-center mb-4">Full Match History</h1>

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
          {currentMatches.map((match) => (
            <tr
              key={match.id}
              className="match-row"
              onClick={() => window.location.href = `/matches/${match.id}`}
              style={{ cursor: 'pointer' }}
            >
              <td className="text-center d-none d-md-table-cell winner-section compact-column"><strong>+{match.elo_change_winner}</strong></td>
              <td className="text-center d-none d-md-table-cell winner-section compact-column">{Math.round(match.winner_avg_rating)}</td>
              <td className="text-center winner-section flex-column username-column">
                {match.winner_usernames.split(',').map((username, index) => (
                  <div key={index} className="username">{username.trim()}</div>
                ))}
              </td>
              <td className="text-center score-section compact-column">
                {match.winner_score} - {match.loser_score}
                <div className="text-center date-section">
                  {formatDate(match.date_played)}
                </div>
              </td>
              <td className="text-center loser-section flex-column username-column">
                {match.loser_usernames.split(',').map((username, index) => (
                  <div key={index} className="username">{username.trim()}</div>
                ))}
              </td>
              <td className="text-center d-none d-md-table-cell loser-section compact-column">{Math.round(match.loser_avg_rating)}</td>
              <td className="text-center d-none d-md-table-cell loser-section compact-column"><strong>{match.elo_change_loser}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
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
  );
}

export default FullMatchHistory;
