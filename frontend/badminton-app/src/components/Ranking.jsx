import React, { useEffect, useState } from 'react';
import { Alert, Container, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';

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

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Ranking</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {users.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <Table striped bordered hover responsive>
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
                  <Link to={`/users/${user.id}`} className="text-decoration-none">
                    {user.username}
                  </Link>
                </td>
                <td>{Math.round(user.rating)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default Ranking;
