import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBoard } from '../context/BoardContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import '../styles/home.css';

const Home = () => {
  const { boards, addBoard, deleteBoard, loading } = useBoard();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');
  const navigate = useNavigate();

  const handleCreateBoard = async () => {
    if (boardTitle.trim()) {
      try {
        const newBoardId = await addBoard(boardTitle);
        setBoardTitle('');
        setIsModalOpen(false);
        navigate(`/board/${newBoardId}`);
      } catch (error) {
        alert('Failed to create board');
      }
    }
  };

  const handleDeleteBoard = async (boardId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this board?')) {
      try {
        await deleteBoard(boardId);
      } catch (error) {
        alert('Failed to delete board');
      }
    }
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="home-hero">
        <div className="home-hero-content">
          <h1 className="home-hero-title">
            Welcome back, {user?.username || 'User'}! 👋
          </h1>
          <p className="home-hero-subtitle">
            Pick up where you left off or start a new project
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="home-content">
        {/* Quick Stats */}
        <div className="home-stats">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <div className="stat-number">{boards.length}</div>
              <div className="stat-label">Total Boards</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📁</div>
            <div className="stat-info">
              <div className="stat-number">{boards.reduce((sum, b) => sum + (b.columnCount || 0), 0)}</div>
              <div className="stat-label">Total Lists</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✨</div>
            <div className="stat-info">
              <div className="stat-number">Active</div>
              <div className="stat-label">Workspace</div>
            </div>
          </div>
        </div>

        {/* Boards Section */}
        <div className="home-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M0 2a2 2 0 012-2h4a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2zm8 0a2 2 0 012-2h4a2 2 0 012 2v8a2 2 0 01-2 2h-4a2 2 0 01-2-2V2z"/>
                </svg>
                Your Boards
              </h2>
              <p className="section-subtitle">Manage your projects and tasks</p>
            </div>
            <div className="section-actions">
              <button
                onClick={() => navigate('/organizations')}
                className="btn btn-secondary"
              >
                🏢 Organizations
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary"
              >
                ➕ Create Board
              </button>
            </div>
          </div>

          <div className="boards-grid">
            {boards.map((board) => (
              <Link
                key={board.id}
                to={`/board/${board.id}`}
                className="board-card"
              >
                <div className="board-card-header">
                  <div className="board-card-icon">📋</div>
                  <button
                    onClick={(e) => handleDeleteBoard(board.id, e)}
                    className="board-card-delete"
                    title="Delete board"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
                    </svg>
                  </button>
                </div>
                <div className="board-card-content">
                  <h3 className="board-card-title">{board.title}</h3>
                  <p className="board-card-meta">
                    {board.columnCount || 0} {board.columnCount === 1 ? 'list' : 'lists'}
                  </p>
                </div>
                <div className="board-card-footer">
                  <span className="board-card-status">Active</span>
                </div>
              </Link>
            ))}
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="board-card board-card-create"
            >
              <div className="board-card-create-content">
                <div className="board-card-create-icon">+</div>
                <div className="board-card-create-text">Create new board</div>
              </div>
            </button>
          </div>

          {boards.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="80" height="80" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M0 2a2 2 0 012-2h4a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2zm8 0a2 2 0 012-2h4a2 2 0 012 2v8a2 2 0 01-2 2h-4a2 2 0 01-2-2V2z"/>
                </svg>
              </div>
              <h2 className="empty-state-title">No boards yet</h2>
              <p className="empty-state-text">Create your first board to get started with organizing your work!</p>
              <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                Create Your First Board
              </button>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="home-features">
          <h2 className="features-title">Why Choose EpiTrello?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Stay Organized</h3>
              <p className="feature-description">
                Keep all your projects and tasks in one place with intuitive boards and lists.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3 className="feature-title">Collaborate</h3>
              <p className="feature-description">
                Work together with your team in real-time and share boards effortlessly.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Multiple Views</h3>
              <p className="feature-description">
                Switch between board, list, calendar, and table views to match your workflow.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Secure</h3>
              <p className="feature-description">
                Your data is protected with enterprise-grade security and permissions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">EpiTrello</h3>
            <p className="footer-text">
              Professional project management made simple. Organize anything, together.
            </p>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Product</h4>
            <ul className="footer-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#templates">Templates</a></li>
              <li><a href="#integrations">Integrations</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Resources</h4>
            <ul className="footer-links">
              <li><a href="#help">Help Center</a></li>
              <li><a href="#docs">Documentation</a></li>
              <li><a href="#guides">Guides</a></li>
              <li><a href="#community">Community</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-links">
              <li><a href="#about">About</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 EpiTrello. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#privacy">Privacy Policy</a>
            <span>•</span>
            <a href="#terms">Terms of Service</a>
            <span>•</span>
            <a href="#cookies">Cookie Policy</a>
          </div>
        </div>
      </footer>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setBoardTitle('');
        }}
        title="Create board"
      >
        <div className="form-group">
          <label>Board title</label>
          <input
            type="text"
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            placeholder="e.g. Project Planning"
            className="form-input"
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && handleCreateBoard()}
          />
        </div>
        <div className="form-actions">
          <button onClick={handleCreateBoard} className="btn btn-primary">
            Create board
          </button>
          <button
            onClick={() => {
              setIsModalOpen(false);
              setBoardTitle('');
            }}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Home;