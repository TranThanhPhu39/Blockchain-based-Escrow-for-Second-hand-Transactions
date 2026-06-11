// ============================================================
// models/Notification.js — Schema cho Notification (Thông báo)
//
// Notification được tạo khi:
// - Escrow status thay đổi (LOCKED, SHIPPED, RELEASED, REFUNDED...)
// - Buyer mở dispute
// - Seller phản hồi dispute
// - Admin resolve dispute
// ============================================================

const mongoose = require('mongoose');

// ==================== CONSTANTS ====================

const NOTIFICATION_TYPE = {
  // Escrow events
  ESCROW_CREATED: 'ESCROW_CREATED',       // Buyer tạo escrow mới
  ESCROW_LOCKED: 'ESCROW_LOCKED',         // Tiền đã được lock (Backend 3 trigger)
  ESCROW_SHIPPED: 'ESCROW_SHIPPED',       // Seller đã gửi hàng
  ESCROW_RELEASED: 'ESCROW_RELEASED',     // Tiền đã được release cho seller
  ESCROW_REFUNDED: 'ESCROW_REFUNDED',     // Buyer đã được hoàn tiền
  ESCROW_CANCELLED: 'ESCROW_CANCELLED',   // Escrow bị hủy

  // Dispute events
  DISPUTE_OPENED: 'DISPUTE_OPENED',       // Buyer mở dispute
  DISPUTE_RESPONDED: 'DISPUTE_RESPONDED', // Seller phản hồi dispute
  DISPUTE_RESOLVED: 'DISPUTE_RESOLVED',   // Admin resolve dispute
};

// ==================== SCHEMA ====================

const notificationSchema = new mongoose.Schema(
  {
    // ==================== NGƯỜI NHẬN ====================
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Tham chiếu User model của Backend 1
      required: [true, 'Recipient is required'],
    },

    // ==================== NỘI DUNG ====================
    type: {
      type: String,
      enum: {
        values: Object.values(NOTIFICATION_TYPE),
        message: 'Invalid notification type: {VALUE}',
      },
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },

    // ==================== THAM CHIẾU ====================
    // Lưu reference đến escrow hoặc dispute liên quan
    // Dùng để điều hướng khi user click vào notification
    escrow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Escrow', // Tham chiếu Escrow model của Backend 1
    },
    dispute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dispute', // Tham chiếu Dispute model của Backend 2
    },

    // ==================== TRẠNG THÁI ĐỌC ====================
    isRead: {
      type: Boolean,
      default: false, // Mặc định chưa đọc khi mới tạo
    },
    readAt: {
      type: Date, // Thời điểm user đọc notification
    },
  },
  {
    timestamps: true, // createdAt, updatedAt — giống User.js và Escrow.js
  }
);

// ==================== INDEXES ====================

// Query "tất cả notification của user này, mới nhất trước"
// Dùng trong API GET /api/notifications
notificationSchema.index({ recipient: 1, createdAt: -1 });

// Query "notification chưa đọc của user này"
// Dùng để hiển thị badge số thông báo chưa đọc
notificationSchema.index({ recipient: 1, isRead: 1 });

// ==================== MODEL ====================
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
module.exports.NOTIFICATION_TYPE = NOTIFICATION_TYPE;