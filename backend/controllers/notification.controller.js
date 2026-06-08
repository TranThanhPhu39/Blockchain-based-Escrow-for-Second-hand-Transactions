// ============================================================
// controllers/notification.controller.js
//
// APIs:
//   GET   /api/notifications          — Lấy danh sách notification của user
//   PATCH /api/notifications/:id/read — Đánh dấu 1 notification đã đọc
//   PATCH /api/notifications/read-all — Đánh dấu tất cả đã đọc
//   GET   /api/notifications/unread-count — Số thông báo chưa đọc (cho badge)
// ============================================================

const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

// ==================== GET DANH SÁCH ====================

/**
 * GET /api/notifications
 * Auth: Any logged-in user
 *
 * Query:
 * - isRead: 'true' | 'false' (filter chưa đọc / đã đọc)
 * - page: default 1
 * - limit: default 20
 */
const getNotifications = asyncHandler(async (req, res) => {
  const { isRead, page = 1, limit = 20 } = req.query;
  const userId = req.user._id;

  const query = { recipient: userId };

  if (isRead !== undefined) {
    query.isRead = isRead === 'true';
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .populate('escrow', 'itemName amount status')
      .populate('dispute', 'reason status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Notification.countDocuments(query),
    Notification.countDocuments({ recipient: userId, isRead: false }),
  ]);

  res.status(200).json({
    success: true,
    total,
    unreadCount,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    data: notifications,
  });
});

// ==================== UNREAD COUNT ====================

/**
 * GET /api/notifications/unread-count
 * Auth: Any logged-in user
 * Dùng để hiển thị badge số thông báo trên UI
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  res.status(200).json({ success: true, unreadCount: count });
});

// ==================== MARK 1 AS READ ====================

/**
 * PATCH /api/notifications/:id/read
 * Auth: Owner of notification only
 */
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found.' });
  }

  // Chỉ người nhận mới được đánh dấu đã đọc
  if (notification.recipient.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  if (notification.isRead) {
    return res.status(200).json({ success: true, message: 'Already read.', data: notification });
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  res.status(200).json({ success: true, data: notification });
});

// ==================== MARK ALL AS READ ====================

/**
 * PATCH /api/notifications/read-all
 * Auth: Any logged-in user
 * Đánh dấu tất cả notification của user hiện tại là đã đọc
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  res.status(200).json({
    success: true,
    message: `Marked ${result.modifiedCount} notifications as read.`,
    modifiedCount: result.modifiedCount,
  });
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};