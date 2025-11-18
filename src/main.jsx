import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { BabyProvider } from './contexts/BabyContext';
import { migrateStorage } from './utils/storageMigration';
import './styles/globals.css';

// Run storage migration on app start
migrateStorage();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.VITE_BASE_PATH || '/'}>
      <AuthProvider>
        <BabyProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </BabyProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
