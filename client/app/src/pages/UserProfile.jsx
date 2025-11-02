import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/user-profile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const { user } = await api.getUserProfile(userId);
      setUser(user);
    } catch (err) {
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="user-profile-container">
        <div className="user-profile-loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="user-profile-container">
        <div className="user-profile-error">
          <h2>😔 User Not Found</h2>
          <p>{error || 'This user does not exist'}</p>
          <button onClick={() => navigate('/')} className="btn-back">
            ← Back to Boards
          </button>
        </div>
      </div>
    );
  }

  const joinedDate = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="user-profile-container">
      <div className="user-profile-wrapper">
        <div className="user-profile-header">
          <div className="user-profile-avatar-large">
            {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
          </div>
          <div className="user-profile-header-info">
            <h1>{user.name}</h1>
            <p className="user-profile-username">@{user.username}</p>
          </div>
        </div>

        <div className="user-profile-content">
          <div className="user-profile-section">
            <h2>📝 Bio</h2>
            <p className="user-profile-bio">
              {user.bio || 'This user hasn\'t added a bio yet.'}
            </p>
          </div>

          <div className="user-profile-stats">
            <div className="user-profile-stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-info">
                <div className="stat-label">Joined</div>
                <div className="stat-value">{joinedDate}</div>
              </div>
            </div>

            <div className="user-profile-stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <div className="stat-label">Boards</div>
                <div className="stat-value">{user.boardsCount || 0}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="user-profile-actions">
          <button onClick={() => navigate(-1)} className="btn-back-secondary">
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
