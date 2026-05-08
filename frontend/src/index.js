import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuditProvider } from './context/AuditContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuditProvider>
      <App />
    </AuditProvider>
  </React.StrictMode>
);
