import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import '../../styles/card.css';

function CardModal({ card, columnTitle, onClose, onUpdate, canWrite }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingDescription, setEditingDescription] = useState(false);
  const [loading, setLoading] = useState(true);

  // Advanced fields
  const [dueDate, setDueDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [timeEstimate, setTimeEstimate] = useState('');
  const [timeSpent, setTimeSpent] = useState('');
  const [priority, setPriority] = useState('');
  const [coverColor, setCoverColor] = useState('');
  const [completed, setCompleted] = useState(false);

  // Labels, checklists, comments, etc.
  const [labels, setLabels] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [comments, setComments] = useState([]);
  const [members, setMembers] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [boardMembers, setBoardMembers] = useState([]);

  // UI state
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(null);

  useEffect(() => {
    loadCardDetails();
  }, [card.id]);

  const loadCardDetails = async () => {
    try {
      console.log('Loading card details for card ID:', card.id);
      setLoading(true);
      const details = await api.getCard(card.id);
      console.log('Loaded card details:', details);
      
      // Update all fields from the server
      setTitle(details.title || '');
      setDescription(details.description || '');
      setDueDate(details.due_date || '');
      setStartDate(details.start_date || '');
      setTimeEstimate(details.time_estimate || '');
      setTimeSpent(details.time_spent || '');
      setPriority(details.priority || '');
      setCoverColor(details.cover_color || '');
      setCompleted(details.completed || false);
      
      setLabels(details.labels || []);
      setChecklists(details.checklists || []);
      setMembers(details.members || []);
      
      // Load comments separately
      const commentsData = await api.getCardComments(card.id);
      console.log('Comments data loaded:', commentsData);
      console.log('Setting comments state to:', commentsData);
      setComments(commentsData || []);
      console.log('Comments state set');
      
      // Load activity separately
      const activityData = await api.getCardActivity(card.id);
      setActivity(activityData || []);
      
      // Load board members for assignment
      const boardData = await api.getBoard(card.board_id);
      setBoardMembers(boardData.members || []);
    } catch (error) {
      console.error('Failed to load card details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTitle = async () => {
    if (!canWrite || !title.trim()) return;
    try {
      await api.updateCard(card.id, { boardId: card.board_id, title });
      onUpdate();
    } catch (error) {
      console.error('Failed to update title:', error);
    }
  };

  const handleUpdateDescription = async () => {
    if (!canWrite) return;
    try {
      await api.updateCard(card.id, { boardId: card.board_id, description });
      setEditingDescription(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to update description:', error);
    }
  };

  const handleUpdateField = async (field, value) => {
    if (!canWrite) return;
    try {
      // Update local state immediately for responsive UI
      switch(field) {
        case 'due_date': setDueDate(value); break;
        case 'start_date': setStartDate(value); break;
        case 'time_estimate': setTimeEstimate(value); break;
        case 'time_spent': setTimeSpent(value); break;
        case 'priority': setPriority(value); break;
        case 'cover_color': setCoverColor(value); break;
        case 'completed': setCompleted(value); break;
      }
      
      await api.updateCard(card.id, { boardId: card.board_id, [field]: value });
      // Don't call onUpdate here - it causes the board to refresh
      // and that can cause the modal to reload with old data
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
      // Reload to revert on error
      loadCardDetails();
    }
  };

  const handleSaveDetails = async () => {
    if (!canWrite) return;
    try {
      console.log('Saving card details:', {
        due_date: dueDate || null,
        start_date: startDate || null,
        time_estimate: timeEstimate || null,
        time_spent: timeSpent || null,
        priority: priority || null,
        cover_color: coverColor || null,
        completed: completed
      });
      
      const result = await api.updateCard(card.id, {
        boardId: card.board_id,
        due_date: dueDate || null,
        start_date: startDate || null,
        time_estimate: timeEstimate || null,
        time_spent: timeSpent || null,
        priority: priority || null,
        cover_color: coverColor || null,
        completed: completed
      });
      
      console.log('Save successful:', result);
      setEditingDetails(false);
      // Don't call onUpdate - keep local state, board will refresh when modal closes
    } catch (error) {
      console.error('Failed to save card details:', error);
      console.error('Error details:', error.response || error.message);
      alert('Failed to save changes: ' + (error.message || 'Unknown error'));
    }
  };

  const handleAddLabel = async (name, color) => {
    if (!canWrite) return;
    try {
      await api.addCardLabel(card.id, name, color);
      loadCardDetails();
      setShowLabelPicker(false);
    } catch (error) {
      console.error('Failed to add label:', error);
    }
  };

  const handleRemoveLabel = async (labelId) => {
    if (!canWrite) return;
    try {
      await api.removeCardLabel(card.id, labelId);
      loadCardDetails();
    } catch (error) {
      console.error('Failed to remove label:', error);
    }
  };

  const handleAddChecklist = async (title) => {
    if (!canWrite) return;
    try {
      await api.addChecklist(card.id, title);
      loadCardDetails();
    } catch (error) {
      console.error('Failed to create checklist:', error);
    }
  };

  const handleAddChecklistItem = async (checklistId, title) => {
    if (!canWrite || !title.trim()) return;
    try {
      await api.addChecklistItem(card.id, checklistId, title);  // API expects text as 3rd param
      loadCardDetails();
    } catch (error) {
      console.error('Failed to add checklist item:', error);
    }
  };

  const handleDeleteChecklist = async (checklistId) => {
    if (!canWrite) return;
    try {
      await api.deleteChecklist(card.id, checklistId);
      loadCardDetails();
    } catch (error) {
      console.error('Failed to delete checklist:', error);
    }
  };

  const handleDeleteChecklistItem = async (checklistId, itemId) => {
    if (!canWrite) return;
    try {
      await api.deleteChecklistItem(card.id, checklistId, itemId);
      loadCardDetails();
    } catch (error) {
      console.error('Failed to delete checklist item:', error);
    }
  };

  const handleToggleChecklistItem = async (checklistId, itemId, completed) => {
    if (!canWrite) return;
    try {
      await api.updateChecklistItem(card.id, checklistId, itemId, { completed: !completed });
      loadCardDetails();
    } catch (error) {
      console.error('Failed to toggle checklist item:', error);
    }
  };

  const handleAddComment = async () => {
    if (!canWrite || !newComment.trim()) return;
    try {
      await api.addCardComment(card.id, newComment);
      setNewComment('');
      loadCardDetails();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleAddMember = async (userId) => {
    if (!canWrite) return;
    try {
      await api.addCardMember(card.id, userId);
      loadCardDetails();
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!canWrite) return;
    try {
      await api.removeCardMember(card.id, userId);
      loadCardDetails();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleClose = async () => {
    console.log('Modal closing - calling onUpdate to refresh board');
    // Call onUpdate to refresh the board before closing
    if (onUpdate) {
      await onUpdate();
      console.log('Board refreshed');
    }
    console.log('Closing modal');
    onClose();
  };

  const formatTime = (minutes) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDueDateStatus = () => {
    if (!dueDate) return null;
    if (completed) return 'completed';
    const now = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 1) return 'due-soon';
    return 'upcoming';
  };

  const labelColors = [
    { name: 'Green', color: '#61bd4f' },
    { name: 'Yellow', color: '#f2d600' },
    { name: 'Orange', color: '#ff9f1a' },
    { name: 'Red', color: '#eb5a46' },
    { name: 'Purple', color: '#c377e0' },
    { name: 'Blue', color: '#0079bf' },
    { name: 'Sky', color: '#00c2e0' },
    { name: 'Lime', color: '#51e898' },
    { name: 'Pink', color: '#ff78cb' },
    { name: 'Black', color: '#344563' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: '#61bd4f' },
    { value: 'medium', label: 'Medium', color: '#f2d600' },
    { value: 'high', label: 'High', color: '#ff9f1a' },
    { value: 'critical', label: 'Critical', color: '#eb5a46' },
  ];

  return createPortal(
    <div className="card-modal-overlay" onClick={handleClose}>
      <div className="card-modal" onClick={(e) => e.stopPropagation()}>
        {coverColor && <div className="card-modal-cover" style={{ background: coverColor }} />}
        
        <div className="card-modal-header">
          <div className="card-modal-title-wrapper">
            <div className="card-modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="#42526e" strokeWidth="2"/>
              </svg>
            </div>
            <div className="card-modal-title-content">
              <input
                type="text"
                className="card-modal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleUpdateTitle}
                disabled={!canWrite}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  outline: 'none', 
                  width: '100%',
                  cursor: canWrite ? 'text' : 'default'
                }}
              />
              <p className="card-modal-subtitle">in list {columnTitle}</p>
            </div>
          </div>

          <button className="card-modal-close" onClick={handleClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="card-modal-body">
          <div className="card-modal-main">
            {/* Labels Section */}
            {labels.length > 0 && (
              <div className="card-modal-section">
                <div className="card-modal-section-header">
                  <svg className="card-modal-section-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z"/>
                  </svg>
                  <h3 className="card-modal-section-title">Labels</h3>
                </div>
                <div className="card-labels">
                  {labels.map(label => (
                    <div
                      key={label.id}
                      className="card-label"
                      style={{ background: label.color }}
                      onClick={() => canWrite && handleRemoveLabel(label.id)}
                    >
                      {label.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description Section */}
            <div className="card-modal-section">
              <div className="card-modal-section-header">
                <svg className="card-modal-section-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                <h3 className="card-modal-section-title">Description</h3>
              </div>
              {editingDescription ? (
                <div className="card-description-edit">
                  <textarea
                    className="card-description-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a more detailed description..."
                  />
                  <div className="card-description-actions">
                    <button className="btn-primary" onClick={handleUpdateDescription}>Save</button>
                    <button className="btn-secondary" onClick={() => {
                      setDescription(card.description || '');
                      setEditingDescription(false);
                    }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div
                  className={`card-description-display ${!description ? 'empty' : ''}`}
                  onClick={() => canWrite && setEditingDescription(true)}
                >
                  {description || 'Add a more detailed description...'}
                </div>
              )}
            </div>

            {/* Card Details Section */}
            <div className="card-modal-section">
              <div className="card-modal-section-header">
                <svg className="card-modal-section-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <h3 className="card-modal-section-title">Card Details</h3>
                {!editingDetails && canWrite && (
                  <button 
                    className="btn-secondary" 
                    onClick={() => setEditingDetails(true)}
                    style={{ marginLeft: 'auto', padding: '4px 12px', fontSize: '12px' }}
                  >
                    Edit
                  </button>
                )}
              </div>
              
              <div className="card-details-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '12px',
                marginTop: '12px'
              }}>
                {/* Priority */}
                <div className="detail-field">
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Priority
                  </label>
                  {editingDetails ? (
                    <select
                      value={priority || ''}
                      onChange={(e) => setPriority(e.target.value)}
                      disabled={!canWrite}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '3px',
                        fontSize: '14px',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <option value="">None</option>
                      {priorityOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ 
                      padding: '8px', 
                      background: 'var(--bg-secondary)', 
                      borderRadius: '3px',
                      fontSize: '14px',
                      color: 'var(--text-primary)',
                      minHeight: '38px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {priority ? (
                        <span className={`card-badge-priority priority-${priority}`} style={{ padding: '4px 8px', borderRadius: '3px' }}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)' }}>No priority set</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Due Date */}
                <div className="detail-field">
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Due Date
                  </label>
                  {editingDetails ? (
                    <input
                      type="date"
                      value={dueDate ? dueDate.split('T')[0] : ''}
                      onChange={(e) => setDueDate(e.target.value)}
                      disabled={!canWrite}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '3px',
                        fontSize: '14px',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  ) : (
                    <div style={{ 
                      padding: '8px', 
                      background: 'var(--bg-secondary)', 
                      borderRadius: '3px',
                      fontSize: '14px',
                      color: 'var(--text-primary)',
                      minHeight: '38px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {dueDate ? formatDate(dueDate) : <span style={{ color: 'var(--text-secondary)' }}>No due date</span>}
                    </div>
                  )}
                </div>

                {/* Start Date */}
                <div className="detail-field">
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Start Date
                  </label>
                  {editingDetails ? (
                    <input
                      type="date"
                      value={startDate ? startDate.split('T')[0] : ''}
                      onChange={(e) => setStartDate(e.target.value)}
                      disabled={!canWrite}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '3px',
                        fontSize: '14px',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  ) : (
                    <div style={{ 
                      padding: '8px', 
                      background: 'var(--bg-secondary)', 
                      borderRadius: '3px',
                      fontSize: '14px',
                      color: 'var(--text-primary)',
                      minHeight: '38px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {startDate ? formatDate(startDate) : <span style={{ color: 'var(--text-secondary)' }}>No start date</span>}
                    </div>
                  )}
                </div>

                {/* Completed */}
                <div className="detail-field">
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Status
                  </label>
                  {editingDetails ? (
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      background: 'var(--bg-primary)',
                      minHeight: '38px'
                    }}>
                      <input
                        type="checkbox"
                        checked={completed}
                        onChange={(e) => setCompleted(e.target.checked)}
                        disabled={!canWrite}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                        Mark as completed
                      </span>
                    </label>
                  ) : (
                    <div style={{ 
                      padding: '8px', 
                      background: completed ? 'var(--success)' : 'var(--bg-secondary)', 
                      borderRadius: '3px',
                      fontSize: '14px',
                      color: completed ? 'white' : 'var(--text-primary)',
                      minHeight: '38px',
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: completed ? 600 : 400
                    }}>
                      {completed ? '✓ Completed' : 'Not completed'}
                    </div>
                  )}
                </div>
              </div>

              {editingDetails && (
                <div className="card-description-actions" style={{ marginTop: '12px' }}>
                  <button className="btn-primary" onClick={handleSaveDetails}>Save Changes</button>
                  <button className="btn-secondary" onClick={() => {
                    loadCardDetails();
                    setEditingDetails(false);
                  }}>Cancel</button>
                </div>
              )}
            </div>

            {/* Checklists Section */}
            {checklists.length > 0 && (
              <div className="card-modal-section">
                <div className="card-modal-section-header">
                  <svg className="card-modal-section-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 7h-9v2h9V7zm0 8h-9v2h9v-2zM5.54 11L2 7.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 11zm0 8L2 15.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 19z"/>
                  </svg>
                  <h3 className="card-modal-section-title">Checklists</h3>
                </div>
                {checklists.map(checklist => {
                  const completed = checklist.items?.filter(i => i.completed).length || 0;
                  const total = checklist.items?.length || 0;
                  const progress = total > 0 ? (completed / total) * 100 : 0;

                  return (
                    <div key={checklist.id} style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {checklist.title}
                          </h4>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {completed}/{total}
                          </span>
                        </div>
                        {canWrite && (
                          <button 
                            onClick={() => {
                              if (confirm('Delete this checklist?')) {
                                handleDeleteChecklist(checklist.id);
                              }
                            }}
                            style={{
                              padding: '4px 8px',
                              fontSize: '12px',
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              borderRadius: '3px',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'var(--bg-hover)';
                              e.target.style.color = '#eb5a46';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'transparent';
                              e.target.style.color = 'var(--text-secondary)';
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <div style={{ 
                        width: '100%', 
                        height: '8px', 
                        background: 'var(--bg-secondary)', 
                        borderRadius: '4px', 
                        overflow: 'hidden',
                        marginBottom: '12px'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${progress}%`,
                          background: progress === 100 ? '#61bd4f' : 'var(--primary-blue)',
                          transition: 'all 0.3s ease'
                        }} />
                      </div>
                      {checklist.items?.map(item => (
                        <div 
                          key={item.id} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px', 
                            padding: '8px 10px',
                            background: 'var(--bg-primary)',
                            borderRadius: '4px',
                            marginBottom: '6px',
                            border: '1px solid var(--border-color)',
                            transition: 'background 0.2s ease'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => handleToggleChecklistItem(checklist.id, item.id, item.completed)}
                            disabled={!canWrite}
                            style={{ 
                              cursor: canWrite ? 'pointer' : 'default',
                              flexShrink: 0,
                              width: '16px',
                              height: '16px'
                            }}
                          />
                          <div style={{ 
                            flex: 1,
                            fontSize: '14px', 
                            color: item.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
                            textDecoration: item.completed ? 'line-through' : 'none',
                            lineHeight: '1.4'
                          }}>
                            {item.text}
                          </div>
                          {canWrite && (
                            <button
                              onClick={() => handleDeleteChecklistItem(checklist.id, item.id)}
                              style={{
                                padding: '2px 6px',
                                fontSize: '16px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                borderRadius: '3px',
                                transition: 'all 0.2s',
                                flexShrink: 0,
                                lineHeight: 1
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = 'var(--bg-hover)';
                                e.target.style.color = '#eb5a46';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = 'transparent';
                                e.target.style.color = 'var(--text-secondary)';
                              }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      {canWrite && (
                        <button
                          onClick={() => {
                            const title = prompt('Item name:');
                            if (title) handleAddChecklistItem(checklist.id, title);
                          }}
                          style={{
                            width: '100%',
                            padding: '8px',
                            marginTop: '8px',
                            background: 'var(--bg-secondary)',
                            border: 'none',
                            borderRadius: '3px',
                            color: 'var(--text-primary)',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.background = 'var(--bg-hover)'}
                          onMouseLeave={(e) => e.target.style.background = 'var(--bg-secondary)'}
                        >
                          + Add Item
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Comments Section */}
            <div className="card-modal-section">
              <div className="card-modal-section-header">
                <svg className="card-modal-section-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/>
                </svg>
                <h3 className="card-modal-section-title">Activity</h3>
              </div>
              
              {canWrite && (
                <div style={{ marginBottom: '16px' }}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    style={{
                      width: '100%',
                      minHeight: '60px',
                      padding: '8px 12px',
                      border: '2px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      marginBottom: '8px',
                      background: 'var(--input-bg)',
                      color: 'var(--input-text)'
                    }}
                  />
                  <button className="btn-primary" onClick={handleAddComment}>
                    Comment
                  </button>
                </div>
              )}

              {comments && comments.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontStyle: 'italic' }}>
                  No comments yet. Be the first to comment!
                </p>
              )}
              
              {comments && comments.length > 0 && comments.map(comment => (
                <div key={comment.id} style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  marginBottom: '16px',
                  background: 'var(--bg-primary)',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                    flexShrink: 0
                  }}>
                    {comment.user_name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {comment.user_name}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="card-modal-sidebar">
            <div className="card-sidebar-section">
              <h4 className="card-sidebar-title">Add to card</h4>
              
              <button className="card-action-button" onClick={() => setShowLabelPicker(!showLabelPicker)} disabled={!canWrite}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z"/>
                </svg>
                Labels
              </button>

              {showLabelPicker && (
                <div style={{ 
                  background: 'white', 
                  padding: '12px', 
                  borderRadius: '3px', 
                  marginBottom: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <input
                    type="text"
                    placeholder="Label name..."
                    id="label-name-input"
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #dfe1e6',
                      borderRadius: '3px',
                      fontSize: '14px',
                      marginBottom: '8px'
                    }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                    {labelColors.map(({ name, color }) => (
                      <button
                        key={color}
                        onClick={() => {
                          const labelName = document.getElementById('label-name-input').value || name;
                          handleAddLabel(labelName, color);
                        }}
                        style={{
                          background: color,
                          border: 'none',
                          borderRadius: '3px',
                          height: '32px',
                          cursor: 'pointer'
                        }}
                        title={name}
                      />
                    ))}
                  </div>
                </div>
              )}

              <button className="card-action-button" onClick={() => {
                const title = prompt('Checklist title:');
                if (title) handleAddChecklist(title);
              }} disabled={!canWrite}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 7h-9v2h9V7zm0 8h-9v2h9v-2zM5.54 11L2 7.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 11zm0 8L2 15.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 19z"/>
                </svg>
                Checklist
              </button>

              <button className="card-action-button" onClick={() => setShowDatePicker('due')} disabled={!canWrite}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/>
                </svg>
                Due Date
              </button>

              {showDatePicker === 'due' && (
                <div style={{ 
                  background: 'white', 
                  padding: '12px', 
                  borderRadius: '3px', 
                  marginBottom: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <input
                    type="date"
                    value={dueDate ? dueDate.split('T')[0] : ''}
                    onChange={(e) => {
                      setDueDate(e.target.value);
                      handleUpdateField('due_date', e.target.value);
                      setShowDatePicker(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #dfe1e6',
                      borderRadius: '3px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              )}
            </div>

            <div className="card-sidebar-section">
              <h4 className="card-sidebar-title">Actions</h4>
              
              <div style={{ position: 'relative' }}>
                <button 
                  className="card-action-button" 
                  onClick={() => setShowPriorityPicker(!showPriorityPicker)} 
                  disabled={!canWrite}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                  </svg>
                  {priority ? `Priority: ${priority.charAt(0).toUpperCase() + priority.slice(1)}` : 'Set Priority'}
                </button>
                
                {showPriorityPicker && (
                  <div className="priority-picker" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '3px',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 1000,
                    overflow: 'hidden'
                  }}>
                    {priorityOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setPriority(option.value);
                          handleUpdateField('priority', option.value);
                          setShowPriorityPicker(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: 'none',
                          background: priority === option.value ? 'var(--bg-hover)' : 'transparent',
                          color: 'var(--text-primary)',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.target.style.background = priority === option.value ? 'var(--bg-hover)' : 'transparent'}
                      >
                        <span style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '2px',
                          background: option.color
                        }}></span>
                        {option.label}
                      </button>
                    ))}
                    {priority && (
                      <button
                        onClick={() => {
                          setPriority('');
                          handleUpdateField('priority', null);
                          setShowPriorityPicker(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: 'none',
                          borderTop: '1px solid var(--border-color)',
                          background: 'transparent',
                          color: 'var(--text-secondary)',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        Remove Priority
                      </button>
                    )}
                  </div>
                )}
              </div>

              <button className="card-action-button" onClick={() => {
                setCompleted(!completed);
                handleUpdateField('completed', !completed);
              }} disabled={!canWrite}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
                {completed ? 'Mark Incomplete' : 'Mark Complete'}
              </button>

              <button className="card-action-button" onClick={() => {
                const title = prompt('Checklist name:');
                if (title) handleAddChecklist(title);
              }} disabled={!canWrite}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 7h-9v2h9V7zm0 8h-9v2h9v-2zM5.54 11L2 7.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 11zm0 8L2 15.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 19z"/>
                </svg>
                Checklist
              </button>

              {canWrite && (
                <button className="card-action-button btn-danger" onClick={() => {
                  if (confirm('Delete this card?')) {
                    api.deleteCard(card.id).then(() => {
                      onUpdate();
                      onClose();
                    });
                  }
                }} style={{ marginTop: '16px', background: '#eb5a46', color: 'white' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                  Delete Card
                </button>
              )}
            </div>

            {/* Card Info */}
            <div className="card-sidebar-section" style={{ marginTop: '24px' }}>
              <h4 className="card-sidebar-title">Card Info</h4>
              
              {dueDate && (
                <div style={{ fontSize: '12px', color: '#5e6c84', marginBottom: '8px' }}>
                  <strong>Due:</strong> {formatDate(dueDate)}
                  {getDueDateStatus() && (
                    <span style={{ 
                      marginLeft: '8px',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontSize: '10px',
                      fontWeight: 600,
                      background: getDueDateStatus() === 'overdue' ? '#eb5a46' :
                                getDueDateStatus() === 'due-soon' ? '#f2d600' :
                                getDueDateStatus() === 'completed' ? '#61bd4f' : 'rgba(9,30,66,0.08)',
                      color: getDueDateStatus() === 'due-soon' ? '#172b4d' : 'white'
                    }}>
                      {getDueDateStatus().toUpperCase()}
                    </span>
                  )}
                </div>
              )}
              
              {priority && (
                <div style={{ fontSize: '12px', color: '#5e6c84', marginBottom: '8px' }}>
                  <strong>Priority:</strong>
                  <span style={{ 
                    marginLeft: '8px',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '10px',
                    fontWeight: 600,
                    background: priorityOptions.find(p => p.value === priority)?.color,
                    color: priority === 'medium' ? '#172b4d' : 'white'
                  }}>
                    {priority.toUpperCase()}
                  </span>
                </div>
              )}
              
              {(timeEstimate || timeSpent) && (
                <div style={{ fontSize: '12px', color: '#5e6c84', marginBottom: '8px' }}>
                  <strong>Time:</strong>
                  {timeEstimate && ` Est. ${formatTime(timeEstimate)}`}
                  {timeSpent && ` / Spent ${formatTime(timeSpent)}`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default CardModal;
