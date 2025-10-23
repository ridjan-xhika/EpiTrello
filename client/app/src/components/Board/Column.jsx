import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Card from './Card';
import { useBoard } from '../../context/BoardContext';
import '../../styles/column.css';

const Column = ({ column, boardId }) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [cardDescription, setCardDescription] = useState('');
  const { addCard, deleteColumn } = useBoard();

  const handleAddCard = () => {
    if (cardTitle.trim()) {
      addCard(boardId, column.id, cardTitle, cardDescription);
      setCardTitle('');
      setCardDescription('');
      setIsAddingCard(false);
    }
  };

  const handleCancel = () => {
    setCardTitle('');
    setCardDescription('');
    setIsAddingCard(false);
  };

  const handleDeleteColumn = () => {
    if (window.confirm(`Delete column "${column.title}"?`)) {
      deleteColumn(boardId, column.id);
    }
  };

  return (
    <div className="column">
      <div className="column-header">
        <h3 className="column-title">{column.title}</h3>
        <button 
          onClick={handleDeleteColumn} 
          className="column-delete"
          title="Delete column"
        >
          ×
        </button>
      </div>

      <Droppable droppableId={column.id}>
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
                boardId={boardId}
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
        <button
          onClick={() => setIsAddingCard(true)}
          className="add-card-button"
        >
          + Add a card
        </button>
      )}
    </div>
  );
};

export default Column;