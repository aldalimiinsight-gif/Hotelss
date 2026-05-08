// ============================================================
// SearchForm.js — The search box at the top of the page
//
// This component shows the 4 input fields (hotel name, city,
// check-in date, check-out date) and the Search button.
// It validates the inputs before sending the search request.
// ============================================================

import React, { useState } from 'react';

function SearchForm({ onSearch, loading }) {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    hotelName: '',
    city: '',
    checkIn: today,
    checkOut: tomorrow
  });

  const [errors, setErrors] = useState({});

  // Updates a single field when the user types
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Validates all fields before submitting
  const validate = () => {
    const newErrors = {};

    if (!formData.hotelName.trim()) {
      newErrors.hotelName = 'Please enter a hotel name';
    } else if (formData.hotelName.trim().length < 2) {
      newErrors.hotelName = 'Hotel name must be at least 2 characters';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Please enter a city or location';
    }

    if (!formData.checkIn) {
      newErrors.checkIn = 'Please select a check-in date';
    }

    if (!formData.checkOut) {
      newErrors.checkOut = 'Please select a check-out date';
    }

    if (formData.checkIn && formData.checkOut) {
      if (new Date(formData.checkOut) <= new Date(formData.checkIn)) {
        newErrors.checkOut = 'Check-out must be after check-in';
      }
    }

    if (formData.checkIn && new Date(formData.checkIn) < new Date(today)) {
      newErrors.checkIn = 'Check-in cannot be in the past';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    onSearch(formData);
  };

  return (
    <div className="search-form-section">
      <div className="search-form-inner">
        <p className="search-form-title">🔍 Search and compare hotel prices across 8 booking platforms</p>
        <form className="search-form" onSubmit={handleSubmit} noValidate>

          {/* Hotel Name Field */}
          <div className="form-group">
            <label htmlFor="hotelName">Hotel Name</label>
            <input
              id="hotelName"
              type="text"
              placeholder="e.g. Marriott Times Square"
              value={formData.hotelName}
              onChange={handleChange('hotelName')}
              className={errors.hotelName ? 'error' : ''}
              disabled={loading}
              autoComplete="off"
            />
            {errors.hotelName && <span className="field-error">{errors.hotelName}</span>}
          </div>

          {/* City Field */}
          <div className="form-group">
            <label htmlFor="city">City / Location</label>
            <input
              id="city"
              type="text"
              placeholder="e.g. New York"
              value={formData.city}
              onChange={handleChange('city')}
              className={errors.city ? 'error' : ''}
              disabled={loading}
              autoComplete="off"
            />
            {errors.city && <span className="field-error">{errors.city}</span>}
          </div>

          {/* Check-In Date */}
          <div className="form-group">
            <label htmlFor="checkIn">Check-In Date</label>
            <input
              id="checkIn"
              type="date"
              value={formData.checkIn}
              min={today}
              onChange={handleChange('checkIn')}
              className={errors.checkIn ? 'error' : ''}
              disabled={loading}
            />
            {errors.checkIn && <span className="field-error">{errors.checkIn}</span>}
          </div>

          {/* Check-Out Date */}
          <div className="form-group">
            <label htmlFor="checkOut">Check-Out Date</label>
            <input
              id="checkOut"
              type="date"
              value={formData.checkOut}
              min={formData.checkIn || today}
              onChange={handleChange('checkOut')}
              className={errors.checkOut ? 'error' : ''}
              disabled={loading}
            />
            {errors.checkOut && <span className="field-error">{errors.checkOut}</span>}
          </div>

          {/* Search Button */}
          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? (
              <>
                <span style={{ width: 16, height: 16, border: '2px solid rgba(26,43,74,0.3)', borderTopColor: 'var(--navy-dark)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.9s linear infinite' }}></span>
                Searching…
              </>
            ) : (
              <>🔍 Search Prices</>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}

export default SearchForm;
