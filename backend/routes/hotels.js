// ============================================================
// routes/hotels.js — Handles hotel search requests
// When the frontend sends a search, this file processes it
// and returns price results from multiple platforms.
// ============================================================

const express = require('express');
const router = express.Router();
const { searchHotelPrices } = require('../services/hotelDataService');

// POST /api/hotels/search
// The frontend sends: { hotelName, city, checkIn, checkOut }
// This route returns: { success, hotel, results }
router.post('/search', async (req, res) => {
  const startTime = Date.now();

  try {
    const { hotelName, city, checkIn, checkOut } = req.body;

    // ─── INPUT VALIDATION ─────────────────────────────────
    if (!hotelName || hotelName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a hotel name (at least 2 characters)'
      });
    }

    if (!city || city.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a city or location'
      });
    }

    if (!checkIn) {
      return res.status(400).json({
        success: false,
        error: 'Please select a check-in date'
      });
    }

    if (!checkOut) {
      return res.status(400).json({
        success: false,
        error: 'Please select a check-out date'
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        error: 'Check-out date must be after check-in date'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkInDate < today) {
      return res.status(400).json({
        success: false,
        error: 'Check-in date cannot be in the past'
      });
    }

    // ─── SEARCH FOR PRICES ────────────────────────────────
    console.log(`Searching prices for: "${hotelName}" in "${city}" | ${checkIn} → ${checkOut}`);

    const { hotel, results } = await searchHotelPrices(
      hotelName.trim(),
      city.trim(),
      checkIn,
      checkOut
    );

    const processingTime = Date.now() - startTime;
    console.log(`Search completed in ${processingTime}ms — ${results.length} results found`);

    res.json({
      success: true,
      hotel,
      results,
      meta: {
        searchedAt: new Date().toISOString(),
        processingTimeMs: processingTime,
        resultCount: results.length
      }
    });

  } catch (error) {
    console.error('Hotel search error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Something went wrong while searching. Please try again.',
      details: error.message
    });
  }
});

// GET /api/hotels/platforms — Returns list of all supported platforms
router.get('/platforms', (req, res) => {
  res.json({
    success: true,
    platforms: [
      { name: 'Official Website', icon: '🏨', status: 'active' },
      { name: 'Booking.com', icon: '🔵', status: 'active' },
      { name: 'Hotels.com', icon: '🟠', status: 'active' },
      { name: 'Expedia', icon: '🟡', status: 'active' },
      { name: 'Agoda', icon: '🟢', status: 'active' },
      { name: 'Kayak', icon: '🔴', status: 'active' },
      { name: 'Trivago', icon: '🟣', status: 'active' },
      { name: 'Priceline', icon: '🔷', status: 'active' }
    ]
  });
});

module.exports = router;
