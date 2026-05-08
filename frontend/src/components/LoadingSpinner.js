// ============================================================
// LoadingSpinner.js — The animated spinner shown during searches
//
// Shown while the backend is fetching prices from all platforms.
// The platform names pulse to show which platforms are being checked.
// ============================================================

import React from 'react';

const PLATFORMS = ['🏨 Official', '🔵 Booking.com', '🟠 Hotels.com', '🟡 Expedia', '🟢 Agoda', '🔴 Kayak', '🟣 Trivago', '🔷 Priceline'];

function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-text">Searching prices across all platforms…</p>
      <div className="loading-platforms">
        {PLATFORMS.map((p) => (
          <span key={p} className="loading-platform">{p}</span>
        ))}
      </div>
    </div>
  );
}

export default LoadingSpinner;
