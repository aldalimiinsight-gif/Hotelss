// ============================================================
// ErrorMessage.js — Shows a friendly error when something goes wrong
//
// Instead of showing confusing technical error text,
// this displays a clear, helpful message in plain English.
// ============================================================

import React from 'react';

function getErrorDetails(message) {
  const msg = (message || '').toLowerCase();

  if (msg.includes('econnrefused') || msg.includes('network') || msg.includes('failed to fetch')) {
    return {
      title: 'Cannot Connect to Server',
      suggestion: 'The backend server is not running. Open a terminal, navigate to the backend folder, and run: npm start'
    };
  }
  if (msg.includes('check-out') || msg.includes('check-in')) {
    return {
      title: 'Date Error',
      suggestion: 'Check-out date must be at least one day after check-in date.'
    };
  }
  if (msg.includes('hotel name')) {
    return {
      title: 'Missing Hotel Name',
      suggestion: 'Please type the name of the hotel you want to search for.'
    };
  }
  if (msg.includes('city')) {
    return {
      title: 'Missing City',
      suggestion: 'Please enter the city or location where the hotel is located.'
    };
  }
  if (msg.includes('past')) {
    return {
      title: 'Invalid Date',
      suggestion: 'Check-in date cannot be in the past. Please select today or a future date.'
    };
  }
  return {
    title: 'Search Error',
    suggestion: 'Please check that both frontend and backend servers are running, then try again.'
  };
}

function ErrorMessage({ message }) {
  const { title, suggestion } = getErrorDetails(message);

  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <p className="error-title">{title}</p>
      <p className="error-message">{message}</p>
      <div className="error-suggestion">
        <strong>💡 How to fix it:</strong> {suggestion}
      </div>
    </div>
  );
}

export default ErrorMessage;
