// ============================================================
// hotelDataService.js — The "brain" that generates hotel price data
//
// IMPORTANT NOTE FOR BEGINNERS:
// Real hotel APIs (Booking.com, Expedia, etc.) require paid
// partnership agreements and API keys. This file shows you
// EXACTLY where to plug in real API calls once you have those keys.
// Until then, it returns realistic demo data so you can see
// the full website working.
// ============================================================

const axios = require('axios');

// ─── CITY PRICE TIERS ────────────────────────────────────────
// Major cities cost more per night on average
const TIER_1_CITIES = [
  'new york', 'nyc', 'los angeles', 'la', 'chicago', 'san francisco', 'sf',
  'london', 'paris', 'tokyo', 'dubai', 'sydney', 'hong kong', 'singapore',
  'las vegas', 'miami', 'boston', 'seattle'
];
const TIER_2_CITIES = [
  'denver', 'atlanta', 'rome', 'amsterdam', 'berlin', 'barcelona', 'madrid',
  'toronto', 'vancouver', 'montreal', 'orlando', 'nashville', 'austin',
  'portland', 'san diego', 'phoenix', 'dallas', 'houston', 'philadelphia'
];

// ─── PLATFORM CONFIGURATION ──────────────────────────────────
// Each booking platform has its own price multiplier and characteristics
const PLATFORMS = [
  {
    name: 'Official Website',
    icon: '🏨',
    multiplier: 0.94,
    freeCancellationRate: 0.75,
    description: 'Book directly with the hotel'
  },
  {
    name: 'Booking.com',
    icon: '🔵',
    multiplier: 1.05,
    freeCancellationRate: 0.80,
    description: 'World\'s leading accommodation platform'
  },
  {
    name: 'Hotels.com',
    icon: '🟠',
    multiplier: 1.08,
    freeCancellationRate: 0.70,
    description: 'Earn free nights with Hotels.com rewards'
  },
  {
    name: 'Expedia',
    icon: '🟡',
    multiplier: 1.10,
    freeCancellationRate: 0.65,
    description: 'Bundle hotel with flights for savings'
  },
  {
    name: 'Agoda',
    icon: '🟢',
    multiplier: 0.97,
    freeCancellationRate: 0.60,
    description: 'Great deals across Asia and worldwide'
  },
  {
    name: 'Kayak',
    icon: '🔴',
    multiplier: 1.02,
    freeCancellationRate: 0.72,
    description: 'Search hundreds of travel sites at once'
  },
  {
    name: 'Trivago',
    icon: '🟣',
    multiplier: 1.00,
    freeCancellationRate: 0.68,
    description: 'Compare hotel prices from top sites'
  },
  {
    name: 'Priceline',
    icon: '🔷',
    multiplier: 0.96,
    freeCancellationRate: 0.55,
    description: 'Name your own price deals'
  }
];

// ─── HELPER FUNCTIONS ────────────────────────────────────────

// Generates a consistent number from a string (so the same hotel always gets similar prices)
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Detects how many stars a hotel likely has based on its name
function detectStarRating(hotelName) {
  const name = hotelName.toLowerCase();
  if (/ritz|four seasons|st\. regis|park hyatt|mandarin oriental|peninsula|aman|waldorf/.test(name)) return 5;
  if (/marriott|hilton|hyatt|westin|sheraton|doubletree|intercontinental|sofitel|fairmont/.test(name)) return 4;
  if (/hampton inn|holiday inn express|comfort inn|best western|courtyard|residence inn/.test(name)) return 3;
  if (/motel|budget|economy|super 8|days inn/.test(name)) return 2;
  return 3; // Default 3 stars
}

// Calculate base price per night based on city and hotel stars
function calculateBasePrice(city, stars) {
  const cityLower = city.toLowerCase();
  let base = 100;

  if (TIER_1_CITIES.some(c => cityLower.includes(c))) {
    base = 200;
  } else if (TIER_2_CITIES.some(c => cityLower.includes(c))) {
    base = 140;
  }

  // Star rating premium
  const starBonus = { 2: -30, 3: 0, 4: 60, 5: 180 };
  base += starBonus[stars] || 0;

  return base;
}

// Calculates number of nights between two dates
function calculateNights(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffMs = end - start;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

// Formats a date as "Jan 15, 2024"
function formatDateFriendly(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Generates a real Book Now URL for each platform
function generateBookUrl(platform, hotelName, city, checkIn, checkOut) {
  const encodedHotel = encodeURIComponent(hotelName);
  const encodedCity = encodeURIComponent(city);
  const query = encodeURIComponent(`${hotelName} ${city}`);
  const ci = checkIn; // YYYY-MM-DD format
  const co = checkOut;

  const urls = {
    'Booking.com': `https://www.booking.com/searchresults.html?ss=${query}&checkin=${ci}&checkout=${co}&no_rooms=1&group_adults=1`,
    'Hotels.com': `https://www.hotels.com/search.do?q=${query}&datein=${ci}&dateout=${co}&adults=1`,
    'Expedia': `https://www.expedia.com/Hotel-Search?destination=${query}&startDate=${ci}&endDate=${co}&adults=1`,
    'Agoda': `https://www.agoda.com/search?q=${query}&checkIn=${ci}&los=1&adults=1`,
    'Kayak': `https://www.kayak.com/hotels/${encodeURIComponent(city)}/${ci}/${co}/1adults`,
    'Trivago': `https://www.trivago.com/?aDate=${ci}&bDate=${co}&iPathId=1&sCriteria=${query}`,
    'Official Website': `https://www.google.com/search?q=${query}+official+website+book+direct`,
    'Priceline': `https://www.priceline.com/relax/at/${encodedCity}/from/${ci.replace(/-/g, '')}/to/${co.replace(/-/g, '')}/rooms/1`
  };

  return urls[platform] || `https://www.google.com/search?q=${query}+hotel+booking`;
}

// ─── MAIN SEARCH FUNCTION ─────────────────────────────────────

async function searchHotelPrices(hotelName, city, checkIn, checkOut) {
  const hash = simpleHash(`${hotelName}${city}`);
  const stars = detectStarRating(hotelName);
  const basePrice = calculateBasePrice(city, stars);
  const nights = calculateNights(checkIn, checkOut);

  // Small price variation based on hotel name hash (makes prices feel real)
  const variation = (hash % 40) - 20; // ±$20
  const adjustedBase = basePrice + variation;

  const results = [];

  for (let i = 0; i < PLATFORMS.length; i++) {
    const platform = PLATFORMS[i];

    // ─── REAL API INTEGRATION POINT ───────────────────────────
    // When you have real API keys, replace this block with actual API calls.
    // Example for Booking.com (once you have your API key):
    //
    // try {
    //   const response = await axios.get('https://distribution-xml.booking.com/2.0/json/hotels', {
    //     headers: { 'Authorization': `Basic ${process.env.BOOKING_API_KEY}` },
    //     params: { city_ids: city, checkin: checkIn, checkout: checkOut, hotel_ids: hotelName }
    //   });
    //   const realPrice = response.data.result[0].price_breakdown.gross_price;
    //   // Use realPrice instead of mockPrice below
    // } catch (err) {
    //   console.error(`Booking.com API error: ${err.message}`);
    // }
    // ──────────────────────────────────────────────────────────

    // Simulate network response time (200ms to 1200ms)
    const responseTime = 200 + (hash * (i + 1)) % 1000;

    // Calculate mock price with platform multiplier
    const priceVariance = ((hash * (i + 3)) % 30) - 15; // ±$15 per platform
    const pricePerNight = Math.round((adjustedBase * platform.multiplier + priceVariance) * 100) / 100;
    const totalPrice = Math.round(pricePerNight * nights * 100) / 100;

    // Determine if this result has free cancellation
    const freeCancellationSeed = (hash + i * 17) % 100;
    const freeCancellation = freeCancellationSeed < (platform.freeCancellationRate * 100);

    // Cancellation deadline: 2 days before check-in
    const cancellationDate = new Date(checkIn);
    cancellationDate.setDate(cancellationDate.getDate() - 2);

    results.push({
      id: `${platform.name.replace(/\s/g, '_')}_${i}`,
      platform: platform.name,
      platformIcon: platform.icon,
      platformDescription: platform.description,
      pricePerNight: pricePerNight,
      totalPrice: totalPrice,
      currency: 'USD',
      nights: nights,
      freeCancellation: freeCancellation,
      cancellationDeadline: freeCancellation ? formatDateFriendly(cancellationDate.toISOString().split('T')[0]) : null,
      bookUrl: generateBookUrl(platform.name, hotelName, city, checkIn, checkOut),
      trustBadge: 'verified',
      responseTime: responseTime,
      status: 'success'
    });
  }

  // Sort by price per night (cheapest first)
  results.sort((a, b) => a.pricePerNight - b.pricePerNight);

  // Build the hotel info object
  const hotelInfo = {
    name: buildHotelDisplayName(hotelName, city),
    searchedName: hotelName,
    city: city,
    stars: stars,
    checkIn: formatDateFriendly(checkIn),
    checkOut: formatDateFriendly(checkOut),
    nights: nights
  };

  return { hotel: hotelInfo, results };
}

// Makes the hotel name look nicer for display
function buildHotelDisplayName(hotelName, city) {
  const name = hotelName.trim();
  const cityWord = city.split(',')[0].trim();
  // If the hotel name already contains the city, don't add it again
  if (name.toLowerCase().includes(cityWord.toLowerCase())) {
    return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }
  return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

module.exports = { searchHotelPrices };
