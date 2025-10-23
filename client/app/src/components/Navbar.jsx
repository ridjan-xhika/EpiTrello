import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Trello MVP
        </Link>
        <div className="navbar-links">
          <Link to="/" className="navbar-link">Boards</Link>
          <Link to="/settings" className="navbar-link">Settings</Link>
          <div className="navbar-user">
            <span className="navbar-username">{currentUser?.name}</span>
            <button onClick={handleLogout} className="navbar-logout">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;