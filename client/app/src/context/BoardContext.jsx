import React, { createContext, useContext, useState } from 'react';

const BoardContext = createContext();

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within BoardProvider');
  }
  return context;
};

export const BoardProvider = ({ children }) => {
  const [boards, setBoards] = useState([
    {
      id: '1',
      title: 'Project Board',
      columns: [
        {
          id: 'col-1',
          title: 'To Do',
          cards: [
            { id: 'card-1', title: 'Task 1', description: 'Description for task 1' },
            { id: 'card-2', title: 'Task 2', description: 'Description for task 2' }
          ]
        },
        {
          id: 'col-2',
          title: 'In Progress',
          cards: [
            { id: 'card-3', title: 'Task 3', description: 'Description for task 3' }
          ]
        },
        {
          id: 'col-3',
          title: 'Done',
          cards: []
        }
      ]
    }
  ]);

  const addBoard = (title) => {
    const newBoard = {
      id: Date.now().toString(),
      title,
      columns: []
    };
    setBoards([...boards, newBoard]);
    return newBoard.id;
  };

  const deleteBoard = (boardId) => {
    setBoards(boards.filter(board => board.id !== boardId));
  };

  const addColumn = (boardId, title) => {
    setBoards(boards.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          columns: [...board.columns, {
            id: `col-${Date.now()}`,
            title,
            cards: []
          }]
        };
      }
      return board;
    }));
  };

  const deleteColumn = (boardId, columnId) => {
    setBoards(boards.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          columns: board.columns.filter(col => col.id !== columnId)
        };
      }
      return board;
    }));
  };

  const addCard = (boardId, columnId, title, description) => {
    setBoards(boards.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          columns: board.columns.map(col => {
            if (col.id === columnId) {
              return {
                ...col,
                cards: [...col.cards, {
                  id: `card-${Date.now()}`,
                  title,
                  description
                }]
              };
            }
            return col;
          })
        };
      }
      return board;
    }));
  };

  const deleteCard = (boardId, columnId, cardId) => {
    setBoards(boards.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          columns: board.columns.map(col => {
            if (col.id === columnId) {
              return {
                ...col,
                cards: col.cards.filter(card => card.id !== cardId)
              };
            }
            return col;
          })
        };
      }
      return board;
    }));
  };

  const updateCard = (boardId, columnId, cardId, updatedData) => {
    setBoards(boards.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          columns: board.columns.map(col => {
            if (col.id === columnId) {
              return {
                ...col,
                cards: col.cards.map(card => {
                  if (card.id === cardId) {
                    return { ...card, ...updatedData };
                  }
                  return card;
                })
              };
            }
            return col;
          })
        };
      }
      return board;
    }));
  };

  const reorderCards = (boardId, sourceColumnId, destColumnId, sourceIndex, destIndex) => {
    setBoards(boards.map(board => {
      if (board.id === boardId) {
        const newColumns = [...board.columns];
        const sourceCol = newColumns.find(col => col.id === sourceColumnId);
        const destCol = newColumns.find(col => col.id === destColumnId);

        const [movedCard] = sourceCol.cards.splice(sourceIndex, 1);
        destCol.cards.splice(destIndex, 0, movedCard);

        return { ...board, columns: newColumns };
      }
      return board;
    }));
  };

  const value = {
    boards,
    addBoard,
    deleteBoard,
    addColumn,
    deleteColumn,
    addCard,
    deleteCard,
    updateCard,
    reorderCards
  };

  return (
    <BoardContext.Provider value={value}>
      {children}
    </BoardContext.Provider>
  );
};