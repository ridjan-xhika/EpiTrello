import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Board from '../components/Board/Board';
import api from '../services/api';

const BoardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBoard = async () => {
    try {
      setLoading(true);
      const { board: fetchedBoard } = await api.getBoard(id);
      setBoard(fetchedBoard);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch board:', err);
      setError(err.message);
    } finally {
      setLoading(false);
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
          <h2>Board not found</h2>
          <p>{error || 'The board you are looking for does not exist.'}</p>
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
      <Board board={board} onUpdate={fetchBoard} />
    </div>
  );
};

export default BoardPage;