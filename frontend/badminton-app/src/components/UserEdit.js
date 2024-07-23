import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import './UserEdit.css'; // Import the CSS file for styling

function UserEdit() {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [picture, setPicture] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user data for editing
        const response = await axiosInstance.get(`/users/${user_id}`);
        setUser(response.data);
        setUsername(response.data.username);
        setBio(response.data.bio || '');
      } catch (err) {
        setError('Failed to fetch user data');
      }
    };

    fetchUserData();
  }, [user_id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicture(reader.result); // Set the image as a Base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const updatedUser = {
      username,
      bio,
      picture: picture ? picture.split(',')[1] : null, // Remove the data URL part
    };

    try {
      await axiosInstance.put(`/users/${user_id}/edit`, updatedUser, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setSuccess('Profile updated successfully');
      setTimeout(() => navigate(`/users/${user_id}`), 2000); // Redirect after 2 seconds
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!user) {
    return <p className="loading-message">Loading...</p>;
  }

  return (
    <div className="user-edit">
      <h1 className="user-edit-title">Edit Profile</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="bio">Bio:</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="picture">Profile Picture:</label>
          <input
            type="file"
            id="picture"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        <button type="submit" className="submit-button">Update Profile</button>
        {success && <p className="success-message">{success}</p>}
      </form>
    </div>
  );
}

export default UserEdit;
