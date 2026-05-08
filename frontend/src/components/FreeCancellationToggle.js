// ============================================================
// FreeCancellationToggle.js — The green/grey toggle switch
//
// When turned ON: only shows hotels with free cancellation.
// When turned OFF: shows all hotels including non-refundable.
// The setting is saved during your browsing session.
// ============================================================

import React from 'react';

function FreeCancellationToggle({ value, onChange, totalCount, filteredCount }) {
  return (
    <div className="toggle-bar">
      <div className="toggle-label">
        <label className="toggle-switch" htmlFor="freeCancelToggle">
          <input
            id="freeCancelToggle"
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
        <div>
          <div className="toggle-label-text">Free Cancellation Only</div>
          <div className="toggle-description">
            {value
              ? `Showing ${filteredCount} of ${totalCount} results with free cancellation`
              : 'Showing all rates — including non-refundable'}
          </div>
        </div>
      </div>
      <span className={`toggle-status ${value ? 'on' : 'off'}`}>
        {value ? '✓ Active' : 'Off'}
      </span>
    </div>
  );
}

export default FreeCancellationToggle;
