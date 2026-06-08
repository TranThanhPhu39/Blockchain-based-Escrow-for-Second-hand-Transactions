// ============================================================
// routes/notification.routes.js
//
// GET   /api/notifications              — Danh sách notification của user
// GET   /api/notifications/unread-count — Số chưa đọc (cho badge UI)
// PATCH /api/notifications/read-all     — Đánh dấu tất cả đã đọc
// PATCH /api/notifications/:id/read     — Đánh dấu 1 cái đã đọc
//
// LƯU Ý: Route cụ thể (read-all, unread-count) phải khai báo TRƯỚC route có param (:id)
// Nếu không Express sẽ hiểu 'read-all' là :id → sai logic
// ============================================================

const express = require('express');
const router = express.Router();

const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notification.controller');

const { protect } = require('../middleware/auth.middleware');

// Tất cả routes đều cần login
router.use(protect);

// PHẢI đứng trước /:id
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);

// Routes với param
router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);

module.exports = router;