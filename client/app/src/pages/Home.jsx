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
            Welcome back, {user?.username || 'User'}!
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
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor">
                <path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25V1.75zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25H1.75z"></path>
                <path d="M3.75 3a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5A.75.75 0 0 1 3.75 3zm4 0a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5A.75.75 0 0 1 7.75 3zm4 0a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5a.75.75 0 0 1 .75-.75z"></path>
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-number">{boards.length}</div>
              <div className="stat-label">Total Boards</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4zm2-.5a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V4a.5.5 0 0 0-.5-.5H4z"></path>
                <path d="M5 7a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 7zm0 2.5a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75z"></path>
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-number">{boards.reduce((sum, b) => sum + (b.columnCount || 0), 0)}</div>
              <div className="stat-label">Total Lists</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zm3.78-9.72a.751.751 0 0 0-.018-1.042.751.751 0 0 0-1.042-.018L6.75 9.19 5.28 7.72a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042l2 2a.75.75 0 0 0 1.06 0l4.5-4.5z"></path>
              </svg>
            </div>
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
                Organizations
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary"
              >
                Create Board
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
                  <div className="board-card-icon">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25V1.75zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25H1.75z"></path>
                      <path d="M3.75 3a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5A.75.75 0 0 1 3.75 3zm4 0a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5A.75.75 0 0 1 7.75 3zm4 0a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5a.75.75 0 0 1 .75-.75z"></path>
                    </svg>
                  </div>
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
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm9.78-2.22-5.5 5.5a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l5.5-5.5a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z"></path>
                </svg>
              </div>
              <h3 className="feature-title">Stay Organized</h3>
              <p className="feature-description">
                Keep all your projects and tasks in one place with intuitive boards and lists.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M5.5 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Z"></path>
                </svg>
              </div>
              <h3 className="feature-title">Collaborate</h3>
              <p className="feature-description">
                Work together with your team in real-time and share boards effortlessly.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0ZM1.5 1.75v12.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25ZM11.75 3a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5a.75.75 0 0 1 .75-.75Zm-8.25.75a.75.75 0 0 1 1.5 0v7.5a.75.75 0 0 1-1.5 0v-7.5ZM8 3a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5A.75.75 0 0 1 8 3Z"></path>
                </svg>
              </div>
              <h3 className="feature-title">Multiple Views</h3>
              <p className="feature-description">
                Switch between board, list, calendar, and table views to match your workflow.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 4a4 4 0 0 1 8 0v2h.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25v-5.5C2 6.784 2.784 6 3.75 6H4Zm8.25 3.5h-8.5a.25.25 0 0 0-.25.25v5.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-5.5a.25.25 0 0 0-.25-.25ZM10.5 6V4a2.5 2.5 0 1 0-5 0v2Z"></path>
                </svg>
              </div>
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