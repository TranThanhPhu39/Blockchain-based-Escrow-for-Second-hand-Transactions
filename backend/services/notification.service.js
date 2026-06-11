// ============================================================
// services/notification.service.js — Business logic tạo Notification
//
// Service này được gọi từ:
// - dispute.controller.js: khi buyer mở dispute, seller phản hồi, admin resolve
// - Backend 3 (blockchain listener): khi escrow status thay đổi (LOCKED, RELEASED...)
//
// Pattern: Mỗi event có 1 helper function riêng → dễ gọi, không cần nhớ type/title/message
//
// Ví dụ:
//   await NotificationService.notifyDisputeOpened(escrow, dispute);
//   thay vì phải tự build object notification mỗi lần
// ============================================================

const Notification = require('../models/Notification');
const { NOTIFICATION_TYPE } = require('../models/Notification');

// ==================== CORE FUNCTION ====================

/**
 * createNotification — Tạo 1 notification trong MongoDB
 *
 * @param {object} params
 * @param {ObjectId} params.recipientId  - User nhận notification
 * @param {string}   params.type         - NOTIFICATION_TYPE constant
 * @param {string}   params.title        - Tiêu đề ngắn
 * @param {string}   params.message      - Nội dung chi tiết
 * @param {ObjectId} [params.escrowId]   - Optional: ref đến Escrow
 * @param {ObjectId} [params.disputeId]  - Optional: ref đến Dispute
 * @returns {Promise<Notification>}
 */
const createNotification = async ({
  recipientId,
  type,
  title,
  message,
  escrowId = null,
  disputeId = null,
}) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      escrow: escrowId,
      dispute: disputeId,
    });
    return notification;
  } catch (error) {
    // Log lỗi nhưng không throw — notification thất bại không nên block flow chính
    // Ví dụ: dispute vẫn được tạo dù notification lỗi
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

/**
 * createManyNotifications — Tạo nhiều notification cùng lúc (parallel)
 * Dùng khi cần notify cả buyer lẫn seller
 *
 * @param {Array<object>} notificationParams - Mảng params cho createNotification
 * @returns {Promise<Array>}
 */
const createManyNotifications = async (notificationParams) => {
  const promises = notificationParams.map((params) => createNotification(params));
  return Promise.allSettled(promises); // allSettled: không fail nếu 1 cái lỗi
};

// ==================== DISPUTE EVENTS ====================

/**
 * notifyDisputeOpened
 * → Gửi cho Seller: "Buyer đã mở tranh chấp"
 * → Gửi cho Admin: "Có tranh chấp mới cần xử lý"
 *
 * @param {object} escrow   - Escrow document (có buyer, seller, itemName)
 * @param {object} dispute  - Dispute document vừa tạo
 * @param {Array}  adminIds - Danh sách _id của admin (lấy từ User.find({ role: 'admin' }))
 */
const notifyDisputeOpened = async (escrow, dispute, adminIds = []) => {
  const notifications = [];

  // Notify seller
  notifications.push({
    recipientId: escrow.seller,
    type: NOTIFICATION_TYPE.DISPUTE_OPENED,
    title: 'Tranh chấp mới được mở',
    message: `Người mua đã mở tranh chấp cho giao dịch "${escrow.itemName}". Vui lòng phản hồi trong vòng 48 giờ.`,
    escrowId: escrow._id,
    disputeId: dispute._id,
  });

  // Notify tất cả admin
  adminIds.forEach((adminId) => {
    notifications.push({
      recipientId: adminId,
      type: NOTIFICATION_TYPE.DISPUTE_OPENED,
      title: 'Tranh chấp mới cần xử lý',
      message: `Có tranh chấp mới cho giao dịch "${escrow.itemName}" cần được xem xét.`,
      escrowId: escrow._id,
      disputeId: dispute._id,
    });
  });

  return createManyNotifications(notifications);
};

/**
 * notifyDisputeResponded
 * → Gửi cho Buyer: "Seller đã phản hồi tranh chấp"
 * → Gửi cho Admin: "Seller đã phản hồi, cần xem xét"
 *
 * @param {object} escrow
 * @param {object} dispute
 * @param {Array}  adminIds
 */
const notifyDisputeResponded = async (escrow, dispute, adminIds = []) => {
  const notifications = [];

  // Notify buyer
  notifications.push({
    recipientId: escrow.buyer,
    type: NOTIFICATION_TYPE.DISPUTE_RESPONDED,
    title: 'Người bán đã phản hồi tranh chấp',
    message: `Người bán đã phản hồi tranh chấp cho giao dịch "${escrow.itemName}". Admin đang xem xét.`,
    escrowId: escrow._id,
    disputeId: dispute._id,
  });

  // Notify admin
  adminIds.forEach((adminId) => {
    notifications.push({
      recipientId: adminId,
      type: NOTIFICATION_TYPE.DISPUTE_RESPONDED,
      title: 'Người bán đã phản hồi tranh chấp',
      message: `Tranh chấp cho giao dịch "${escrow.itemName}" đã có phản hồi từ người bán. Cần xem xét và ra quyết định.`,
      escrowId: escrow._id,
      disputeId: dispute._id,
    });
  });

  return createManyNotifications(notifications);
};

/**
 * notifyDisputeResolved
 * → Gửi cho Buyer: kết quả (refund hoặc thua)
 * → Gửi cho Seller: kết quả (nhận tiền hoặc thua)
 *
 * @param {object} escrow
 * @param {object} dispute    - Phải có dispute.resolution đã được set
 */
const notifyDisputeResolved = async (escrow, dispute) => {
  const isRefund = dispute.resolution === 'REFUND_BUYER';
  const notifications = [];

  // Notify buyer
  notifications.push({
    recipientId: escrow.buyer,
    type: NOTIFICATION_TYPE.DISPUTE_RESOLVED,
    title: isRefund ? 'Tranh chấp: Bạn thắng - Hoàn tiền' : 'Tranh chấp: Quyết định nghiêng về người bán',
    message: isRefund
      ? `Tranh chấp cho giao dịch "${escrow.itemName}" đã được giải quyết. Tiền sẽ được hoàn lại cho bạn.`
      : `Tranh chấp cho giao dịch "${escrow.itemName}" đã được giải quyết. Tiền sẽ được chuyển cho người bán.`,
    escrowId: escrow._id,
    disputeId: dispute._id,
  });

  // Notify seller
  notifications.push({
    recipientId: escrow.seller,
    type: NOTIFICATION_TYPE.DISPUTE_RESOLVED,
    title: isRefund ? 'Tranh chấp: Quyết định nghiêng về người mua' : 'Tranh chấp: Bạn thắng - Nhận tiền',
    message: isRefund
      ? `Tranh chấp cho giao dịch "${escrow.itemName}" đã được giải quyết. Tiền sẽ được hoàn lại cho người mua.`
      : `Tranh chấp cho giao dịch "${escrow.itemName}" đã được giải quyết. Tiền sẽ được chuyển cho bạn.`,
    escrowId: escrow._id,
    disputeId: dispute._id,
  });

  return createManyNotifications(notifications);
};

// ==================== ESCROW EVENTS ====================
// Các function này được Backend 3 gọi sau khi nghe blockchain event
// Expose ra để Backend 3 có thể import và dùng

/**
 * notifyEscrowLocked — Tiền đã được lock trên smart contract
 * → Notify seller: "Buyer đã nạp tiền, bắt đầu giao hàng"
 */
const notifyEscrowLocked = async (escrow) => {
  return createNotification({
    recipientId: escrow.seller,
    type: NOTIFICATION_TYPE.ESCROW_LOCKED,
    title: 'Người mua đã nạp tiền',
    message: `Giao dịch "${escrow.itemName}" đã được xác nhận. Tiền đang được giữ an toàn. Hãy chuẩn bị giao hàng.`,
    escrowId: escrow._id,
  });
};

/**
 * notifyEscrowReleased — Tiền đã được release cho seller
 * → Notify cả buyer và seller
 */
const notifyEscrowReleased = async (escrow) => {
  return createManyNotifications([
    {
      recipientId: escrow.seller,
      type: NOTIFICATION_TYPE.ESCROW_RELEASED,
      title: 'Tiền đã được chuyển cho bạn',
      message: `Giao dịch "${escrow.itemName}" hoàn tất. Tiền đã được chuyển vào ví của bạn.`,
      escrowId: escrow._id,
    },
    {
      recipientId: escrow.buyer,
      type: NOTIFICATION_TYPE.ESCROW_RELEASED,
      title: 'Giao dịch hoàn tất',
      message: `Giao dịch "${escrow.itemName}" đã hoàn tất. Tiền đã được chuyển cho người bán.`,
      escrowId: escrow._id,
    },
  ]);
};

/**
 * notifyEscrowRefunded — Tiền đã được hoàn lại cho buyer
 * → Notify buyer
 */
const notifyEscrowRefunded = async (escrow) => {
  return createNotification({
    recipientId: escrow.buyer,
    type: NOTIFICATION_TYPE.ESCROW_REFUNDED,
    title: 'Tiền đã được hoàn lại',
    message: `Tiền cho giao dịch "${escrow.itemName}" đã được hoàn lại vào ví của bạn.`,
    escrowId: escrow._id,
  });
};

// ==================== EXPORTS ====================

module.exports = {
  createNotification,
  createManyNotifications,
  // Dispute events
  notifyDisputeOpened,
  notifyDisputeResponded,
  notifyDisputeResolved,
  // Escrow events (dùng bởi Backend 3)
  notifyEscrowLocked,
  notifyEscrowReleased,
  notifyEscrowRefunded,
};