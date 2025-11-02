import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/audit-log.css';

function AuditLog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const limit = 20;

  useEffect(() => {
    loadData();
  }, [id, page, filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orgData, auditData] = await Promise.all([
        api.getOrganization(id),
        api.getOrganizationAuditLogs(id, limit, page * limit, filter || null)
      ]);
      setOrganization(orgData);
      setLogs(auditData.logs);
      setTotal(auditData.total);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      alert('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (actionType) => {
    if (actionType.includes('created')) return '✨';
    if (actionType.includes('updated')) return '✏️';
    if (actionType.includes('deleted')) return '🗑️';
    if (actionType.includes('added')) return '➕';
    if (actionType.includes('removed')) return '➖';
    if (actionType.includes('moved')) return '↔️';
    if (actionType.includes('commented')) return '💬';
    return '📝';
  };

  const getActionDescription = (log) => {
    const { action_type, entity_type, action_details } = log;
    
    switch (action_type) {
      case 'organization_created':
        return `created organization "${action_details?.organization_name || 'Untitled'}"`;
      case 'board_created':
        return `created board "${action_details?.board_title || 'Untitled'}"`;
      case 'board_updated':
        return `updated board "${action_details?.board_title || 'a board'}"`;
      case 'board_deleted':
        return `deleted board "${action_details?.board_title || 'a board'}"`;
      case 'card_created':
        return `created card "${action_details?.card_title || 'Untitled'}"`;
      case 'card_updated':
        return `updated card "${action_details?.card_title || 'a card'}"`;
      case 'card_deleted':
        return `deleted card "${action_details?.card_title || 'a card'}"`;
      case 'card_moved':
        return `moved card "${action_details?.card_title || 'a card'}"`;
      case 'column_created':
        return `created list "${action_details?.column_title || 'Untitled'}"${action_details?.board_title ? ` in board "${action_details.board_title}"` : ''}`;
      case 'column_updated':
        return `updated list "${action_details?.column_title || 'a list'}"`;
      case 'column_deleted':
        return `deleted list "${action_details?.column_title || 'a list'}"`;
      case 'member_added':
        return `added ${action_details?.member_name || 'a member'} (${action_details?.member_email || ''}) as ${action_details?.role || 'member'}`;
      case 'member_removed':
        return `removed ${action_details?.member_name || 'a member'} from the organization`;
      case 'member_role_updated':
        return `changed ${action_details?.member_name || 'a member'}'s role from ${action_details?.old_role || 'unknown'} to ${action_details?.new_role || 'unknown'}`;
      default:
        return `performed ${action_type.replace(/_/g, ' ')} on ${entity_type}`;
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && logs.length === 0) {
    return (
      <div className="audit-log-page">
        <div className="audit-log-header">
          <button onClick={() => navigate(`/organizations/${id}`)} className="back-button">
            ← Back
          </button>
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="audit-log-page">
      <div className="audit-log-header">
        <div className="header-left">
          <button onClick={() => navigate(`/organizations/${id}`)} className="back-button">
            ← Back
          </button>
          <div>
            <h1>Audit Log</h1>
            <p className="org-name">{organization?.display_name}</p>
          </div>
        </div>
        <div className="header-stats">
          <span className="stat-badge">{total} total events</span>
        </div>
      </div>

      <div className="audit-log-controls">
        <div className="filter-group">
          <label htmlFor="action-filter">Filter by action:</label>
          <select 
            id="action-filter"
            value={filter} 
            onChange={(e) => { setFilter(e.target.value); setPage(0); }}
            className="filter-select"
          >
            <option value="">All actions</option>
            <option value="board_created">Board created</option>
            <option value="board_updated">Board updated</option>
            <option value="board_deleted">Board deleted</option>
            <option value="card_created">Card created</option>
            <option value="card_updated">Card updated</option>
            <option value="card_deleted">Card deleted</option>
            <option value="card_moved">Card moved</option>
            <option value="member_added">Member added</option>
            <option value="member_removed">Member removed</option>
          </select>
        </div>
      </div>

      <div className="audit-log-list">
        {logs.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <p>No audit logs found</p>
            <span>Activity will appear here when actions are performed</span>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="audit-log-item">
              <div className="log-icon">{getActionIcon(log.action_type)}</div>
              <div className="log-content">
                <div className="log-main">
                  <span className="log-user">{log.user_name || log.username}</span>
                  <span className="log-description">{getActionDescription(log)}</span>
                </div>
                <div className="log-meta">
                  <span className="log-time">{formatDate(log.created_at)}</span>
                  {log.ip_address && (
                    <span className="log-ip">IP: {log.ip_address}</span>
                  )}
                  <span className="log-type">{log.entity_type}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="page-button"
          >
            ← Previous
          </button>
          <span className="page-info">
            Page {page + 1} of {totalPages}
          </span>
          <button 
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="page-button"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default AuditLog;
