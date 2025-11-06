import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Board from '../components/Board/Board';
import ListView from '../components/Board/ListView';
import CalendarView from '../components/Board/CalendarView';
import TableView from '../components/Board/TableView';
import BoardViewSwitcher from '../components/Board/BoardViewSwitcher';
import SharingModal from '../components/SharingModal';
import CardModal from '../components/Board/CardModal';
import api from '../services/api';

const BoardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSharingModal, setShowSharingModal] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [currentView, setCurrentView] = useState('board');
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCardModal, setShowCardModal] = useState(false);

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

  const handleDeleteBoard = async () => {
    if (!window.confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.deleteBoard(id);
      alert('Board deleted successfully');
      navigate('/');
    } catch (err) {
      console.error('Failed to delete board:', err);
      alert(err.message || 'Failed to delete board. You may not have permission.');
    }
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setShowCardModal(true);
  };

  const handleCloseCardModal = () => {
    setShowCardModal(false);
    setSelectedCard(null);
    fetchBoard(); // Refresh board data after closing modal
  };

  const renderView = () => {
    switch (currentView) {
      case 'list':
        return <ListView board={board} onCardClick={handleCardClick} userRole={userRole} />;
      case 'calendar':
        return <CalendarView board={board} onCardClick={handleCardClick} />;
      case 'table':
        return <TableView board={board} onCardClick={handleCardClick} userRole={userRole} />;
      case 'board':
      default:
        return <Board board={board} onUpdate={fetchBoard} userRole={userRole} />;
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
          <p style={{color: 'var(--text-secondary)', marginBottom: '1.5rem'}}>{error || 'The board you are looking for does not exist.'}</p>
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
          <div style={{marginLeft: '1rem'}}>
            <BoardViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
          </div>
        </div>
        <div style={{display: 'flex', gap: '0.5rem'}}>
          <button 
            onClick={() => setShowSharingModal(true)} 
            className="btn btn-secondary" 
            style={{background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem'}}
          >
            🤝 Share
          </button>
          {userRole === 'owner' && (
            <button 
              onClick={handleDeleteBoard} 
              className="btn btn-secondary" 
              style={{background: 'rgba(220, 53, 69, 0.8)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem'}}
              title="Delete Board"
            >
              🗑️ Delete
            </button>
          )}
          <button 
            onClick={() => navigate('/')} 
            className="btn btn-secondary" 
            style={{background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none'}}
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="board-page-content">
        {renderView()}
      </div>
      
      {showSharingModal && (
        <SharingModal 
          boardId={id} 
          onClose={() => setShowSharingModal(false)} 
        />
      )}

      {showCardModal && selectedCard && (
        <CardModal
          card={selectedCard}
          columnId={selectedCard.columnId}
          onClose={handleCloseCardModal}
          userRole={userRole}
        />
      )}
    </div>
  );
};

export default BoardPage;