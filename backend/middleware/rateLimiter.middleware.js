// ============================================================
// middleware/rateLimiter.middleware.js — Giới hạn số request
// ============================================================

const rateLimit = require('express-rate-limit');

/**
 * Global: áp dụng cho toàn bộ /api/*
 * Limit thoải mái để không block người dùng hợp lệ.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});

/**
 * Auth: login + register — strict để ngăn brute force / credential stuffing.
 * skipSuccessfulRequests: chỉ đếm request thất bại (4xx, 5xx).
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: 'Too many login attempts. Please try again in 15 minutes.',
  },
});

/**
 * Faucet: mint test tokens — rất strict vì mỗi call tốn gas của admin wallet.
 */
const faucetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Faucet limit reached. You can request test tokens at most 5 times per hour.',
  },
});

module.exports = { globalLimiter, authLimiter, faucetLimiter };
