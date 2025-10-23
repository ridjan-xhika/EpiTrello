import React, { useState } from 'react';
import { Draggable } from "@hello-pangea/dnd";
import Modal from '../Modal';
import { useBoard } from '../../context/BoardContext';
import '../../styles/card.css';

const Card = ({ card, index, columnId, boardId, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDescription, setEditDescription] = useState(card.description || '');
  const { deleteCard, updateCard } = useBoard();

  const handleDelete = async () => {
    try {
      await deleteCard(boardId, columnId, card.id);
      setIsModalOpen(false);
      if (onUpdate) await onUpdate();
    } catch (error) {
      alert('Failed to delete card');
    }
  };

  const handleSave = async () => {
    try {
      await updateCard(boardId, columnId, card.id, {
        title: editTitle,
        description: editDescription
      });
      setIsEditing(false);
      setIsModalOpen(false);
      if (onUpdate) await onUpdate();
    } catch (error) {
      alert('Failed to update card');
    }
  };

  const handleCancel = () => {
    setEditTitle(card.title);
    setEditDescription(card.description || '');
    setIsEditing(false);
  };

  return (
    <>
      <Draggable draggableId={card.id.toString()} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`card ${snapshot.isDragging ? 'card-dragging' : ''}`}
            onClick={() => setIsModalOpen(true)}
          >
            <h4 className="card-title">{card.title}</h4>
            {card.description && (
              <p className="card-description">{card.description}</p>
            )}
          </div>
        )}
      </Draggable>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditing(false);
          handleCancel();
        }}
        title={isEditing ? 'Edit Card' : card.title}
      >
        {isEditing ? (
          <div className="card-edit-form">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="form-textarea"
                rows="4"
              />
            </div>
            <div className="form-actions">
              <button onClick={handleSave} className="btn btn-primary">Save</button>
              <button onClick={handleCancel} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="card-details">
            <div className="card-detail-section">
              <h3>Description</h3>
              <p>{card.description || 'No description provided'}</p>
            </div>
            <div className="card-actions">
              <button onClick={() => setIsEditing(true)} className="btn btn-primary">
                Edit
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Card;