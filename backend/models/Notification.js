// ============================================================
// models/Notification.js — Schema cho Notification (thông báo in-app)
//
// Mục đích: lưu lại các thông báo cần hiển thị cho user trên UI
// (chuông thông báo) — KHÔNG phải email/push, chỉ là bản ghi
// trong DB để frontend GET /api/notifications và đánh dấu đã đọc.
//
// Được tạo ở đâu?
// - notification.service.js#createNotification() là điểm tạo duy nhất,
//   được gọi từ các nơi khác trong hệ thống khi có sự kiện cần báo:
//     + escrow.controller.js: sau submitDeliverable (báo cho client),
//       sau approveWork (báo cho freelancer)
//     + eventListener.service.js: sau khi cập nhật status từ on-chain
//       event (LOCKED, DISPUTED, RELEASED, REFUNDED, ...)
//     + dispute.controller.js: sau khi admin resolveDispute
// ============================================================

const mongoose = require('mongoose');

const NOTIFICATION_TYPES = {
  DEPOSIT: 'DEPOSIT',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  RELEASED: 'RELEASED',
  DISPUTE_OPENED: 'DISPUTE_OPENED',
  DISPUTE_RESOLVED: 'DISPUTE_RESOLVED',
  REFUNDED: 'REFUNDED',
};

const notificationSchema = new mongoose.Schema(
  {
    // Người nhận thông báo này — query chính luôn lọc theo recipient
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'recipient is required'],
      index: true,
    },

    type: {
      type: String,
      enum: {
        values: Object.values(NOTIFICATION_TYPES),
        message: 'Invalid notification type: {VALUE}',
      },
      required: [true, 'Notification type is required'],
    },

    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'message is required'],
      trim: true,
    },

    // Liên kết tới escrow liên quan (đa số notification đều gắn với 1 escrow)
    // Không required vì có thể có thông báo hệ thống chung không gắn escrow nào
    escrow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Escrow',
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
