// ============================================================
// routes/transaction.routes.js — Định nghĩa các transaction log endpoints
// Mount vào /api/transactions trong app.js
// ============================================================

const express = require('express');
const {
  getTransactionsByEscrow,
  getAllTransactions,
} = require('../controllers/transaction.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/transactions — Toàn bộ log trong hệ thống (chỉ admin, kiểm tra trong controller)
router.get('/', protect, getAllTransactions);

// GET /api/transactions/escrow/:escrowId — Lịch sử transaction của 1 escrow
router.get('/escrow/:escrowId', protect, getTransactionsByEscrow);

module.exports = router;
