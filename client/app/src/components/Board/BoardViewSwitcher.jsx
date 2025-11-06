import React from 'react';
import '../../styles/board-views.css';

const BoardViewSwitcher = ({ currentView, onViewChange }) => {
  const views = [
    { id: 'board', name: 'Board', icon: '▦' },
    { id: 'list', name: 'List', icon: '☰' },
    { id: 'calendar', name: 'Calendar', icon: '📅' },
    { id: 'table', name: 'Table', icon: '⊞' }
  ];

  return (
    <div className="view-switcher">
      {views.map(view => (
        <button
          key={view.id}
          className={`view-btn ${currentView === view.id ? 'active' : ''}`}
          onClick={() => onViewChange(view.id)}
          title={view.name}
        >
          <span className="view-icon">{view.icon}</span>
          <span className="view-name">{view.name}</span>
        </button>
      ))}
    </div>
  );
};

export default BoardViewSwitcher;
