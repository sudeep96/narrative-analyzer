require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const analyzeRoutes = require('./routes/analyze');
const reportRoutes = require('./routes/reports');

const app = express();

// Fix 1 — trust proxy (fixes rate limiter X-Forwarded-For error)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Fix 2 — increase body size limit (fixes PayloadTooLarge error)
app.use(express.json({ limit: '10mb' }));

// Rate limiters
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests. Please wait before analyzing again.' }
});
app.use('/api/', limiter);

const analysisLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Analysis rate limit reached. Please wait 1 minute.' }
});
app.use('/api/analyze', analysisLimiter);

// Routes
app.use('/api/analyze', analyzeRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// DB + server start
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/narrative-analyzer')
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.warn('MongoDB connection failed (non-fatal):', err.message);
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (no DB)`));
  });