import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultUsers = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin User',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      username: 'user',
      email: 'user@example.com',
      password: 'user123',
      name: 'Regular User',
      createdAt: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    const storedUsers = localStorage.getItem('trello_users');
    const storedCurrentUser = localStorage.getItem('trello_current_user');

    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers));
      } catch (e) {
        setUsers(defaultUsers);
        localStorage.setItem('trello_users', JSON.stringify(defaultUsers));
      }
    } else {
      setUsers(defaultUsers);
      localStorage.setItem('trello_users', JSON.stringify(defaultUsers));
    }

    if (storedCurrentUser) {
      try {
        setCurrentUser(JSON.parse(storedCurrentUser));
      } catch (e) {
        localStorage.removeItem('trello_current_user');
      }
    }

    setLoading(false);
  }, []);

  // register accepts email, password, name and optional username
  const register = ({ email, password, name, username }) => {
    const uname = username || email.split('@')[0];
    const existingUser = users.find(
      (u) => u.email === email || u.username === uname
    );
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      username: uname,
      password, // Note: in production you must hash passwords
      name,
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('trello_users', JSON.stringify(updatedUsers));

    return newUser;
  };

  // login accepts either email or username as first arg
  const login = (identifier, password) => {
    const user = users.find(
      (u) =>
        (u.email === identifier || u.username === identifier) &&
        u.password === password
    );

    if (!user) {
      throw new Error('Invalid email/username or password');
    }

    setCurrentUser(user);
    localStorage.setItem('trello_current_user', JSON.stringify(user));
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('trello_current_user');
  };

  const value = {
    currentUser,
    users,
    register,
    login,
    logout,
    loading,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};