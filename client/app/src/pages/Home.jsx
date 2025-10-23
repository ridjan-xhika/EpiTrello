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
        <h1>My Boards</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          Create New Board
        </button>
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
              <p>{board.columnCount || 0} columns</p>
            </div>
            <button
              onClick={(e) => handleDeleteBoard(board.id, e)}
              className="board-card-delete"
            >
              ×
            </button>
          </Link>
        ))}
      </div>

      {boards.length === 0 && (
        <div className="empty-state">
          <p>No boards yet. Create your first board to get started!</p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setBoardTitle('');
        }}
        title="Create New Board"
      >
        <div className="form-group">
          <label>Board Title</label>
          <input
            type="text"
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            placeholder="Enter board title"
            className="form-input"
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && handleCreateBoard()}
          />
        </div>
        <div className="form-actions">
          <button onClick={handleCreateBoard} className="btn btn-primary">
            Create
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