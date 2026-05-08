// ============================================================
// DiscountSection.js — The "Available Discounts" panel
//
// Shows all found discounts (AAA, senior, military, credit cards,
// loyalty programs, promo codes). If nothing is found, shows a
// clear "No discounts found" message instead of a blank space.
// ============================================================

import React from 'react';

function DiscountCard({ discount }) {
  return (
    <div className="discount-card">
      <div className="discount-card-header">
        <span className="discount-icon">{discount.icon}</span>
        <span className="discount-title">{discount.title}</span>
      </div>

      <div className="discount-amount">{discount.discount}</div>

      <p className="discount-description">{discount.description}</p>

      <div className="discount-where">
        <div className="discount-where-label">📌 How to use it:</div>
        {discount.whereToApply}
      </div>

      {discount.code && (
        <div className="discount-code-row">
          <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>Promo code:</span>
          <span className="discount-code">{discount.code}</span>
        </div>
      )}

      <div className="discount-expiry">
        {discount.validThrough && (
          <span>🗓 Valid: {discount.validThrough}</span>
        )}
        {discount.expiryDate && discount.expiryDate !== 'No expiry' && (
          <span style={{ marginLeft: 12 }}>⏰ Expires: {discount.expiryDate}</span>
        )}
        {discount.expiryDate === 'No expiry' && (
          <span style={{ marginLeft: 12 }}>✓ No expiry date</span>
        )}
      </div>
    </div>
  );
}

function DiscountSection({ discounts, hotelName }) {
  return (
    <div className="discount-section">
      <div className="discount-header">
        <span className="discount-header-icon">🏷️</span>
        <h2>Available Discounts & Promo Codes</h2>
        {discounts.length > 0 && (
          <span className="discount-count">{discounts.length} found</span>
        )}
      </div>

      {discounts.length === 0 ? (
        <div className="no-discounts">
          <div className="no-discounts-icon">🔍</div>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>No discounts found for {hotelName}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>
            We checked for AAA, senior, military, loyalty program, and credit card discounts.
            Try visiting the hotel's official website directly for any unpublished deals.
          </p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 16 }}>
            We found {discounts.length} potential discount{discounts.length !== 1 ? 's' : ''} for {hotelName}.
            Always verify eligibility before booking.
          </p>
          <div className="discount-grid">
            {discounts.map(discount => (
              <DiscountCard key={discount.id} discount={discount} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default DiscountSection;
