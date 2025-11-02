import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Board from '../components/Board/Board';
import SharingModal from '../components/SharingModal';
import api from '../services/api';

const BoardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSharingModal, setShowSharingModal] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const fetchBoard = async () => {
    try {
      console.log('Fetching board data...');
      setLoading(true);
      const { board: fetchedBoard } = await api.getBoard(id);
      console.log('Board data fetched:', fetchedBoard);
      setBoard(fetchedBoard);
      setError(null);
      
      // Fetch user's role for this board
      try {
        const { role } = await api.getBoardRole(id);
        setUserRole(role);
      } catch (roleErr) {
        console.error('Failed to fetch role:', roleErr);
        setUserRole('read'); // Default to read-only on error
      }
    } catch (err) {
      console.error('Failed to fetch board:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      console.log('Board fetch complete');
    }
  };

  useEffect(() => {
    fetchBoard();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 16 16" fill="currentColor" style={{marginBottom: '1rem', opacity: 0.3}}>
            <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm1 13H7V7h2v6zm0-8H7V3h2v2z"/>
          </svg>
          <h2>Board not found</h2>
          <p style={{color: '#5e6c84', marginBottom: '1.5rem'}}>{error || 'The board you are looking for does not exist.'}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            ← Back to Boards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="board-page">
      <div className="board-page-header">
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <h1 style={{color: 'white', fontSize: '1.125rem', fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.3)', margin: 0}}>{board.title}</h1>
          {userRole === 'read' && (
            <span style={{
              background: 'rgba(255,255,255,0.25)',
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'white'
            }}>
              👁️ Read Only
            </span>
          )}
        </div>
        <div style={{display: 'flex', gap: '0.5rem'}}>
          <button 
            onClick={() => setShowSharingModal(true)} 
            className="btn btn-secondary" 
            style={{background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem'}}
          >
            🤝 Share
          </button>
          <button 
            onClick={() => navigate('/')} 
            className="btn btn-secondary" 
            style={{background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none'}}
          >
            ← Back
          </button>
        </div>
      </div>
      <Board board={board} onUpdate={fetchBoard} userRole={userRole} />
      
      {showSharingModal && (
        <SharingModal 
          boardId={id} 
          onClose={() => setShowSharingModal(false)} 
        />
      )}
    </div>
  );
};

export default BoardPage;