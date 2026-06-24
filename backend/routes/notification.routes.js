// ============================================================
// routes/notification.routes.js — Định nghĩa các notification endpoints
// Mount vào /api/notifications trong app.js
// ============================================================

const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/notifications — Danh sách notification của user hiện tại
router.get('/', protect, getNotifications);

// PATCH /api/notifications/read-all — Đánh dấu tất cả đã đọc
// Đặt TRƯỚC /:id/read để Express không hiểu "read-all" là 1 :id
router.patch('/read-all', protect, markAllAsRead);

// PATCH /api/notifications/:id/read — Đánh dấu 1 notification đã đọc
router.patch('/:id/read', protect, markAsRead);

module.exports = router;
