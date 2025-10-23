import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const BoardContext = createContext();

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within BoardProvider');
  }
  return context;
};

export const BoardProvider = ({ children }) => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchBoards = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const { boards: fetchedBoards } = await api.getBoards();
      setBoards(fetchedBoards);
    } catch (error) {
      console.error('Failed to fetch boards:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, [isAuthenticated]);

  const addBoard = async (title) => {
    try {
      const { board } = await api.createBoard(title);
      setBoards([...boards, { ...board, columnCount: 0 }]);
      return board.id;
    } catch (error) {
      console.error('Failed to create board:', error);
      throw error;
    }
  };

  const deleteBoard = async (boardId) => {
    try {
      await api.deleteBoard(boardId);
      setBoards(boards.filter(board => board.id !== boardId));
    } catch (error) {
      console.error('Failed to delete board:', error);
      throw error;
    }
  };

  const addColumn = async (boardId, title) => {
    try {
      await api.createColumn(boardId, title);
      // Refresh boards to update column count
      await fetchBoards();
    } catch (error) {
      console.error('Failed to create column:', error);
      throw error;
    }
  };

  const deleteColumn = async (boardId, columnId) => {
    try {
      await api.deleteColumn(columnId);
      await fetchBoards();
    } catch (error) {
      console.error('Failed to delete column:', error);
      throw error;
    }
  };

  const addCard = async (boardId, columnId, title, description) => {
    try {
      await api.createCard(boardId, columnId, title, description);
    } catch (error) {
      console.error('Failed to create card:', error);
      throw error;
    }
  };

  const deleteCard = async (boardId, columnId, cardId) => {
    try {
      await api.deleteCard(cardId);
    } catch (error) {
      console.error('Failed to delete card:', error);
      throw error;
    }
  };

  const updateCard = async (boardId, columnId, cardId, updatedData) => {
    try {
      await api.updateCard(cardId, updatedData.title, updatedData.description);
    } catch (error) {
      console.error('Failed to update card:', error);
      throw error;
    }
  };

  const reorderCards = async (boardId, sourceColumnId, destColumnId, sourceIndex, destIndex) => {
    try {
      // Find the card being moved
      const board = boards.find(b => b.id === boardId);
      if (!board) return;

      // We need to get the full board data to find the card
      const { board: fullBoard } = await api.getBoard(boardId);
      const sourceColumn = fullBoard.columns.find(col => col.id === sourceColumnId);
      if (!sourceColumn) return;

      const card = sourceColumn.cards[sourceIndex];
      if (!card) return;

      await api.reorderCard(boardId, card.id, sourceColumnId, destColumnId, sourceIndex, destIndex);
    } catch (error) {
      console.error('Failed to reorder cards:', error);
      throw error;
    }
  };

  const value = {
    boards,
    loading,
    addBoard,
    deleteBoard,
    addColumn,
    deleteColumn,
    addCard,
    deleteCard,
    updateCard,
    reorderCards,
    fetchBoards,
  };

  return (
    <BoardContext.Provider value={value}>
      {children}
    </BoardContext.Provider>
  );
};