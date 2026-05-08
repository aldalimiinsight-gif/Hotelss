// ============================================================
// AuditContext.js — Shared "audit log" accessible across all components
//
// Think of this like a notebook that every part of the app
// can write into. The AuditPanel reads from this notebook.
// ============================================================

import React, { createContext, useContext, useState, useCallback } from 'react';

const AuditContext = createContext(null);

export function AuditProvider({ children }) {
  const [logs, setLogs] = useState([]);
  const [apiStatuses, setApiStatuses] = useState({});
  const [validationResults, setValidationResults] = useState([]);

  // Adds a new line to the audit log
  const addLog = useCallback((type, message, details = null) => {
    const entry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      type, // 'success', 'error', 'warning', 'info'
      message,
      details
    };
    setLogs(prev => [entry, ...prev].slice(0, 100)); // Keep last 100 entries
  }, []);

  // Updates the health status of a booking platform
  const updateApiStatus = useCallback((platformName, status, responseTime) => {
    setApiStatuses(prev => ({
      ...prev,
      [platformName]: {
        status, // 'connected', 'slow', 'failed'
        responseTime,
        lastChecked: new Date().toLocaleTimeString()
      }
    }));
  }, []);

  // Records a data validation result
  const addValidation = useCallback((check, passed, message) => {
    setValidationResults(prev => [
      { id: Date.now() + Math.random(), check, passed, message, timestamp: new Date().toLocaleTimeString() },
      ...prev
    ].slice(0, 50));
  }, []);

  // Clears all audit data (fresh start)
  const clearAudit = useCallback(() => {
    setLogs([]);
    setApiStatuses({});
    setValidationResults([]);
  }, []);

  return (
    <AuditContext.Provider value={{
      logs,
      apiStatuses,
      validationResults,
      addLog,
      updateApiStatus,
      addValidation,
      clearAudit
    }}>
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAudit must be used inside AuditProvider');
  }
  return context;
}
