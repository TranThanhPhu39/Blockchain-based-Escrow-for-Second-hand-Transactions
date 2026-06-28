// ============================================================
// routes/escrow.routes.js — Định nghĩa các escrow endpoints
//
// Mount vào /api/escrows trong app.js
// Tất cả routes đều cần đăng nhập (protect)
// Một số routes có thêm phân quyền theo role (authorize)
// ============================================================

const express = require('express');
const {
  createEscrow,
  getEscrows,
  getEscrowById,
  getAvailableEscrows,
  lockEscrow,
  submitDeliverable,
  approveWork,
  verifyContractHash,
  getOnChainStatus,
} = require('../controllers/escrow.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { createEscrowRules, validateRequest } = require('../middleware/validators');
const { addClient, removeClient } = require('../services/sse.service');

const router = express.Router();

// POST /api/escrows — Bất kỳ user nào cũng có thể tạo hợp đồng (trở thành client)
router.post('/', protect, authorize('user'), createEscrowRules, validateRequest, createEscrow);

// GET /api/escrows — Xem danh sách của user hiện tại
router.get('/', protect, getEscrows);

// GET /api/escrows/events — SSE: push escrow-updated khi có thay đổi (đặt trước /:id)
router.get('/events', protect, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  addClient(res);
  res.write('event: connected\ndata: {}\n\n');
  req.on('close', () => removeClient(res));
});

// GET /api/escrows/available — Danh sách hợp đồng chưa có freelancer (đặt trước /:id)
// admin cũng xem được để monitor
router.get('/available', protect, authorize('user', 'admin'), getAvailableEscrows);

// GET /api/escrows/:id — Xem chi tiết (controller kiểm tra là client/freelancer/admin)
router.get('/:id', protect, getEscrowById);

// PATCH /api/escrows/:id/lock — Nhận việc (controller verify user không phải client của escrow này)
router.patch('/:id/lock', protect, authorize('user'), lockEscrow);

// PATCH /api/escrows/:id/submit — Nộp sản phẩm (controller verify user là freelancer của escrow này)
router.patch('/:id/submit', protect, authorize('user'), submitDeliverable);

// PATCH /api/escrows/:id/approve — Phê duyệt (controller verify user là client của escrow này)
router.patch('/:id/approve', protect, authorize('user'), approveWork);

// GET /api/escrows/:id/verify-hash — Xác minh tính toàn vẹn hợp đồng (SHA-256)
router.get('/:id/verify-hash', protect, verifyContractHash);

// GET /api/escrows/:id/on-chain-status — So sánh DB status với on-chain status
router.get('/:id/on-chain-status', protect, getOnChainStatus);

module.exports = router;
