import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBoard } from '../context/BoardContext';
import Modal from '../components/Modal';

const Home = () => {
  const { boards, addBoard, deleteBoard, loading } = useBoard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');
  const navigate = useNavigate();

  const handleCreateBoard = async () => {
    if (boardTitle.trim()) {
      try {
        const newBoardId = await addBoard(boardTitle);
        setBoardTitle('');
        setIsModalOpen(false);
        navigate(`/board/${newBoardId}`);
      } catch (error) {
        alert('Failed to create board');
      }
    }
  };

  const handleDeleteBoard = async (boardId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this board?')) {
      try {
        await deleteBoard(boardId);
      } catch (error) {
        alert('Failed to delete board');
      }
    }
  };

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
      <div className="home-header">
        <h1>
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" style={{marginRight: '8px', verticalAlign: 'text-bottom'}}>
            <path d="M0 2a2 2 0 012-2h4a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2zm8 0a2 2 0 012-2h4a2 2 0 012 2v8a2 2 0 01-2 2h-4a2 2 0 01-2-2V2z"/>
          </svg>
          Your Boards
        </h1>
        <div style={{display: 'flex', gap: '0.75rem'}}>
          <button
            onClick={() => navigate('/organizations')}
            className="btn btn-secondary"
          >
            Organizations
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            Create new board
          </button>
        </div>
      </div>

      <div className="boards-grid">
        {boards.map((board) => (
          <Link
            key={board.id}
            to={`/board/${board.id}`}
            className="board-card"
          >
            <div className="board-card-content">
              <h3>{board.title}</h3>
              <p>{board.columnCount || 0} {board.columnCount === 1 ? 'list' : 'lists'}</p>
            </div>
            <button
              onClick={(e) => handleDeleteBoard(board.id, e)}
              className="board-card-delete"
              title="Delete board"
            >
              ×
            </button>
          </Link>
        ))}
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="board-card board-card-create"
          style={{
            background: 'rgba(9, 30, 66, 0.08)',
            color: '#172b4d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <div>
            <div style={{fontSize: '1.5rem', marginBottom: '4px'}}>+</div>
            <div style={{fontSize: '0.875rem', fontWeight: 600}}>Create new board</div>
          </div>
        </button>
      </div>

      {boards.length === 0 && (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 16 16" fill="currentColor" style={{marginBottom: '1rem', opacity: 0.5}}>
            <path d="M0 2a2 2 0 012-2h4a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2zm8 0a2 2 0 012-2h4a2 2 0 012 2v8a2 2 0 01-2 2h-4a2 2 0 01-2-2V2z"/>
          </svg>
          <h2>No boards yet</h2>
          <p>Create your first board to get started with organizing your work!</p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setBoardTitle('');
        }}
        title="Create board"
      >
        <div className="form-group">
          <label>Board title</label>
          <input
            type="text"
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            placeholder="e.g. Project Planning"
            className="form-input"
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && handleCreateBoard()}
          />
        </div>
        <div className="form-actions">
          <button onClick={handleCreateBoard} className="btn btn-primary">
            Create board
          </button>
          <button
            onClick={() => {
              setIsModalOpen(false);
              setBoardTitle('');
            }}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Home;