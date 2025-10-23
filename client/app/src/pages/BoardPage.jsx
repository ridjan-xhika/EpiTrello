import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBoard } from '../context/BoardContext';
import Board from '../components/Board/Board';

const BoardPage = () => {
  const { id } = useParams();
  const { boards } = useBoard();
  const navigate = useNavigate();

  const board = boards.find(b => b.id === id);

  if (!board) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h2>Board not found</h2>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Boards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="board-page">
      <div className="board-page-header">
        <h1>{board.title}</h1>
        <button onClick={() => navigate('/')} className="btn btn-secondary">
          Back to Boards
        </button>
      </div>
      <Board board={board} />
    </div>
  );
};

export default BoardPage;