import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!identifier || !password) {
        throw new Error('Please fill in all fields');
      }

      login(identifier, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <svg className="trello-logo" width="150" height="32" viewBox="0 0 150 32" fill="none">
            <rect x="0" y="0" width="10" height="32" rx="2" fill="var(--primary-blue)"/>
            <rect x="14" y="0" width="10" height="24" rx="2" fill="var(--primary-blue)"/>
            <text x="32" y="24" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" fill="var(--text-primary)">EpiTrelloo</text>
          </svg>
          <h2>Log in to continue</h2>
        </div>

        {error && (
          <div className="auth-error">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm1 13H7V7h2v6zm0-8H7V3h2v2z"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="form-input"
              placeholder="Enter email or username"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter password"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <div className="auth-demo">
          <p className="demo-text">Demo credentials:</p>
          <div className="demo-credentials">
            <code>admin / admin123</code>
            <code>user / user123</code>
          </div>
        </div>

        <div className="auth-footer">
          <Link to="/register" className="auth-link">
            Can't log in? • Sign up for an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;