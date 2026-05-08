// ============================================================
// SearchResults.js — The full results section after a search
//
// Shows the hotel info banner, the free cancellation toggle,
// and the list of price results sorted cheapest to most expensive.
// ============================================================

import React, { useMemo } from 'react';
import HotelCard from './HotelCard';
import FreeCancellationToggle from './FreeCancellationToggle';

function renderStars(count) {
  return '★'.repeat(count) + '☆'.repeat(5 - count);
}

function SearchResults({ hotel, results, freeCancellationOnly, onToggle }) {
  // Apply the free-cancellation filter if the toggle is on
  const displayedResults = useMemo(() => {
    if (freeCancellationOnly) {
      return results.filter(r => r.freeCancellation);
    }
    return results;
  }, [results, freeCancellationOnly]);

  const freeCancelCount = useMemo(() => results.filter(r => r.freeCancellation).length, [results]);

  return (
    <div className="results-section">
      {/* Hotel summary banner */}
      <div className="hotel-info-banner">
        <div className="hotel-info-left">
          <span className="hotel-display-name">{hotel.name}</span>
          <div className="hotel-meta">
            <span className="hotel-city">📍 {hotel.city}</span>
            <span className="hotel-stars" title={`${hotel.stars} stars`}>
              {renderStars(hotel.stars)}
            </span>
          </div>
          <span className="hotel-dates">
            {hotel.checkIn} → {hotel.checkOut} · {hotel.nights} night{hotel.nights !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="hotel-info-right">
          <div className="results-count">{results.length} platforms searched</div>
          <div className="sorted-label">↑ Sorted cheapest first</div>
        </div>
      </div>

      {/* Free Cancellation Toggle */}
      <FreeCancellationToggle
        value={freeCancellationOnly}
        onChange={onToggle}
        totalCount={results.length}
        filteredCount={freeCancelCount}
      />

      {/* Results List */}
      {displayedResults.length > 0 ? (
        <div className="results-list">
          {displayedResults.map((result, index) => (
            <HotelCard
              key={result.id}
              result={result}
              isFirst={index === 0}
            />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <p>
            {freeCancellationOnly
              ? '🔍 No results with free cancellation found for these dates. Try turning off the "Free Cancellation Only" filter to see all available rates.'
              : '🔍 No results found. Please try a different hotel name or city.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default SearchResults;
