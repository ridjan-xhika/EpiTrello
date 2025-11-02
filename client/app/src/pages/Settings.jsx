import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const [stats, setStats] = useState({
    totalBoards: 0,
    totalColumns: 0,
    totalCards: 0
  });
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { boards } = await api.getBoards();
        
        let totalColumns = 0;
        let totalCards = 0;

        // Fetch full details for each board to count cards
        const boardPromises = boards.map(board => api.getBoard(board.id));
        const fullBoards = await Promise.all(boardPromises);

        fullBoards.forEach(({ board }) => {
          totalColumns += board.columns.length;
          board.columns.forEach(column => {
            totalCards += column.cards.length;
          });
        });

        setStats({
          totalBoards: boards.length,
          totalColumns,
          totalCards
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="settings-section">
        <h2>👤 Account</h2>
        <div className="profile-info">
          <p><strong>Name:</strong> {currentUser?.name}</p>
          <p><strong>Email:</strong> {currentUser?.email}</p>
          <p><strong>Username:</strong> {currentUser?.username}</p>
        </div>
      </div>

      <div className="settings-section">
        <h2>📊 Your Activity</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.totalBoards}</h3>
            <p>BOARDS</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalColumns}</h3>
            <p>LISTS</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalCards}</h3>
            <p>CARDS</p>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2>ℹ️ About EpiTrelloo</h2>
        <p style={{color: '#5e6c84', fontSize: '0.875rem', lineHeight: '1.6'}}>
          A Trello-inspired project management tool built with React, Express, and MySQL. 
          Organize your work with boards, lists, and cards.
        </p>
      </div>

      <div className="settings-section">
        <h2>✨ Features</h2>
        <ul className="features-list">
          <li>Create and manage multiple boards</li>
          <li>Add lists to organize your workflow</li>
          <li>Create cards with titles and descriptions</li>
          <li>Drag and drop cards between lists</li>
          <li>Edit and delete cards</li>
          <li>User authentication with sessions</li>
          <li>Data persistence with MySQL</li>
        </ul>
      </div>
    </div>
  );
};

export default Settings