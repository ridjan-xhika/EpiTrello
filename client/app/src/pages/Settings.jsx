import React from 'react';
import { useBoard } from '../context/BoardContext';

const Settings = () => {
  const { boards } = useBoard();

  const totalColumns = boards.reduce((sum, board) => sum + board.columns.length, 0);
  const totalCards = boards.reduce((sum, board) => {
    return sum + board.columns.reduce((colSum, col) => colSum + col.cards.length, 0);
  }, 0);

  return (
    <div className="page-container">
      <h1>Settings</h1>
      
      <div className="settings-section">
        <h2>Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{boards.length}</h3>
            <p>Total Boards</p>
          </div>
          <div className="stat-card">
            <h3>{totalColumns}</h3>
            <p>Total Columns</p>
          </div>
          <div className="stat-card">
            <h3>{totalCards}</h3>
            <p>Total Cards</p>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2>About</h2>
        <p>This is a Trello-like MVP built with React. All data is stored in-memory and will be lost on page refresh.</p>
      </div>

      <div className="settings-section">
        <h2>Features</h2>
        <ul className="features-list">
          <li>Create and manage multiple boards</li>
          <li>Add columns to organize your workflow</li>
          <li>Create cards with titles and descriptions</li>
          <li>Drag and drop cards between columns</li>
          <li>Edit and delete cards</li>
        </ul>
      </div>
    </div>
  );
};

export default Settings;