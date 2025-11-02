import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Home from '../pages/Home';
import BoardPage from '../pages/BoardPage';
import Settings from '../pages/Settings';
import Profile from '../pages/Profile';
import UserProfile from '../pages/UserProfile';
import Organizations from '../pages/Organizations';
import OrganizationDetail from '../pages/OrganizationDetail';
import AuditLog from '../pages/AuditLog';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* Show navbar only if authenticated */}
      {isAuthenticated && <Navbar />}

      <Routes>
        {/* Authentication routes - redirect to home if already logged in */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} 
        />

        {/* Protected routes - require authentication */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/board/:id" 
          element={
            <ProtectedRoute>
              <BoardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/:userId" 
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/organizations" 
          element={
            <ProtectedRoute>
              <Organizations />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/organizations/:id" 
          element={
            <ProtectedRoute>
              <OrganizationDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/organizations/:id/audit-log" 
          element={
            <ProtectedRoute>
              <AuditLog />
            </ProtectedRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
