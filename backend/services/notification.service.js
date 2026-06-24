// ============================================================
// services/notification.service.js — Tạo notification in-app
//
// Điểm tạo notification DUY NHẤT trong hệ thống — mọi nơi khác
// (escrow.controller.js, dispute.controller.js, eventListener.service.js)
// gọi createNotification() ở đây thay vì tự new Notification(),
// để đảm bảo format nhất quán và dễ mở rộng (ví dụ sau này thêm
// gửi email/push) chỉ cần sửa 1 chỗ.
//
// Service này CHỦ ĐỘNG KHÔNG throw lỗi ra ngoài — tạo notification
// thất bại không nên làm fail luồng nghiệp vụ chính (ví dụ: escrow
// submit thành công nhưng notification lỗi thì vẫn phải trả response
// thành công cho submitDeliverable, chỉ log lỗi notification riêng).
// ============================================================

const Notification = require('../models/Notification');

/**
 * Tạo 1 notification cho 1 user.
 * @param {Object} params
 * @param {string} params.recipient - User._id nhận thông báo
 * @param {string} params.type - 1 trong Notification.NOTIFICATION_TYPES
 * @param {string} params.title
 * @param {string} params.message
 * @param {string} [params.escrow] - Escrow._id liên quan (nếu có)
 * @returns {Promise<Object|null>} notification đã tạo, hoặc null nếu lỗi
 */
const createNotification = async ({ recipient, type, title, message, escrow }) => {
  try {
    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      escrow,
    });
    return notification;
  } catch (err) {
    // Không throw — xem giải thích ở đầu file
    console.error(`❌ Failed to create notification: ${err.message}`);
    return null;
  }
};

/**
 * Tạo notification cho NHIỀU user cùng lúc với cùng nội dung
 * (ví dụ: báo cho cả client và freelancer khi dispute được resolve).
 * @param {Array<string>} recipients - danh sách User._id
 * @param {Object} params - { type, title, message, escrow }
 */
const createNotificationForMany = async (recipients, params) => {
  return Promise.all(
    recipients.map((recipient) => createNotification({ ...params, recipient }))
  );
};

module.exports = { createNotification, createNotificationForMany };
