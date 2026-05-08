// ============================================================
// SERVER.JS — The main backend server file
// This is the "engine room" of the website. It listens for
// requests from the browser and responds with hotel price data.
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const hotelRoutes = require('./routes/hotels');
const discountRoutes = require('./routes/discounts');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS: Allows the React frontend (on port 3000) to talk to this server
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Parse incoming JSON data from the frontend
app.use(express.json());

// Log every request to the console so you can see what's happening
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ─── ROUTES ───────────────────────────────────────────────
// These are the "addresses" the frontend can send requests to
app.use('/api/hotels', hotelRoutes);
app.use('/api/discounts', discountRoutes);

// Health check: Visit http://localhost:5000/api/health to confirm server is running
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Hotel Comparison Server is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Catch-all for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.url });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log('');
  console.log('🏨 ============================================');
  console.log(`🏨  Hotel Comparison Server running on port ${PORT}`);
  console.log(`🏨  Health check: http://localhost:${PORT}/api/health`);
  console.log('🏨 ============================================');
  console.log('');
});
