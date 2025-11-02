import React, { useState } from 'react';
import { Draggable } from "@hello-pangea/dnd";
import CardModal from './CardModal';
import { useBoard } from '../../context/BoardContext';
import '../../styles/card.css';

const Card = ({ card, index, columnId, columnTitle, boardId, onUpdate, canWrite = true }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { deleteCard, updateCard } = useBoard();

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
            style={{
              ...provided.draggableProps.style,
              ...(card.cover_color && { borderTop: `4px solid ${card.cover_color}` })
            }}
          >
            {/* Labels */}
            {card.labels && card.labels.length > 0 && (
              <div className="card-labels">
                {card.labels.map(label => (
                  <span 
                    key={label.id} 
                    className="card-label" 
                    style={{ backgroundColor: label.color }}
                    title={label.name}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}

            <h4 className="card-title">{card.title}</h4>

            {/* Card badges */}
            <div className="card-badges">
              {/* Priority Badge */}
              {card.priority && (
                <span 
                  className={`card-badge card-badge-priority priority-${card.priority}`}
                  title={`Priority: ${card.priority}`}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"/>
                    <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z"/>
                  </svg>
                  {card.priority.charAt(0).toUpperCase() + card.priority.slice(1)}
                </span>
              )}

              {/* Due Date Badge */}
              {card.due_date && (
                <span 
                  className={`card-badge card-badge-due ${
                    card.completed ? 'completed' : 
                    new Date(card.due_date) < new Date() ? 'overdue' : 
                    new Date(card.due_date).toDateString() === new Date().toDateString() ? 'due-soon' : ''
                  }`}
                  title={card.completed ? 'Completed' : 'Due date'}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                  </svg>
                  {new Date(card.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {card.completed && ' ✓'}
                </span>
              )}

              {/* Description Badge */}
              {card.description && (
                <span className="card-badge" title="Has description">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                    <path d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8zm0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"/>
                  </svg>
                </span>
              )}

              {/* Checklist Progress */}
              {card.checklists && card.checklists.length > 0 && (() => {
                const completed = card.checklists.reduce((total, cl) => total + (cl.items?.filter(i => i.completed).length || 0), 0);
                const total = card.checklists.reduce((total, cl) => total + (cl.items?.length || 0), 0);
                const allComplete = total > 0 && completed === total;
                
                return (
                  <span 
                    className={`card-badge ${allComplete ? 'completed' : ''}`}
                    title="Checklist progress"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                      <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 0 1 .02-.022z"/>
                    </svg>
                    {completed}/{total}
                  </span>
                );
              })()}

              {/* Comments Count */}
              {card.comments && card.comments.length > 0 && (
                <span className="card-badge" title="Comments">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
                  </svg>
                  {card.comments.length}
                </span>
              )}

              {/* Attachments Count */}
              {card.attachments && card.attachments.length > 0 && (
                <span className="card-badge" title="Attachments">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0V3z"/>
                  </svg>
                  {card.attachments.length}
                </span>
              )}

              {/* Members Avatars */}
              {card.members && card.members.length > 0 && (
                <div className="card-members" title={card.members.map(m => m.name || m.username).join(', ')}>
                  {card.members.slice(0, 3).map((member, idx) => (
                    <span key={member.user_id || idx} className="card-member-avatar">
                      {(member.name || member.username || 'U').charAt(0).toUpperCase()}
                    </span>
                  ))}
                  {card.members.length > 3 && (
                    <span className="card-member-avatar card-member-more">
                      +{card.members.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Draggable>

      {isModalOpen && (
        <CardModal
          card={{ ...card, board_id: boardId }}
          columnTitle={columnTitle}
          onClose={() => setIsModalOpen(false)}
          onUpdate={onUpdate}
          canWrite={canWrite}
        />
      )}
    </>
  );
};

export default Card;