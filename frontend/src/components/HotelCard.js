// ============================================================
// HotelCard.js — A single price result card
//
// Shows one platform's price, the free/non-refundable badge,
// and a "Book Now" button that opens the booking page.
// ============================================================

import React from 'react';

function HotelCard({ result, isFirst }) {
  const {
    platform,
    platformIcon,
    platformDescription,
    pricePerNight,
    totalPrice,
    currency,
    nights,
    freeCancellation,
    cancellationDeadline,
    bookUrl,
    trustBadge,
    responseTime
  } = result;

  return (
    <div className={`hotel-card ${isFirst ? 'cheapest' : ''}`}>
      {isFirst && <span className="cheapest-badge">🏆 Best Price</span>}

      <div className="card-left">
        {/* Platform identity */}
        <div className="platform-badge">
          <span className="platform-icon">{platformIcon}</span>
          <span className="platform-name">{platform}</span>
          <span className="platform-trust">✓ Verified</span>
        </div>

        {/* Price and badges */}
        <div className="card-details">
          <div className="card-price-row">
            <span className="price-per-night">
              {currency === 'USD' ? '$' : currency}{pricePerNight.toFixed(2)}
            </span>
            <span className="price-label">/ night</span>
            <span className="price-total">
              Total: ${totalPrice.toFixed(2)} for {nights} night{nights !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="card-badges">
            {/* Free cancellation or non-refundable badge */}
            {freeCancellation ? (
              <span className="badge free-cancel">✓ Free Cancellation</span>
            ) : (
              <span className="badge non-refundable">✗ Non-Refundable</span>
            )}
            <span className="badge verified">🛡️ Verified Source</span>
          </div>

          {freeCancellation && cancellationDeadline && (
            <span className="cancel-deadline">
              Free cancellation until: {cancellationDeadline}
            </span>
          )}

          <span className="response-time">Response: {responseTime}ms</span>
        </div>
      </div>

      {/* Book Now button */}
      <a
        href={bookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="book-btn"
        title={`Book at ${platform} — opens in new tab`}
      >
        Book Now →
      </a>
    </div>
  );
}

export default HotelCard;
