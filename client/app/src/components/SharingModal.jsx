import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/sharing-modal.css';

const SharingModal = ({ boardId, onClose }) => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('read');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    loadMembers();
    loadUserRole();
  }, [boardId]);

  const loadUserRole = async () => {
    try {
      const { role } = await api.getBoardRole(boardId);
      setUserRole(role);
    } catch (err) {
      console.error('Failed to load user role:', err);
    }
  };

  const loadMembers = async () => {
    try {
      setLoading(true);
      const { members } = await api.getBoardMembers(boardId);
      setMembers(members);
    } catch (err) {
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!inviteEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    try {
      setInviting(true);
      const result = await api.inviteToBoard(boardId, inviteEmail, inviteRole);
      
      if (result.direct) {
        setSuccess('User added to board successfully!');
        loadMembers(); // Refresh members list
      } else {
        setSuccess('Invitation sent successfully!');
      }
      
      setInviteEmail('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateMemberRole(boardId, userId, newRole);
      setSuccess('Role updated successfully');
      loadMembers();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveMember = async (userId, userName) => {
    if (!confirm(`Remove ${userName} from this board?`)) return;

    try {
      await api.removeMember(boardId, userId);
      setSuccess('Member removed successfully');
      loadMembers();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const canManageMembers = ['owner', 'admin'].includes(userRole);

  const getRoleBadgeClass = (role) => {
    const classes = {
      owner: 'role-badge-owner',
      admin: 'role-badge-admin',
      write: 'role-badge-write',
      read: 'role-badge-read'
    };
    return classes[role] || '';
  };

  const getRoleIcon = (role) => {
    const icons = {
      owner: '👑',
      admin: '⭐',
      write: '✏️',
      read: '👁️'
    };
    return icons[role] || '';
  };

  const handleViewProfile = (userId) => {
    navigate(`/user/${userId}`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="sharing-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sharing-modal-header">
          <h2>🤝 Share Board</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="sharing-alert sharing-alert-error">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="sharing-alert sharing-alert-success">
            ✓ {success}
          </div>
        )}

        {canManageMembers && (
          <form onSubmit={handleInvite} className="sharing-invite-form">
            <div className="sharing-form-row">
              <input
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="sharing-email-input"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="sharing-role-select"
              >
                <option value="read">👁️ Read Only</option>
                <option value="write">✏️ Can Edit</option>
                <option value="admin">⭐ Admin</option>
              </select>
              <button 
                type="submit" 
                className="sharing-invite-btn"
                disabled={inviting}
              >
                {inviting ? '...' : 'Invite'}
              </button>
            </div>
            <p className="sharing-hint">
              Members will receive an invitation to collaborate on this board
            </p>
          </form>
        )}

        <div className="sharing-members-section">
          <h3>Board Members ({members.length})</h3>
          
          {loading ? (
            <div className="sharing-loading">
              <div className="spinner-small"></div>
              <p>Loading members...</p>
            </div>
          ) : members.length === 0 ? (
            <p className="sharing-empty">No members yet</p>
          ) : (
            <div className="sharing-members-list">
              {members.map((member) => (
                <div key={member.id} className="sharing-member-item">
                  <div 
                    className="sharing-member-info"
                    onClick={() => handleViewProfile(member.user_id)}
                    style={{ cursor: 'pointer' }}
                    title="Click to view profile"
                  >
                    <div className="sharing-member-avatar">
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="sharing-member-details">
                      <div className="sharing-member-name">
                        {member.name}
                        {member.via_organization && (
                          <span 
                            style={{
                              marginLeft: '8px',
                              fontSize: '0.75rem',
                              padding: '2px 6px',
                              background: 'var(--primary-color)',
                              color: 'white',
                              borderRadius: '3px',
                              fontWeight: '600'
                            }}
                            title="Access via organization membership"
                          >
                            🏢 Org Member
                          </span>
                        )}
                      </div>
                      <div className="sharing-member-email">{member.email}</div>
                    </div>
                  </div>
                  
                  <div className="sharing-member-actions">
                    {member.role === 'owner' ? (
                      <span className={`role-badge ${getRoleBadgeClass(member.role)}`}>
                        {getRoleIcon(member.role)} Owner
                      </span>
                    ) : member.via_organization ? (
                      <span 
                        className={`role-badge ${getRoleBadgeClass(member.role)}`}
                        title="Access granted via organization membership"
                      >
                        {getRoleIcon(member.role)} {member.role} (Org)
                      </span>
                    ) : canManageMembers ? (
                      <>
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                          className="sharing-role-select-small"
                        >
                          <option value="read">👁️ Read</option>
                          <option value="write">✏️ Write</option>
                          <option value="admin">⭐ Admin</option>
                        </select>
                        <button
                          onClick={() => handleRemoveMember(member.user_id, member.name)}
                          className="sharing-remove-btn"
                          title="Remove member"
                        >
                          🗑️
                        </button>
                      </>
                    ) : (
                      <span className={`role-badge ${getRoleBadgeClass(member.role)}`}>
                        {getRoleIcon(member.role)} {member.role}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sharing-permissions-info">
          <h4>📋 Permission Levels</h4>
          <ul>
            <li><strong>👑 Owner:</strong> Full control of the board</li>
            <li><strong>⭐ Admin:</strong> Manage members and edit everything</li>
            <li><strong>✏️ Write:</strong> Create and edit cards and lists</li>
            <li><strong>👁️ Read:</strong> View only, cannot make changes</li>
          </ul>
          <p style={{marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
            💡 <strong>Note:</strong> All members of the board's organization automatically have access to this board.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharingModal;
