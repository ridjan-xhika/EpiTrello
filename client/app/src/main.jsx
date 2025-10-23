import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BoardProvider } from './context/BoardContext';
import AppRoutes from './routes/AppRoutes';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BoardProvider>
          <AppRoutes />
        </BoardProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);