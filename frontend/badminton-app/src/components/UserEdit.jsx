import React, { useEffect, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import './UserEdit.css';

function UserEdit() {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [selectedPicture, setSelectedPicture] = useState('');
  const [presetPictures, setPresetPictures] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get(`/users/${user_id}`);
        setUser(response.data);
        setUsername(response.data.username);
        setBio(response.data.bio || '');
        setSelectedPicture(response.data.picture || '');
      } catch (err) {
        setErrorMessage('Failed to fetch user data');
      }
    };

    const fetchPresetPictures = async () => {
      try {
        const response = await axiosInstance.get('/preset_pictures');
        if (response.status === 200) {
          const pictures = response.data.pictures.map(pic => `http://api.shuttlestats.com${pic}`);
          setPresetPictures(pictures);
        } else {
          console.error('Failed to fetch preset pictures');
        }
      } catch (error) {
        console.error('Error fetching preset pictures:', error);
      }
    };

    fetchUserData();
    fetchPresetPictures();
  }, [user_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const updatedUser = {
      username,
      bio,
      picture: selectedPicture
    };

    try {
      const response = await axiosInstance.put(`/users/${user_id}/edit`, updatedUser, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        setSuccessMessage('Profile updated successfully');
        setTimeout(() => navigate(`/users/${user_id}`), 2000);
      } else {
        console.error('Profile update failed');
      }
    } catch (err) {
      setErrorMessage('Failed to update profile');
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handlePictureSelect = (picUrl) => {
    setSelectedPicture(picUrl);
    setDropdownVisible(false);
  };

  if (!user) {
    return <Alert variant="info">Loading...</Alert>;
  }

  return (
    <div className="user-edit-container">
      <div className="form-container">
        <h2>Edit Profile</h2>
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="form-group">
            <Form.Label htmlFor="bio">Bio:</Form.Label>
            <Form.Control
              as="textarea"
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="form-group">
            <Form.Label htmlFor="picture">Profile Picture:</Form.Label>
            <div className="custom-dropdown">
              <div
                className="custom-dropdown-button"
                onClick={toggleDropdown}
              >
                {selectedPicture ? (
                  <img src={selectedPicture} alt="Selected" />
                ) : (
                  'Select a picture'
                )}
              </div>
              <div className={`custom-dropdown-menu ${dropdownVisible ? 'show' : ''}`}>
                {presetPictures.map((picUrl, index) => (
                  <div
                    key={index}
                    className="custom-dropdown-item"
                    onClick={() => handlePictureSelect(picUrl)}
                  >
                    <img src={picUrl} alt={`Preset ${index}`} />
                  </div>
                ))}
              </div>
            </div>
          </Form.Group>
          <Button type="submit" className="submit-button">
            Update Profile
          </Button>
        </Form>
      </div>
    </div>
  );
}

export default UserEdit;
