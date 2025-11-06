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
      owner: { color: 'gold', text: 'Owner' },
      admin: { color: 'purple', text: 'Admin' },
      member: { color: 'blue', text: 'Member' }
    };
    const badge = badges[role] || badges.member;
    return (
      <span className={`role-badge role-${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return <div className="loading">Loading organizations...</div>;
  }

  return (
    <div className="organizations-page">
      {/* Hero Section */}
      <div className="organizations-hero">
        <div className="organizations-hero-content">
          <h1 className="organizations-hero-title">Your Organizations</h1>
          <p className="organizations-hero-subtitle">
            Manage your teams, collaborate on projects, and organize your work
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="organizations-content">
        {/* Stats Overview */}
        {organizations.length > 0 && (
          <div className="organizations-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-10.5A1.75 1.75 0 0 0 14.25 1H1.75zM1.5 2.75a.25.25 0 0 1 .25-.25h12.5a.25.25 0 0 1 .25.25v10.5a.25.25 0 0 1-.25.25H1.75a.25.25 0 0 1-.25-.25V2.75z"></path>
                  <path d="M4.75 4a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5zM4 7.75A.75.75 0 0 1 4.75 7h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 4 7.75zm.75 2.75a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5z"></path>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-number">{organizations.length}</div>
                <div className="stat-label">Total Organizations</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M5.5 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Z"></path>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-number">
                  {organizations.reduce((sum, org) => sum + (org.member_count || 0), 0)}
                </div>
                <div className="stat-label">Total Members</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25V1.75zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25H1.75z"></path>
                  <path d="M3.75 3a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5A.75.75 0 0 1 3.75 3zm4 0a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5A.75.75 0 0 1 7.75 3zm4 0a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5a.75.75 0 0 1 .75-.75z"></path>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-number">
                  {organizations.reduce((sum, org) => sum + (org.board_count || 0), 0)}
                </div>
                <div className="stat-label">Total Boards</div>
              </div>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="organizations-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-10.5A1.75 1.75 0 0 0 14.25 1H1.75zM1.5 2.75a.25.25 0 0 1 .25-.25h12.5a.25.25 0 0 1 .25.25v10.5a.25.25 0 0 1-.25.25H1.75a.25.25 0 0 1-.25-.25V2.75z"></path>
                  <path d="M4.75 4a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5zM4 7.75A.75.75 0 0 1 4.75 7h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 4 7.75zm.75 2.75a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5z"></path>
                </svg>
                All Organizations
              </h2>
              <p className="section-subtitle">{organizations.length} organization{organizations.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="section-actions">
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                + Create Organization
              </button>
            </div>
          </div>

          {/* Organizations Grid */}
          <div className="organizations-grid">
            {organizations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="80" height="80" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-10.5A1.75 1.75 0 0 0 14.25 1H1.75zM1.5 2.75a.25.25 0 0 1 .25-.25h12.5a.25.25 0 0 1 .25.25v10.5a.25.25 0 0 1-.25.25H1.75a.25.25 0 0 1-.25-.25V2.75z"></path>
                  </svg>
                </div>
                <h2 className="empty-state-title">No organizations yet</h2>
                <p className="empty-state-text">
                  Create your first organization to collaborate with your team and manage projects together
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  Create Your First Organization
                </button>
              </div>
            ) : (
              <>
                {organizations.map((org) => (
                  <div 
                    key={org.id} 
                    className="organization-card"
                    onClick={() => navigate(`/organizations/${org.id}`)}
                  >
                    <div className="organization-card-header">
                      <div className="organization-icon">
                        {org.display_name.charAt(0).toUpperCase()}
                      </div>
                      {getRoleBadge(org.role)}
                    </div>
                    <div className="organization-card-content">
                      <h3 className="organization-card-title">{org.display_name}</h3>
                      {org.description && (
                        <p className="organization-card-description">{org.description}</p>
                      )}
                    </div>
                    <div className="organization-card-footer">
                      <div className="organization-stat">
                        <span className="stat-value">{org.member_count || 0}</span>
                        <span className="stat-label">Members</span>
                      </div>
                      <div className="organization-stat">
                        <span className="stat-value">{org.board_count || 0}</span>
                        <span className="stat-label">Boards</span>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Create Card */}
                <div 
                  className="organization-card organization-card-create"
                  onClick={() => setShowCreateModal(true)}
                >
                  <div className="organization-card-create-content">
                    <div className="organization-card-create-icon">+</div>
                    <div className="organization-card-create-text">Create New Organization</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
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
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
                </svg>
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
