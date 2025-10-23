import React, { useState } from 'react';
import { DragDropContext } from "@hello-pangea/dnd";
import Column from './Column';
import { useBoard } from '../../context/BoardContext';
import '../../styles/board.css';

const Board = ({ board, onUpdate }) => {
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [columnTitle, setColumnTitle] = useState('');
  const { addColumn, reorderCards } = useBoard();
  const [localBoard, setLocalBoard] = useState(board);

  const handleAddColumn = async () => {
    if (!columnTitle.trim()) return;
    try {
      await addColumn(localBoard.id, columnTitle);
      setColumnTitle('');
      setIsAddingColumn(false);
      if (onUpdate) await onUpdate();
    } catch (error) {
      alert('Failed to create column');
    }
  };

  const handleCancel = () => {
    setColumnTitle('');
    setIsAddingColumn(false);
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    // same position, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    const sourceColId = source.droppableId;
    const destColId = destination.droppableId;

    const newBoard = { ...localBoard };
    const sourceColumn = newBoard.columns.find(c => c.id.toString() === sourceColId);
    const destColumn = newBoard.columns.find(c => c.id.toString() === destColId);

    // Remove card from source
    const [movedCard] = sourceColumn.cards.splice(source.index, 1);

    // Insert into destination
    destColumn.cards.splice(destination.index, 0, movedCard);

    // Update local state immediately (optimistic UI)
    setLocalBoard(newBoard);

    // Persist changes in backend
    try {
      await reorderCards(localBoard.id, sourceColId, destColId, source.index, destination.index);
      if (onUpdate) await onUpdate();
    } catch (error) {
      console.error('Failed to reorder cards:', error);
      alert('Failed to reorder cards');

      // Revert local state on failure
      setLocalBoard(board);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="board-container">
        <div className="board">
          {localBoard.columns.map((column) => (
            <Column 
              key={column.id} 
              column={column} 
              boardId={localBoard.id}
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
      </div>
    </DragDropContext>
  );
};

export default Board;
