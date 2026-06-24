// ============================================================
// controllers/notification.controller.js — Xử lý Notifications (Backend 2)
//
// Notification được TẠO ra từ các nơi khác trong hệ thống
// (qua services/notification.service.js#createNotification),
// controller này chỉ phục vụ việc ĐỌC và ĐÁNH DẤU ĐÃ ĐỌC,
// đúng với những gì frontend (NotificationsPage) cần.
// ============================================================

const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

// ==================== GET /api/notifications ====================
/**
 * Lấy danh sách notification của user hiện tại
 * Query params: isRead ('true'|'false', tuỳ chọn), page, limit
 * Response: { success, count, total, pages, currentPage, unreadCount, notifications }
 */
const getNotifications = asyncHandler(async (req, res) => {
  const { isRead, page = 1, limit = 20 } = req.query;

  const filter = { recipient: req.user._id };
  if (isRead === 'true' || isRead === 'false') {
    filter.isRead = isRead === 'true';
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .populate('escrow', 'serviceName status')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
  ]);

  res.json({
    success: true,
    count: notifications.length,
    total,
    pages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    unreadCount,
    notifications,
  });
});

// ==================== PATCH /api/notifications/:id/read ====================
/**
 * Đánh dấu 1 notification đã đọc
 * Response: { success, notification }
 */
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  // Chỉ chủ sở hữu notification mới được đánh dấu đã đọc
  if (!notification.recipient.equals(req.user._id)) {
    res.status(403);
    throw new Error('You are not authorized to update this notification');
  }

  notification.isRead = true;
  await notification.save();

  res.json({ success: true, notification });
});

// ==================== PATCH /api/notifications/read-all ====================
/**
 * Đánh dấu TẤT CẢ notification của user hiện tại đã đọc
 * Response: { success, modifiedCount }
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  res.json({ success: true, modifiedCount: result.modifiedCount });
});

module.exports = { getNotifications, markAsRead, markAllAsRead };
