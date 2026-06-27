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
} = require('../controllers/escrow.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

// POST /api/escrows — Bất kỳ user nào cũng có thể tạo hợp đồng (trở thành client)
router.post('/', protect, authorize('user'), createEscrow);

// GET /api/escrows — Xem danh sách của user hiện tại
router.get('/', protect, getEscrows);

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

module.exports = router;
