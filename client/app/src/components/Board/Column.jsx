import React, { useState } from 'react';
import { Droppable } from "@hello-pangea/dnd";
import Card from './Card';
import { useBoard } from '../../context/BoardContext';
import '../../styles/column.css';

const Column = ({ column, boardId, onUpdate, canWrite = true }) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [cardDescription, setCardDescription] = useState('');
  const { addCard, deleteColumn } = useBoard();

  const handleAddCard = async () => {
    if (!canWrite) {
      alert('You only have read-only access to this board');
      return;
    }
    if (cardTitle.trim()) {
      try {
        await addCard(boardId, column.id, cardTitle, cardDescription);
        setCardTitle('');
        setCardDescription('');
        setIsAddingCard(false);
        if (onUpdate) await onUpdate();
      } catch (error) {
        alert('Failed to create card');
      }
    }
  };

  const handleCancel = () => {
    setCardTitle('');
    setCardDescription('');
    setIsAddingCard(false);
  };

  const handleDeleteColumn = async () => {
    if (!canWrite) {
      alert('You only have read-only access to this board');
      return;
    }
    if (window.confirm(`Delete column "${column.title}"?`)) {
      try {
        await deleteColumn(boardId, column.id);
        if (onUpdate) await onUpdate();
      } catch (error) {
        alert('Failed to delete column');
      }
    }
  };

  return (
    <div className="column">
      <div className="column-header">
        <h3 className="column-title">{column.title}</h3>
        {canWrite && (
          <button 
            onClick={handleDeleteColumn} 
            className="column-delete"
            title="Delete column"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
            </svg>
          </button>
        )}
      </div>

      <Droppable droppableId={column.id.toString()}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`column-cards ${snapshot.isDraggingOver ? 'column-dragging-over' : ''}`}
          >
            {column.cards.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                index={index}
                columnId={column.id}
                columnTitle={column.title}
                boardId={boardId}
                onUpdate={onUpdate}
                canWrite={canWrite}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {isAddingCard ? (
        <div className="add-card-form">
          <input
            type="text"
            placeholder="Card title"
            value={cardTitle}
            onChange={(e) => setCardTitle(e.target.value)}
            className="form-input"
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAddCard()}
          />
          <textarea
            placeholder="Description (optional)"
            value={cardDescription}
            onChange={(e) => setCardDescription(e.target.value)}
            className="form-textarea"
            rows="2"
          />
          <div className="form-actions">
            <button onClick={handleAddCard} className="btn btn-primary">Add</button>
            <button onClick={handleCancel} className="btn btn-secondary">Cancel</button>
          </div>
        </div>
      ) : (
        canWrite && (
          <button
            onClick={() => setIsAddingCard(true)}
            className="add-card-button"
          >
            + Add a card
          </button>
        )
      )}
    </div>
  );
};

export default Column;