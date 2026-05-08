// ============================================================
// AuditPanel.js — The built-in debugging and audit tool
//
// Opened by clicking the "🔍 Audit" button in the bottom-right.
// Shows real-time logs, API health, and data validation results.
// You can download a full report as a .txt file.
// ============================================================

import React, { useState, useMemo } from 'react';
import { useAudit } from '../context/AuditContext';

const ALL_PLATFORMS = ['Official Website', 'Booking.com', 'Hotels.com', 'Expedia', 'Agoda', 'Kayak', 'Trivago', 'Priceline'];

function AuditPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('logs');
  const { logs, apiStatuses, validationResults, clearAudit } = useAudit();

  const errorCount = useMemo(() => logs.filter(l => l.type === 'error').length, [logs]);

  // ─── EXPORT AUDIT REPORT ──────────────────────────────────
  const handleExport = () => {
    const lines = [];
    lines.push('='.repeat(60));
    lines.push('  HOTEL COMPARE — AUDIT REPORT');
    lines.push(`  Generated: ${new Date().toLocaleString()}`);
    lines.push('='.repeat(60));
    lines.push('');

    lines.push('── ACTIVITY LOG ─────────────────────────────────────');
    if (logs.length === 0) {
      lines.push('No activity recorded yet. Perform a search first.');
    } else {
      logs.forEach(log => {
        const typeLabel = log.type.toUpperCase().padEnd(7);
        lines.push(`[${log.timestamp}] ${typeLabel} ${log.message}`);
        if (log.details) lines.push(`         → ${log.details}`);
      });
    }

    lines.push('');
    lines.push('── API HEALTH STATUS ────────────────────────────────');
    ALL_PLATFORMS.forEach(platform => {
      const status = apiStatuses[platform];
      if (status) {
        const statusLabel = status.status === 'connected' ? '✅ Connected'
          : status.status === 'slow' ? '⚠️  Slow'
          : '❌ Failed';
        lines.push(`${platform.padEnd(20)} ${statusLabel}  (${status.responseTime}ms)`);
      } else {
        lines.push(`${platform.padEnd(20)} ⬜ Not yet checked`);
      }
    });

    lines.push('');
    lines.push('── DATA VALIDATION ──────────────────────────────────');
    if (validationResults.length === 0) {
      lines.push('No validation data yet. Perform a search first.');
    } else {
      validationResults.forEach(v => {
        const mark = v.passed ? '✅' : '❌';
        lines.push(`${mark} ${v.check}: ${v.message}`);
      });
    }

    lines.push('');
    lines.push('── SUMMARY ──────────────────────────────────────────');
    const errors = logs.filter(l => l.type === 'error').length;
    const warnings = logs.filter(l => l.type === 'warning').length;
    const successes = logs.filter(l => l.type === 'success').length;
    const failedValidations = validationResults.filter(v => !v.passed).length;
    lines.push(`Total log entries:   ${logs.length}`);
    lines.push(`  Errors:            ${errors}`);
    lines.push(`  Warnings:          ${warnings}`);
    lines.push(`  Successes:         ${successes}`);
    lines.push(`Failed validations:  ${failedValidations}`);
    lines.push('');
    lines.push('='.repeat(60));
    lines.push('Report end — HotelCompare Audit System');

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hotel-compare-audit-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── RENDER ───────────────────────────────────────────────

  return (
    <>
      {/* Floating Audit Button */}
      <button className="audit-fab" onClick={() => setIsOpen(true)} aria-label="Open Audit Panel">
        🔍 Audit
        {errorCount > 0 && <span className="audit-error-dot" title={`${errorCount} error(s)`}></span>}
      </button>

      {/* Overlay backdrop */}
      {isOpen && (
        <div className="audit-overlay" onClick={() => setIsOpen(false)} />
      )}

      {/* Slide-in Audit Panel */}
      {isOpen && (
        <div className="audit-panel" role="dialog" aria-label="Audit Panel">
          {/* Header */}
          <div className="audit-panel-header">
            <span className="audit-panel-title">🔍 Audit & Debug Panel</span>
            <button className="audit-close-btn" onClick={() => setIsOpen(false)}>✕ Close</button>
          </div>

          {/* Tab Navigation */}
          <div className="audit-tabs">
            {[
              { id: 'logs', label: `Logs (${logs.length})` },
              { id: 'health', label: 'API Health' },
              { id: 'validation', label: `Data (${validationResults.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                className={`audit-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Panel Body */}
          <div className="audit-body">

            {/* ── TAB: ACTIVITY LOGS ── */}
            {activeTab === 'logs' && (
              <>
                {logs.length === 0 ? (
                  <div className="empty-audit">
                    No activity yet.<br />Perform a hotel search to see logs here.
                  </div>
                ) : (
                  logs.map(log => (
                    <div key={log.id} className={`log-entry ${log.type}`}>
                      <span className={`log-dot ${log.type}`}></span>
                      <span className="log-time">{log.timestamp}</span>
                      <span className="log-message">
                        {log.message}
                        {log.details && (
                          <span className="log-details">💡 Fix: {log.details}</span>
                        )}
                      </span>
                    </div>
                  ))
                )}
              </>
            )}

            {/* ── TAB: API HEALTH ── */}
            {activeTab === 'health' && (
              <div className="platform-status-list">
                {ALL_PLATFORMS.map(platform => {
                  const status = apiStatuses[platform];
                  return (
                    <div key={platform} className="platform-status-item">
                      <span className="platform-status-name">{platform}</span>
                      <div className="platform-status-right">
                        {status ? (
                          <>
                            <span className={`status-indicator ${status.status}`}>
                              {status.status === 'connected' && '✅ Connected'}
                              {status.status === 'slow' && '⚠️ Slow'}
                              {status.status === 'failed' && '❌ Failed'}
                            </span>
                            <span className="status-time">{status.responseTime}ms</span>
                          </>
                        ) : (
                          <span className="status-indicator pending">⬜ Not checked</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 8, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Legend:</strong><br />
                  ✅ Connected — responded in under 800ms<br />
                  ⚠️ Slow — responded but took over 800ms<br />
                  ❌ Failed — did not respond or returned an error<br />
                  ⬜ Not checked — no search performed yet
                </div>
              </div>
            )}

            {/* ── TAB: DATA VALIDATION ── */}
            {activeTab === 'validation' && (
              <>
                {validationResults.length === 0 ? (
                  <div className="empty-audit">
                    No validation data yet.<br />Perform a hotel search to run checks.
                  </div>
                ) : (
                  validationResults.map(v => (
                    <div key={v.id} className="validation-item">
                      <span className="validation-check">{v.passed ? '✅' : '❌'}</span>
                      <div className="validation-text">
                        <div className="validation-name">{v.check}</div>
                        <div className="validation-message">{v.message}</div>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>

          {/* Footer with Export and Clear buttons */}
          <div className="audit-footer">
            <button className="audit-export-btn" onClick={handleExport}>
              ⬇️ Download Audit Report (.txt)
            </button>
            <button className="audit-clear-btn" onClick={clearAudit} title="Clear all audit data">
              🗑 Clear
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AuditPanel;
