// ============================================================
// routes/transaction.routes.js — Transaction endpoints
// ============================================================

const express = require('express');
const {
  getTransactionsByEscrow,
  getAllTransactions,
  syncEscrowFromChain,
  manualRelease,
  manualRefund,
} = require('../controllers/transaction.controller');
const { protect }   = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

// Tất cả routes cần đăng nhập
router.use(protect);

// GET /api/transactions — Admin xem tất cả logs
router.get('/', authorize('admin'), getAllTransactions);

// GET /api/transactions/escrow/:escrowId — Buyer/Seller xem log của escrow mình
router.get('/escrow/:escrowId', getTransactionsByEscrow);

// POST /api/transactions/sync/:escrowId — Admin sync từ blockchain
router.post('/sync/:escrowId', authorize('admin'), syncEscrowFromChain);

// POST /api/transactions/release/:escrowId — Admin release thủ công
router.post('/release/:escrowId', authorize('admin'), manualRelease);

// POST /api/transactions/refund/:escrowId — Admin refund thủ công
router.post('/refund/:escrowId', authorize('admin'), manualRefund);

module.exports = router;
