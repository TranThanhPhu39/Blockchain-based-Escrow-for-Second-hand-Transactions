// ============================================================
// routes/dispute.routes.js — Định nghĩa các dispute endpoints
// Mount vào /api/disputes trong app.js
// ============================================================

const express = require('express');
const {
  createDispute,
  attachRaiseTx,
  submitDefense,
  getDisputes,
  getDisputeById,
  resolveDispute,
  recordVote,
  finalizeDispute,
} = require('../controllers/dispute.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { createDisputeRules, validateRequest } = require('../middleware/validators');

const router = express.Router();

// POST /api/disputes — Client/Freelancer tạo dispute record (kiểm tra quyền trong controller)
router.post('/', protect, createDisputeRules, validateRequest, createDispute);

// GET /api/disputes — Xem danh sách (admin xem tất cả, user thường chỉ xem dispute liên quan đến mình)
router.get('/', protect, getDisputes);

// GET /api/disputes/:id — Xem chi tiết (kiểm tra quyền trong controller)
router.get('/:id', protect, getDisputeById);

// PATCH /api/disputes/:id/raise-tx — Gắn txHash sau khi raiseDispute on-chain confirm
router.patch('/:id/raise-tx', protect, attachRaiseTx);

// PATCH /api/disputes/:id/defense — Freelancer nộp bằng chứng phản bác (sau uploadDefense on-chain)
router.patch('/:id/defense', protect, submitDefense);

// PATCH /api/disputes/:id/resolve — Admin trigger finalizeDispute() on-chain (contract v2: reviewer voting)
router.patch('/:id/resolve', protect, authorize('admin'), resolveDispute);

// POST /api/disputes/:id/vote — Ghi nhận phiếu bầu sau khi ký on-chain qua MetaMask.
// Không dùng authorize() — controller tự check wallet + isReviewer on-chain (Task 13).
router.post('/:id/vote', protect, recordVote);

// POST /api/disputes/:id/finalize — Trigger finalizeDispute on-chain (sau đủ phiếu / hết 3 ngày)
// authorize('admin'): mỗi call gửi tx on-chain tốn gas admin wallet — chỉ admin mới được trigger
router.post('/:id/finalize', protect, authorize('admin'), finalizeDispute);

module.exports = router;
