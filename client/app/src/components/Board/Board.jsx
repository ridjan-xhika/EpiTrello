import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Column from './Column';
import { useBoard } from '../../context/BoardContext';
import '../../styles/board.css';

const Board = ({ board }) => {
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [columnTitle, setColumnTitle] = useState('');
  const { addColumn, reorderCards } = useBoard();

  const handleAddColumn = () => {
    if (columnTitle.trim()) {
      addColumn(board.id, columnTitle);
      setColumnTitle('');
      setIsAddingColumn(false);
    }
  };

  const handleCancel = () => {
    setColumnTitle('');
    setIsAddingColumn(false);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    reorderCards(
      board.id,
      source.droppableId,
      destination.droppableId,
      source.index,
      destination.index
    );
  };

  return (
    <div className="board-container">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board">
          {board.columns.map((column) => (
            <Column key={column.id} column={column} boardId={board.id} />
          ))}

          {isAddingColumn ? (
            <div className="add-column-form">
              <input
                type="text"
                placeholder="Column title"
                value={columnTitle}
                onChange={(e) => setColumnTitle(e.target.value)}
                className="form-input"
                autoFocus
              />
              <div className="form-actions">
                <button onClick={handleAddColumn} className="btn btn-primary">
                  Add Column
                </button>
                <button onClick={handleCancel} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingColumn(true)}
              className="add-column-button"
            >
              + Add a column
            </button>
          )}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Board;