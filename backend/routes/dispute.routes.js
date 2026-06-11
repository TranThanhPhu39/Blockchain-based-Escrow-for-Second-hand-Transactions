// ============================================================
// routes/dispute.routes.js
//
// POST  /api/disputes                — Buyer mở tranh chấp (+ upload evidence)
// GET   /api/disputes                — Lấy danh sách (filter theo role tự động)
// GET   /api/disputes/:id            — Chi tiết 1 dispute
// POST  /api/disputes/:id/response   — Seller phản hồi (+ upload evidence)
// PATCH /api/disputes/:id/resolve    — Admin resolve
// ============================================================

const express = require('express');
const router = express.Router();

const {
  createDispute,
  getDisputes,
  getDisputeById,
  respondToDispute,
  resolveDispute,
} = require('../controllers/dispute.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { uploadMultiple, handleUploadError } = require('../middleware/upload.middleware');

// --- Danh sách & tạo mới ---

router
  .route('/')
  .get(protect, getDisputes)
  .post(
    protect,
    authorize('buyer'),        // Chỉ buyer mới mở được dispute
    uploadMultiple,            // Multer xử lý files trước
    handleUploadError,         // Catch multer errors
    createDispute
  );

// --- Chi tiết ---

router.get('/:id', protect, getDisputeById);

// --- Seller phản hồi ---

router.post(
  '/:id/response',
  protect,
  authorize('seller'),
  uploadMultiple,
  handleUploadError,
  respondToDispute
);

// --- Admin resolve ---

router.patch(
  '/:id/resolve',
  protect,
  authorize ('admin'),
  resolveDispute
);

module.exports = router;