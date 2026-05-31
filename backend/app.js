// ============================================================
// app.js — Cấu hình Express application
// ============================================================

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

// Import routes
const authRoutes        = require('./routes/auth.routes');
const escrowRoutes      = require('./routes/escrow.routes');
const transactionRoutes = require('./routes/transaction.routes'); // ← Backend 3

// Import error handler
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

// ==================== GLOBAL MIDDLEWARE ====================
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ==================== ROUTES ====================
app.use('/api/auth',         authRoutes);
app.use('/api/escrows',      escrowRoutes);
app.use('/api/transactions', transactionRoutes); // ← Backend 3

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== ERROR HANDLER ====================
app.use(errorMiddleware);

module.exports = app;
