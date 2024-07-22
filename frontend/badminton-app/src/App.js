import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css'; // Create this file for your styles
import CreateMatch from './components/CreateMatch';
import FullMatchHistory from './components/FullMatchHistory';
import Home from './components/Home';
import Login from './components/Login';
import MatchDetail from './components/MatchDetail';
import Ranking from './components/Ranking';
import Register from './components/Register';
import UserProfile from './components/UserProfile';



function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/users/ranking" element={<Ranking />} />
          <Route path="/users/:user_id" element={<UserProfile />} />
          <Route path="/matches/create" element={<CreateMatch />} />
          <Route path="/statistics/full_match_history" element={<FullMatchHistory />} />
          <Route path="/matches/:match_id" element={<MatchDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
