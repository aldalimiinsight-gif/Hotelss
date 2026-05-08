// ============================================================
// api.js — All the functions that talk to the backend server
//
// Instead of scattering API calls everywhere in the app,
// we keep them all here in one place. This makes it easy
// to update or debug when something goes wrong.
// ============================================================

import axios from 'axios';

// The base URL for our backend server
const API_BASE = '/api';

// Sets a 30-second timeout for all requests
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// ─── HOTEL SEARCH ─────────────────────────────────────────

export async function searchHotels({ hotelName, city, checkIn, checkOut }, auditCallbacks) {
  const { addLog, updateApiStatus, addValidation } = auditCallbacks;
  const startTime = Date.now();

  addLog('info', `Starting hotel search: "${hotelName}" in "${city}"`);

  try {
    const response = await api.post('/hotels/search', {
      hotelName,
      city,
      checkIn,
      checkOut
    });

    const elapsed = Date.now() - startTime;
    addLog('success', `Hotel search completed in ${elapsed}ms — ${response.data.results?.length || 0} results found`);

    // ─── VALIDATE RETURNED DATA ──────────────────────────
    const results = response.data.results || [];

    results.forEach((result, i) => {
      // Check price is a valid positive number
      const priceValid = typeof result.pricePerNight === 'number' && result.pricePerNight > 0;
      addValidation(
        `Price validation: ${result.platform}`,
        priceValid,
        priceValid
          ? `$${result.pricePerNight}/night — valid price`
          : `Price is ${result.pricePerNight} — invalid! Expected a positive number`
      );

      // Check total price
      const totalValid = typeof result.totalPrice === 'number' && result.totalPrice > 0;
      addValidation(
        `Total price: ${result.platform}`,
        totalValid,
        totalValid
          ? `$${result.totalPrice} total — valid`
          : `Total price ${result.totalPrice} is invalid`
      );

      // Check Book Now URL
      const urlValid = result.bookUrl && result.bookUrl.startsWith('https://');
      addValidation(
        `Book URL: ${result.platform}`,
        urlValid,
        urlValid
          ? `URL is valid: ${result.bookUrl.substring(0, 50)}...`
          : `Book Now URL is missing or invalid for ${result.platform}`
      );

      // Update platform health status
      const status = result.responseTime > 800 ? 'slow' : 'connected';
      updateApiStatus(result.platform, result.status === 'success' ? status : 'failed', result.responseTime);
    });

    return { success: true, data: response.data };

  } catch (error) {
    const elapsed = Date.now() - startTime;
    const errMsg = error.response?.data?.error || error.message || 'Unknown error';

    addLog('error', `Hotel search failed after ${elapsed}ms: ${errMsg}`, getSuggestion('search', errMsg));

    return {
      success: false,
      error: errMsg
    };
  }
}

// ─── DISCOUNT SEARCH ──────────────────────────────────────

export async function searchDiscounts({ hotelName, city }, auditCallbacks) {
  const { addLog } = auditCallbacks;
  const startTime = Date.now();

  addLog('info', `Scanning for discounts: "${hotelName}" in "${city}"`);

  try {
    const response = await api.post('/discounts/search', { hotelName, city });
    const elapsed = Date.now() - startTime;

    const count = response.data.discounts?.length || 0;
    addLog('success', `Discount scan completed in ${elapsed}ms — ${count} discount${count !== 1 ? 's' : ''} found`);

    return { success: true, data: response.data };

  } catch (error) {
    const elapsed = Date.now() - startTime;
    const errMsg = error.response?.data?.error || error.message || 'Unknown error';

    addLog('error', `Discount search failed after ${elapsed}ms: ${errMsg}`);

    return { success: false, error: errMsg };
  }
}

// ─── SELF-FIX SUGGESTIONS ────────────────────────────────
// Gives plain-English advice for common errors

function getSuggestion(type, errorMessage) {
  const msg = (errorMessage || '').toLowerCase();

  if (msg.includes('network') || msg.includes('econnrefused') || msg.includes('failed to fetch')) {
    return 'The backend server is not running. Open a new terminal, go to the backend folder, and run: npm start';
  }
  if (msg.includes('timeout')) {
    return 'The request took too long. Check your internet connection, or the backend server may be overloaded.';
  }
  if (msg.includes('404')) {
    return 'The API endpoint was not found. Make sure the backend server is running on port 5000.';
  }
  if (msg.includes('401') || msg.includes('unauthorized')) {
    return 'An API key is missing or invalid. Check your .env file in the backend folder.';
  }
  if (msg.includes('500')) {
    return 'The backend server had an error. Check the terminal where the server is running for error details.';
  }
  if (msg.includes('cors')) {
    return 'CORS error: The frontend cannot reach the backend. Make sure both are running on their correct ports (3000 and 5000).';
  }

  return 'Try refreshing the page and searching again. If the problem continues, check that both the frontend and backend servers are running.';
}
