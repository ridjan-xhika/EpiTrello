import React, { useState, useEffect } from 'react';
import { DragDropContext } from "@hello-pangea/dnd";
import Column from './Column';
import { useBoard } from '../../context/BoardContext';
import '../../styles/board.css';

const Board = ({ board, onUpdate, userRole }) => {
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [columnTitle, setColumnTitle] = useState('');
  const { addColumn, reorderCards } = useBoard();
  const [localBoard, setLocalBoard] = useState(board);

  // Check if user can write (edit)
  const canWrite = userRole !== 'read';

  // Sync localBoard with board prop changes
  useEffect(() => {
    setLocalBoard(board);
  }, [board]);

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
    // Block drag-and-drop for read-only users
    if (!canWrite) {
      alert('You only have read-only access to this board');
      return;
    }

    console.log('🎯 Drag ended:', result);
    
    const { source, destination, draggableId } = result;
    
    if (!destination) {
      console.log('❌ No destination - drag cancelled');
      return;
    }

    // same position, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      console.log('⚠️ Same position - no change needed');
      return;
    }

    const sourceColId = source.droppableId;
    const destColId = destination.droppableId;

    console.log('📦 Moving card:', {
      cardId: draggableId,
      from: `column ${sourceColId} index ${source.index}`,
      to: `column ${destColId} index ${destination.index}`
    });

    const newBoard = { ...localBoard };
    const sourceColumn = newBoard.columns.find(c => c.id.toString() === sourceColId);
    const destColumn = newBoard.columns.find(c => c.id.toString() === destColId);

    if (!sourceColumn || !destColumn) {
      console.error('❌ Column not found!', { sourceColumn, destColumn });
      return;
    }

    // Remove card from source
    const [movedCard] = sourceColumn.cards.splice(source.index, 1);

    // Insert into destination
    destColumn.cards.splice(destination.index, 0, movedCard);

    // Update local state immediately (optimistic UI)
    setLocalBoard(newBoard);
    console.log('✅ Local state updated optimistically');

    // Persist changes in backend
    try {
      console.log('🌐 Calling backend API...');
      await reorderCards(localBoard.id, sourceColId, destColId, source.index, destination.index);
      console.log('✅ Backend updated successfully');
      // DON'T refetch - we already updated the UI optimistically
    } catch (error) {
      console.error('❌ Failed to reorder cards:', error);
      alert('Failed to reorder cards');

      // Revert local state on failure
      setLocalBoard(board);
      console.log('🔄 Reverted to previous state');
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
              canWrite={canWrite}
            />
          ))}

          {canWrite && isAddingColumn ? (
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
          ) : canWrite ? (
            <button
              onClick={() => setIsAddingColumn(true)}
              className="add-column-button"
            >
              + Add a column
            </button>
          ) : null}
        </div>
      </div>
    </DragDropContext>
  );
};

export default Board;
