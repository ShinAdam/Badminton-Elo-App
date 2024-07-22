import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Import the CSS file for styling

function Home() {
  return (
    <div className="home-page">
      <h1 className="home-title">Welcome to the Badminton Stats App</h1>
      <div className="navigation-buttons">
        <Link to="/users/ranking" className="nav-button">
          View Rankings
        </Link>
        <Link to="/auth/login" className="nav-button">
          Login
        </Link>
      </div>
    </div>
  );
}

export default Home;
