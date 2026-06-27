// ============================================================
// routes/dispute.routes.js — Định nghĩa các dispute endpoints
// Mount vào /api/disputes trong app.js
// ============================================================

const express = require('express');
const {
  createDispute,
  attachRaiseTx,
  getDisputes,
  getDisputeById,
  resolveDispute,
  recordVote,
  finalizeDispute,
} = require('../controllers/dispute.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

// POST /api/disputes — Client/Freelancer tạo dispute record (kiểm tra quyền trong controller)
router.post('/', protect, createDispute);

// GET /api/disputes — Xem danh sách (admin xem tất cả, user thường chỉ xem dispute liên quan đến mình)
router.get('/', protect, getDisputes);

// GET /api/disputes/:id — Xem chi tiết (kiểm tra quyền trong controller)
router.get('/:id', protect, getDisputeById);

// PATCH /api/disputes/:id/raise-tx — Gắn txHash sau khi raiseDispute on-chain confirm
router.patch('/:id/raise-tx', protect, attachRaiseTx);

// PATCH /api/disputes/:id/resolve — Admin trigger finalizeDispute() on-chain (contract v2: reviewer voting)
router.patch('/:id/resolve', protect, authorize('admin'), resolveDispute);

// POST /api/disputes/:id/vote — Reviewer ghi nhận phiếu bầu (sau khi đã ký on-chain qua MetaMask)
router.post('/:id/vote', protect, authorize('reviewer'), recordVote);

// POST /api/disputes/:id/finalize — Trigger finalizeDispute on-chain (sau đủ phiếu / hết 3 ngày)
router.post('/:id/finalize', protect, finalizeDispute);

module.exports = router;
