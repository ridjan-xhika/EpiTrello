import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/organizations.css';

const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const data = await api.getOrganizations();
      setOrganizations(data);
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createOrganization(formData);
      setShowCreateModal(false);
      setFormData({ name: '', display_name: '', description: '' });
      fetchOrganizations();
    } catch (error) {
      alert('Failed to create organization');
    }
  };

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
    return <div className="loading">Loading organizations...</div>;
  }

  return (
    <div className="organizations-page">
      <div className="organizations-header">
        <h1>Organizations</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Organization
        </button>
      </div>

      <div className="organizations-grid">
        {organizations.length === 0 ? (
          <div className="empty-state">
            <h2>No organizations yet</h2>
            <p>Create your first organization to collaborate with your team</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              Create Organization
            </button>
          </div>
        ) : (
          organizations.map((org) => (
            <div 
              key={org.id} 
              className="organization-card"
              onClick={() => navigate(`/organizations/${org.id}`)}
            >
              <div className="organization-card-header">
                <div className="organization-icon">
                  {org.display_name.charAt(0).toUpperCase()}
                </div>
                <div className="organization-info">
                  <h3>{org.display_name}</h3>
                  {getRoleBadge(org.role)}
                </div>
              </div>
              {org.description && (
                <p className="organization-description">{org.description}</p>
              )}
              <div className="organization-stats">
                <div className="stat">
                  <span className="stat-value">{org.member_count || 0}</span>
                  <span className="stat-label">Members</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{org.board_count || 0}</span>
                  <span className="stat-label">Boards</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Organization</h2>
              <button 
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreate} className="organization-form">
              <div className="form-group">
                <label>Organization Name *</label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => {
                    const displayName = e.target.value;
                    const name = displayName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                    setFormData({ ...formData, display_name: displayName, name });
                  }}
                  placeholder="My Organization"
                  required
                  className="form-input"
                />
                <small className="form-hint">URL: {formData.name || 'my-organization'}</small>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What does your organization do?"
                  rows="3"
                  className="form-textarea"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Create Organization
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Organizations;
