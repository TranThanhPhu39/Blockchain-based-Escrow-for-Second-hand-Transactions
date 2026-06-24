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
} = require('../controllers/escrow.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

// POST /api/escrows — Client đăng hợp đồng
router.post('/', protect, authorize('client'), createEscrow);

// GET /api/escrows — Xem danh sách của user hiện tại
router.get('/', protect, getEscrows);

// GET /api/escrows/available — Danh sách hợp đồng chưa có freelancer (đặt trước /:id)
router.get('/available', protect, authorize('freelancer', 'admin'), getAvailableEscrows);

// GET /api/escrows/:id — Xem chi tiết
router.get('/:id', protect, getEscrowById);

// PATCH /api/escrows/:id/lock — Freelancer nhận việc
router.patch('/:id/lock', protect, authorize('freelancer'), lockEscrow);

// PATCH /api/escrows/:id/submit — Freelancer nộp sản phẩm
router.patch('/:id/submit', protect, authorize('freelancer'), submitDeliverable);

// PATCH /api/escrows/:id/approve — Client phê duyệt
router.patch('/:id/approve', protect, authorize('client'), approveWork);

module.exports = router;
