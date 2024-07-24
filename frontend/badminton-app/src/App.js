import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css'; // Create this file for your styles
import CreateMatch from './components/CreateMatch';
import FullMatchHistory from './components/FullMatchHistory';
import Home from './components/Home';
import Login from './components/Login';
import MatchDetail from './components/MatchDetail';
import NavigationBar from './components/NavigationBar';
import Ranking from './components/Ranking';
import Register from './components/Register';
import UserEdit from './components/UserEdit';
import UserProfile from './components/UserProfile';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NavigationBar />
        <div className="container"> {/* Bootstrap container class */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/users/ranking" element={<Ranking />} />
            <Route path="/users/:user_id" element={<UserProfile />} />
            <Route path="/users/:user_id/edit" element={<UserEdit />} />
            <Route path="/matches/create" element={<CreateMatch />} />
            <Route path="/statistics/full_match_history" element={<FullMatchHistory />} />
            <Route path="/matches/:match_id" element={<MatchDetail />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
