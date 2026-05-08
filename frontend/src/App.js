// ============================================================
// App.js — The main component that holds everything together
//
// Think of this as the "manager" of the whole website.
// It keeps track of all the data and tells each component
// what to show and when to show it.
// ============================================================

import React, { useState, useCallback } from 'react';
import './App.css';
import SearchForm from './components/SearchForm';
import SearchResults from './components/SearchResults';
import DiscountSection from './components/DiscountSection';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import AuditPanel from './components/AuditPanel';
import { searchHotels, searchDiscounts } from './services/api';
import { useAudit } from './context/AuditContext';

function App() {
  // ─── APPLICATION STATE ────────────────────────────────────
  const [hotel, setHotel] = useState(null);             // Hotel info (name, stars, city)
  const [results, setResults] = useState([]);            // Price results from all platforms
  const [discounts, setDiscounts] = useState([]);        // Available discounts
  const [loading, setLoading] = useState(false);         // Is a search in progress?
  const [error, setError] = useState(null);              // Error message if something went wrong
  const [hasSearched, setHasSearched] = useState(false); // Has the user performed a search?
  const [freeCancellationOnly, setFreeCancellationOnly] = useState(
    () => sessionStorage.getItem('freeCancellationOnly') === 'true' // Remember toggle during session
  );

  const audit = useAudit();

  // ─── HANDLE SEARCH ────────────────────────────────────────
  const handleSearch = useCallback(async (searchParams) => {
    setLoading(true);
    setError(null);
    setHotel(null);
    setResults([]);
    setDiscounts([]);
    setHasSearched(true);

    audit.clearAudit();
    audit.addLog('info', `New search started: "${searchParams.hotelName}" in "${searchParams.city}"`);

    try {
      // Run hotel price search and discount search simultaneously
      const [priceResponse, discountResponse] = await Promise.all([
        searchHotels(searchParams, audit),
        searchDiscounts({ hotelName: searchParams.hotelName, city: searchParams.city }, audit)
      ]);

      if (priceResponse.success) {
        setHotel(priceResponse.data.hotel);
        setResults(priceResponse.data.results || []);
      } else {
        setError(priceResponse.error || 'Search failed. Please try again.');
        audit.addLog('error', `Search failed: ${priceResponse.error}`);
      }

      if (discountResponse.success) {
        setDiscounts(discountResponse.data.discounts || []);
      }

    } catch (err) {
      const msg = err.message || 'An unexpected error occurred.';
      setError(msg);
      audit.addLog('error', `Unexpected error: ${msg}`, 'Make sure the backend server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  }, [audit]);

  // ─── HANDLE FREE CANCELLATION TOGGLE ─────────────────────
  const handleToggle = useCallback((value) => {
    setFreeCancellationOnly(value);
    sessionStorage.setItem('freeCancellationOnly', value.toString());
    audit.addLog('info', `Free Cancellation filter: ${value ? 'ON — showing only refundable rates' : 'OFF — showing all rates'}`);
  }, [audit]);

  return (
    <div className="app">
      {/* ── HEADER ── */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🏨</span>
            <div className="logo-text">
              <span className="logo-name">HotelCompare</span>
              <span className="logo-tagline">Find the best price, guaranteed</span>
            </div>
          </div>
          <div className="header-badges">
            <span className="badge-item">✓ 8 Platforms</span>
            <span className="badge-item">✓ Real-Time Prices</span>
            <span className="badge-item">✓ Free to Use</span>
          </div>
        </div>
      </header>

      {/* ── SEARCH FORM ── */}
      <main className="main">
        <SearchForm onSearch={handleSearch} loading={loading} />

        {/* ── LOADING SPINNER ── */}
        {loading && <LoadingSpinner />}

        {/* ── ERROR MESSAGE ── */}
        {!loading && error && <ErrorMessage message={error} />}

        {/* ── SEARCH RESULTS ── */}
        {!loading && !error && hasSearched && hotel && (
          <>
            <SearchResults
              hotel={hotel}
              results={results}
              freeCancellationOnly={freeCancellationOnly}
              onToggle={handleToggle}
            />
            <DiscountSection
              discounts={discounts}
              hotelName={hotel.name}
            />
          </>
        )}

        {/* ── WELCOME STATE (before first search) ── */}
        {!hasSearched && !loading && (
          <div className="welcome-section">
            <div className="welcome-card">
              <div className="welcome-icon">🔍</div>
              <h2>Compare hotel prices across 8 platforms</h2>
              <p>Enter a hotel name and city above, then click <strong>Search Prices</strong> to see all available rates sorted from cheapest to most expensive.</p>
              <div className="platform-logos">
                {['🏨 Official Site', '🔵 Booking.com', '🟠 Hotels.com', '🟡 Expedia', '🟢 Agoda', '🔴 Kayak', '🟣 Trivago', '🔷 Priceline'].map(p => (
                  <span key={p} className="platform-chip">{p}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <p>HotelCompare — Prices shown are for comparison purposes. Always verify the final price on the booking platform before completing your reservation.</p>
      </footer>

      {/* ── AUDIT PANEL (floating button in bottom-right) ── */}
      <AuditPanel />
    </div>
  );
}

export default App;
