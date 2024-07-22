import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import './Ranking.css';

function Ranking() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await axiosInstance.get('/users/ranking');
        setUsers(response.data);
      } catch (err) {
        setError('Failed to fetch ranking');
      }
    };

    fetchRanking();
  }, []);

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (users.length === 0) {
    return <p>Loading...</p>;
  }

  return (
    <div className="ranking-page">
      <h1>Ranking</h1>
      <table className="ranking-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Username</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id}>
              <td>{index + 1}</td>
              <td>
                <Link to={`/users/${user.id}`}>{user.username}</Link>
              </td>
              <td>{user.rating}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Ranking;
