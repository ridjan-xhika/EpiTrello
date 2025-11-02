import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const { user } = await api.getCurrentUser();
          setCurrentUser(user);
        } catch (error) {
          console.error('Failed to get current user:', error);
          localStorage.removeItem('token');
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const register = async ({ email, password, name, username }) => {
    try {
      const { user } = await api.register({ email, password, name, username });
      setCurrentUser(user);
      return user;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const login = async (identifier, password) => {
    try {
      const { user } = await api.login({ identifier, password });
      setCurrentUser(user);
      return user;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = () => {
    api.logout();
    setCurrentUser(null);
  };

  const updateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  const value = {
    currentUser,
    user: currentUser, // Add alias for consistency
    register,
    login,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};