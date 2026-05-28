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
  updateShipping,
  confirmDelivery,
} = require('../controllers/escrow.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

// router.use(protect): áp dụng protect middleware cho TẤT CẢ routes bên dưới
// Thay vì viết protect trong từng route, viết 1 lần cho gọn
router.use(protect);

// POST /api/escrows — Tạo escrow (chỉ buyer)
router.post('/', authorize('buyer'), createEscrow);

// GET /api/escrows — Xem danh sách (buyer, seller, admin đều xem được)
router.get('/', getEscrows);

// GET /api/escrows/:id — Xem chi tiết (kiểm tra quyền trong controller)
router.get('/:id', getEscrowById);

// PATCH /api/escrows/:id/shipping — Cập nhật shipping (chỉ seller)
router.patch('/:id/shipping', authorize('seller'), updateShipping);

// PATCH /api/escrows/:id/confirm — Buyer confirm nhận hàng (chỉ buyer)
router.patch('/:id/confirm', authorize('buyer'), confirmDelivery);

module.exports = router;
