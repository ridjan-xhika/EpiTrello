import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Column from './Column';
import { useBoard } from '../../context/BoardContext';
import '../../styles/board.css';

const Board = ({ board, onUpdate }) => {
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [columnTitle, setColumnTitle] = useState('');
  const { addColumn, reorderCards } = useBoard();

  const handleAddColumn = async () => {
    if (columnTitle.trim()) {
      try {
        await addColumn(board.id, columnTitle);
        setColumnTitle('');
        setIsAddingColumn(false);
        if (onUpdate) await onUpdate();
      } catch (error) {
        alert('Failed to create column');
      }
    }
  };

  const handleCancel = () => {
    setColumnTitle('');
    setIsAddingColumn(false);
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    try {
      await reorderCards(
        board.id,
        source.droppableId,
        destination.droppableId,
        source.index,
        destination.index
      );
      if (onUpdate) await onUpdate();
    } catch (error) {
      console.error('Failed to reorder cards:', error);
      alert('Failed to reorder cards');
    }
  };

  return (
    <div className="board-container">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board">
          {board.columns.map((column) => (
            <Column 
              key={column.id} 
              column={column} 
              boardId={board.id}
              onUpdate={onUpdate}
            />
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
                onKeyPress={(e) => e.key === 'Enter' && handleAddColumn()}
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