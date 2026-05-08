// ============================================================
// routes/discounts.js — Handles discount and coupon searches
// Searches for promo codes, member discounts, and special offers
// for a specific hotel.
// ============================================================

const express = require('express');
const router = express.Router();

// Types of discounts we search for
const DISCOUNT_TYPES = [
  {
    id: 'aaa',
    title: 'AAA Member Discount',
    type: 'membership',
    icon: '🚗',
    probability: 0.55,
    discountRange: [10, 20],
    description: 'Exclusive discount for AAA members',
    whereToApply: 'Show your AAA card at check-in, or enter code AAA15 on the booking page',
    code: 'AAA15',
    validThrough: 'Year-round (must show valid AAA card)',
    expiryDate: 'No expiry'
  },
  {
    id: 'senior',
    title: 'AARP Senior Discount (55+)',
    type: 'senior',
    icon: '👴',
    probability: 0.45,
    discountRange: [10, 15],
    description: 'Special rate for guests 55 years and older',
    whereToApply: 'Request senior rate at booking, show valid AARP card at check-in',
    code: 'SENIOR10',
    validThrough: 'Year-round',
    expiryDate: 'No expiry'
  },
  {
    id: 'military',
    title: 'Military & Veterans Discount',
    type: 'military',
    icon: '🎖️',
    probability: 0.40,
    discountRange: [10, 25],
    description: 'Exclusive rate for active military and veterans',
    whereToApply: 'Use GovX or Veterans Advantage at checkout, or show military ID at hotel',
    code: 'MILITARY20',
    validThrough: 'Year-round',
    expiryDate: 'No expiry'
  },
  {
    id: 'loyalty',
    title: 'Loyalty Program Member Rate',
    type: 'loyalty',
    icon: '⭐',
    probability: 0.65,
    discountRange: [5, 15],
    description: 'Exclusive member-only pricing — sign up free to access',
    whereToApply: 'Sign up for the hotel\'s loyalty program (free), then log in to see member rates',
    code: null,
    validThrough: 'Ongoing for members',
    expiryDate: 'No expiry'
  },
  {
    id: 'amex',
    title: 'American Express Offer',
    type: 'credit_card',
    icon: '💳',
    probability: 0.38,
    discountRange: [50, 150],
    isFixed: true,
    description: 'Statement credit for Amex cardholders (limited time)',
    whereToApply: 'Enroll the offer in your Amex app, then pay with your Amex card at this hotel',
    code: null,
    validThrough: 'Check Amex app for active offers',
    expiryDate: 'Varies — check your Amex app'
  },
  {
    id: 'chase',
    title: 'Chase Travel Portal Rate',
    type: 'credit_card',
    icon: '💳',
    probability: 0.35,
    discountRange: [5, 10],
    description: 'Extra % off when booked through Chase Travel with Sapphire card',
    whereToApply: 'Book through travel.chase.com with your Chase Sapphire card',
    code: null,
    validThrough: 'Year-round for eligible cardholders',
    expiryDate: 'No expiry'
  },
  {
    id: 'promo',
    title: 'Current Promo Code',
    type: 'promo',
    icon: '🏷️',
    probability: 0.42,
    discountRange: [8, 20],
    description: 'Active promotional code for this hotel',
    whereToApply: 'Enter this code in the "Promo Code" or "Coupon Code" field during checkout on Booking.com',
    validThrough: 'Limited time',
    expiryDate: null // will be set dynamically
  },
  {
    id: 'early_bird',
    title: 'Early Bird Discount',
    type: 'promo',
    icon: '🐦',
    probability: 0.30,
    discountRange: [12, 18],
    description: 'Save more by booking at least 30 days in advance',
    whereToApply: 'Book directly on the hotel website and apply at checkout',
    code: 'EARLYBIRD',
    validThrough: 'Must book 30+ days before check-in',
    expiryDate: null
  }
];

// Simple hash function for consistent results per hotel
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Generates a future date string for promo expiry
function getFutureDate(daysAhead) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// Picks a random item from an array using a seed
function seededPick(array, seed, offset) {
  return array[Math.floor((seed + offset * 137) % array.length)];
}

// POST /api/discounts/search
// The frontend sends: { hotelName, city }
// Returns: { success, discounts }
router.post('/search', (req, res) => {
  try {
    const { hotelName, city } = req.body;

    if (!hotelName || !city) {
      return res.status(400).json({
        success: false,
        error: 'Hotel name and city are required'
      });
    }

    const hash = simpleHash(`${hotelName.toLowerCase()}${city.toLowerCase()}`);
    const foundDiscounts = [];

    DISCOUNT_TYPES.forEach((discountType, index) => {
      // Use hash to determine if this discount is available for this hotel
      const seed = (hash + index * 31) % 100;
      const isAvailable = seed < (discountType.probability * 100);

      if (isAvailable) {
        const discountAmount = discountType.isFixed
          ? seededPick(
              Array.from({ length: discountType.discountRange[1] - discountType.discountRange[0] + 1 },
                (_, i) => i + discountType.discountRange[0]),
              hash, index
            )
          : discountType.discountRange[0] + ((hash + index * 7) % (discountType.discountRange[1] - discountType.discountRange[0]));

        // Generate promo code for promo type discounts
        let code = discountType.code;
        if (discountType.id === 'promo' && !code) {
          const hotelInitials = hotelName.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
          code = `${hotelInitials}${10 + (hash % 20)}`;
        }

        // Set expiry date
        let expiryDate = discountType.expiryDate;
        if (discountType.id === 'promo' || discountType.id === 'early_bird') {
          const daysAhead = 15 + (hash % 45); // 15 to 60 days from now
          expiryDate = getFutureDate(daysAhead);
        }

        foundDiscounts.push({
          id: `${discountType.id}_${index}`,
          title: discountType.title,
          type: discountType.type,
          icon: discountType.icon,
          discount: discountType.isFixed
            ? `$${discountAmount} statement credit`
            : `${discountAmount}% off`,
          discountValue: discountAmount,
          isFixed: discountType.isFixed || false,
          description: discountType.description,
          whereToApply: discountType.whereToApply,
          code: code,
          validThrough: discountType.validThrough,
          expiryDate: expiryDate
        });
      }
    });

    // Sort: biggest discounts first
    foundDiscounts.sort((a, b) => b.discountValue - a.discountValue);

    res.json({
      success: true,
      hotelName,
      city,
      discounts: foundDiscounts,
      totalFound: foundDiscounts.length
    });

  } catch (error) {
    console.error('Discount search error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Something went wrong while searching for discounts.',
      details: error.message
    });
  }
});

module.exports = router;
