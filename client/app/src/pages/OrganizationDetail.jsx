import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/organization-detail.css';

const OrganizationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState(null);
  const [members, setMembers] = useState([]);
  const [boards, setBoards] = useState([]);
  const [activeTab, setActiveTab] = useState('boards');
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateBoardModal, setShowCreateBoardModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [boardTitle, setBoardTitle] = useState('');
  const [editData, setEditData] = useState({
    display_name: '',
    description: ''
  });

  useEffect(() => {
    fetchOrganizationData();
  }, [id]);

  const fetchOrganizationData = async () => {
    try {
      const [orgData, membersData, boardsData] = await Promise.all([
        api.getOrganization(id),
        api.getOrganizationMembers(id),
        api.getOrganizationBoards(id)
      ]);
      setOrganization(orgData);
      setMembers(membersData);
      setBoards(boardsData);
      setEditData({
        display_name: orgData.display_name,
        description: orgData.description || ''
      });
    } catch (error) {
      console.error('Failed to fetch organization:', error);
      navigate('/organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await api.addMemberToOrganization(id, inviteEmail, inviteRole);
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('member');
      alert('Member added successfully!');
      // Refresh members list to show the new member
      fetchOrganizationData();
    } catch (error) {
      alert(error.message || 'Failed to add member. Make sure the user exists and is not already a member.');
    }
  };

  const handleUpdateOrganization = async (e) => {
    e.preventDefault();
    try {
      await api.updateOrganization(id, editData);
      setShowEditModal(false);
      fetchOrganizationData();
    } catch (error) {
      alert('Failed to update organization');
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    try {
      await api.createBoard({ title: boardTitle, organization_id: id });
      setShowCreateBoardModal(false);
      setBoardTitle('');
      fetchOrganizationData();
    } catch (error) {
      alert('Failed to create board');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the organization?')) return;
    try {
      await api.removeOrganizationMember(id, userId);
      fetchOrganizationData();
    } catch (error) {
      alert('Failed to remove member');
    }
  };

  const handleDeleteBoard = async (boardId, e) => {
    e.stopPropagation(); // Prevent navigation to board
    if (!window.confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      return;
    }
    try {
      await api.deleteBoard(boardId);
      alert('Board deleted successfully');
      fetchOrganizationData(); // Refresh the boards list
    } catch (error) {
      alert(error.message || 'Failed to delete board. You may not have permission.');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.updateOrganizationMemberRole(id, userId, newRole);
      fetchOrganizationData();
    } catch (error) {
      alert('Failed to update role');
    }
  };

  const handleDeleteOrganization = async () => {
    if (!window.confirm(`Delete "${organization.display_name}"? This action cannot be undone.`)) return;
    try {
      await api.deleteOrganization(id);
      navigate('/organizations');
    } catch (error) {
      alert('Failed to delete organization');
    }
  };

  const canManage = organization?.userRole === 'admin' || organization?.userRole === 'owner';
  const isOwner = organization?.userRole === 'owner';

  const getRoleBadge = (role) => {
    const badges = {
      owner: { icon: '👑', color: 'gold', text: 'Owner' },
      admin: { icon: '⭐', color: 'purple', text: 'Admin' },
      member: { icon: '👤', color: 'blue', text: 'Member' }
    };
    const badge = badges[role] || badges.member;
    return (
      <span className={`role-badge role-${badge.color}`}>
        {badge.icon} {badge.text}
      </span>
    );
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="organization-detail-page">
      <div className="organization-header">
        <div className="organization-header-left">
          <div className="organization-icon-large">
            {organization.display_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1>{organization.display_name}</h1>
            {organization.description && (
              <p className="organization-description">{organization.description}</p>
            )}
          </div>
        </div>
        <div className="organization-header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate(`/organizations/${id}/audit-log`)}
          >
            📋 Audit Log
          </button>
          {canManage && (
            <>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowEditModal(true)}
              >
                Edit
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => setShowInviteModal(true)}
              >
                + Add Member
              </button>
            </>
          )}
          {isOwner && (
            <button 
              className="btn btn-danger"
              onClick={handleDeleteOrganization}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="organization-tabs">
        <button 
          className={`tab ${activeTab === 'boards' ? 'active' : ''}`}
          onClick={() => setActiveTab('boards')}
        >
          Boards ({boards.length})
        </button>
        <button 
          className={`tab ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Members ({members.length})
        </button>
      </div>

      <div className="organization-content">
        {activeTab === 'boards' && (
          <div className="boards-section">
            <div className="section-header">
              <h2>Boards</h2>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateBoardModal(true)}
              >
                + Create Board
              </button>
            </div>
            <div className="boards-grid">
              {boards.map((board) => (
                <div 
                  key={board.id} 
                  className="board-card"
                  onClick={() => navigate(`/board/${board.id}`)}
                  style={{position: 'relative'}}
                >
                  <h3>{board.title}</h3>
                  <p className="board-creator">Created by {board.creator_name}</p>
                  <button
                    className="board-delete-btn"
                    onClick={(e) => handleDeleteBoard(board.id, e)}
                    title="Delete Board"
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(220, 53, 69, 0.1)',
                      color: 'var(--btn-danger-bg)',
                      border: '1px solid rgba(220, 53, 69, 0.3)',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'var(--btn-danger-bg)';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(220, 53, 69, 0.1)';
                      e.currentTarget.style.color = 'var(--btn-danger-bg)';
                    }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
              {boards.length === 0 && (
                <div className="empty-state-small">
                  <p>No boards yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="members-section">
            <h2>Members</h2>
            <div className="members-list">
              {members.map((member) => (
                <div key={member.id} className="member-item">
                  <div 
                    className="member-avatar"
                    onClick={() => navigate(`/user/${member.user_id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="member-info">
                    <div 
                      className="member-name"
                      onClick={() => navigate(`/user/${member.user_id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      {member.name}
                    </div>
                    <div className="member-email">{member.email}</div>
                  </div>
                  <div className="member-actions">
                    {canManage && member.role !== 'owner' ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.user_id, e.target.value)}
                        className="role-select"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                        {isOwner && <option value="owner">Owner</option>}
                      </select>
                    ) : (
                      getRoleBadge(member.role)
                    )}
                    {canManage && member.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveMember(member.user_id)}
                        className="btn-icon btn-danger-icon"
                        title="Remove member"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Member</h2>
              <button className="modal-close" onClick={() => setShowInviteModal(false)}>×</button>
            </div>
            <form onSubmit={handleInvite}>
              <div className="form-group">
                <label>User Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="member@example.com"
                  required
                  className="form-input"
                />
                <small style={{color: 'var(--text-secondary)', marginTop: '4px', display: 'block'}}>
                  The user must already have an account
                </small>
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="form-select"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Add Member</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowInviteModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Organization</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateOrganization}>
              <div className="form-group">
                <label>Display Name</label>
                <input
                  type="text"
                  value={editData.display_name}
                  onChange={(e) => setEditData({ ...editData, display_name: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows="3"
                  className="form-textarea"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Board Modal */}
      {showCreateBoardModal && (
        <div className="modal-overlay" onClick={() => setShowCreateBoardModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Board</h2>
              <button className="modal-close" onClick={() => setShowCreateBoardModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateBoard}>
              <div className="form-group">
                <label>Board Title</label>
                <input
                  type="text"
                  value={boardTitle}
                  onChange={(e) => setBoardTitle(e.target.value)}
                  placeholder="My Board"
                  required
                  className="form-input"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Create Board</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateBoardModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationDetail;
