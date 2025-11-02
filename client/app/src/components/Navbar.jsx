import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import '../styles/navbar.css';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <svg width="100" height="24" viewBox="0 0 100 24" fill="none">
            <rect x="0" y="0" width="7" height="24" rx="1.5" fill="white"/>
            <rect x="10" y="0" width="7" height="18" rx="1.5" fill="white"/>
          </svg>
          <span>EpiTrelloo</span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className="navbar-link">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M0 2a2 2 0 012-2h4a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2zm8 0a2 2 0 012-2h4a2 2 0 012 2v8a2 2 0 01-2 2h-4a2 2 0 01-2-2V2z"/>
            </svg>
            Boards
          </Link>
          <Link to="/organizations" className="navbar-link">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 7a2 2 0 100-4 2 2 0 000 4zm0 1a3 3 0 100-6 3 3 0 000 6zm-3 2a2 2 0 00-2 2v2a1 1 0 102 0v-2h6v2a1 1 0 102 0v-2a2 2 0 00-2-2H5z"/>
            </svg>
            Organizations
          </Link>
          <button onClick={toggleTheme} className="navbar-theme-toggle" title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 .278a.768.768 0 01.08.858 7.208 7.208 0 00-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 01.81.316.733.733 0 01-.031.893A8.349 8.349 0 018.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 016 .278z"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 11a3 3 0 110-6 3 3 0 010 6zm0 1a4 4 0 100-8 4 4 0 000 8zM8 0a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2A.5.5 0 018 0zm0 13a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2A.5.5 0 018 13zm8-5a.5.5 0 01-.5.5h-2a.5.5 0 010-1h2a.5.5 0 01.5.5zM3 8a.5.5 0 01-.5.5h-2a.5.5 0 010-1h2A.5.5 0 013 8zm10.657-5.657a.5.5 0 010 .707l-1.414 1.415a.5.5 0 11-.707-.708l1.414-1.414a.5.5 0 01.707 0zm-9.193 9.193a.5.5 0 010 .707L3.05 13.657a.5.5 0 01-.707-.707l1.414-1.414a.5.5 0 01.707 0zm9.193 2.121a.5.5 0 01-.707 0l-1.414-1.414a.5.5 0 01.707-.707l1.414 1.414a.5.5 0 010 .707zM4.464 4.465a.5.5 0 01-.707 0L2.343 3.05a.5.5 0 11.707-.707l1.414 1.414a.5.5 0 010 .708z"/>
              </svg>
            )}
          </button>
          <div className="navbar-user">
            <Link to="/profile" className="navbar-avatar-link">
              <div className="navbar-avatar">
                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </Link>
            <span className="navbar-username">{currentUser?.name}</span>
            <button onClick={handleLogout} className="navbar-logout">
              Log out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;