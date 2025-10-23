import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBoard } from '../context/BoardContext';
import Modal from '../components/Modal';

const Home = () => {
  const { boards, addBoard, deleteBoard } = useBoard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');
  const navigate = useNavigate();

  const handleCreateBoard = () => {
    if (boardTitle.trim()) {
      const newBoardId = addBoard(boardTitle);
      setBoardTitle('');
      setIsModalOpen(false);
      navigate(`/board/${newBoardId}`);
    }
  };

  const handleDeleteBoard = (boardId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this board?')) {
      deleteBoard(boardId);
    }
  };

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
              <p>{board.columns.length} columns</p>
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
        onClose={() => setIsModalOpen(false)}
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
          />
        </div>
        <div className="form-actions">
          <button onClick={handleCreateBoard} className="btn btn-primary">
            Create
          </button>
          <button
            onClick={() => setIsModalOpen(false)}
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