// ============================================================
// controllers/dispute.controller.js — Xử lý toàn bộ dispute flow
//
// APIs được implement:
//   POST   /api/disputes                  — Buyer mở tranh chấp
//   GET    /api/disputes                  — Lấy danh sách dispute (có filter)
//   GET    /api/disputes/:id              — Lấy chi tiết 1 dispute
//   POST   /api/disputes/:id/response     — Seller phản hồi dispute
//   PATCH  /api/disputes/:id/resolve      — Admin resolve dispute
//
// Luồng đầy đủ:
//   Buyer POST /disputes → Seller POST /disputes/:id/response → Admin PATCH /disputes/:id/resolve
//   → Backend 3 gọi smart contract (refund/release)
// ============================================================

const Dispute = require('../models/Dispute');
const { DISPUTE_STATUS, DISPUTE_RESOLUTION } = require('../models/Dispute');
const Escrow = require('../models/Escrow');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const NotificationService = require('../services/notification.service');
const {
  uploadManyToCloudinary,
  CLOUDINARY_FOLDERS,
} = require('../services/fileStorage.service');

// ==================== [1] BUYER: MỞ TRANH CHẤP ====================

/**
 * POST /api/disputes
 * Auth: Buyer only
 *
 * Body (multipart/form-data):
 * {
 *   escrowId: string,
 *   reason: DISPUTE_REASON enum,
 *   description: string,
 *   files?: File[] (field name: 'files') — optional, tối đa 5
 * }
 *
 * Điều kiện:
 * - Escrow phải tồn tại và thuộc về buyer đang request
 * - Escrow phải đang ở trạng thái LOCKED hoặc SHIPPED (không thể dispute CREATED/RELEASED)
 * - Chưa có dispute nào đang OPEN hoặc RESPONDING cho escrow này
 */
const createDispute = asyncHandler(async (req, res) => {
  const { escrowId, reason, description } = req.body;
  const buyerId = req.user._id; // Từ auth middleware

  // --- Validate escrow ---
  const escrow = await Escrow.findById(escrowId);
  if (!escrow) {
    return res.status(404).json({ success: false, message: 'Escrow not found.' });
  }

  // Chỉ buyer của escrow mới được mở dispute
  if (escrow.buyer.toString() !== buyerId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Only the buyer of this escrow can open a dispute.',
    });
  }

  // Chỉ cho phép dispute khi escrow đang LOCKED hoặc SHIPPED
  const DISPUTABLE_STATUSES = ['LOCKED', 'SHIPPED'];
  if (!DISPUTABLE_STATUSES.includes(escrow.status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot open dispute for escrow with status "${escrow.status}". Escrow must be LOCKED or SHIPPED.`,
    });
  }

  // Kiểm tra đã có dispute đang mở chưa
  const existingDispute = await Dispute.findOne({
    escrow: escrowId,
    status: { $in: [DISPUTE_STATUS.OPEN, DISPUTE_STATUS.RESPONDING] },
  });
  if (existingDispute) {
    return res.status(409).json({
      success: false,
      message: 'A dispute is already open for this escrow.',
    });
  }

  // --- Upload evidence files (nếu có) ---
  let buyerEvidence = [];
  if (req.files && req.files.length > 0) {
    buyerEvidence = await uploadManyToCloudinary(
      req.files,
      CLOUDINARY_FOLDERS.DISPUTE_EVIDENCE
    );
  }

  // --- Tạo dispute ---
  const dispute = await Dispute.create({
    escrow: escrowId,
    buyer: buyerId,
    seller: escrow.seller,
    reason,
    description,
    buyerEvidence,
    status: DISPUTE_STATUS.OPEN,
  });

  // --- Cập nhật escrow status → DISPUTED ---
  escrow.status = 'DISPUTED';
  await escrow.save();

  // --- Gửi notification ---
  // Lấy danh sách admin để notify
  const admins = await User.find({ role: 'admin' }).select('_id');
  const adminIds = admins.map((a) => a._id);
  await NotificationService.notifyDisputeOpened(escrow, dispute, adminIds);

  res.status(201).json({
    success: true,
    message: 'Dispute opened successfully.',
    data: dispute,
  });
});

// ==================== [2] GET DANH SÁCH DISPUTES ====================

/**
 * GET /api/disputes
 * Auth: All roles (filter tự động theo role)
 *
 * Query params:
 * - status: filter theo status (OPEN | RESPONDING | RESOLVED | CLOSED)
 * - page: số trang (default: 1)
 * - limit: số item mỗi trang (default: 10)
 *
 * Logic phân quyền:
 * - Buyer: chỉ thấy dispute của mình (buyer === req.user._id)
 * - Seller: chỉ thấy dispute liên quan đến mình (seller === req.user._id)
 * - Admin: thấy tất cả
 */
const getDisputes = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const { _id: userId, role } = req.user;

  // Build query dựa trên role
  const query = {};

  if (role === 'buyer') {
    query.buyer = userId;
  } else if (role === 'seller') {
    query.seller = userId;
  }
  // Admin: không filter theo user

  if (status) {
    query.status = status.toUpperCase();
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [disputes, total] = await Promise.all([
    Dispute.find(query)
      .populate('buyer', 'name email walletAddress')
      .populate('seller', 'name email walletAddress')
      .populate('escrow', 'itemName amount status contractAddress')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Dispute.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    data: disputes,
  });
});

// ==================== [3] GET CHI TIẾT 1 DISPUTE ====================

/**
 * GET /api/disputes/:id
 * Auth: Buyer/Seller liên quan, hoặc Admin
 */
const getDisputeById = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id)
    .populate('buyer', 'name email walletAddress')
    .populate('seller', 'name email walletAddress')
    .populate('escrow', 'itemName itemDescription amount status contractAddress escrowIdOnChain txHash shippingInfo')
    .populate('resolvedBy', 'name email');

  if (!dispute) {
    return res.status(404).json({ success: false, message: 'Dispute not found.' });
  }

  // Kiểm tra quyền truy cập
  const userId = req.user._id.toString();
  const isInvolved =
    dispute.buyer._id.toString() === userId ||
    dispute.seller._id.toString() === userId;
  const isAdmin = req.user.role === 'admin';

  if (!isInvolved && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You are not involved in this dispute.',
    });
  }

  res.status(200).json({ success: true, data: dispute });
});

// ==================== [4] SELLER: PHẢN HỒI TRANH CHẤP ====================

/**
 * POST /api/disputes/:id/response
 * Auth: Seller only
 *
 * Body (multipart/form-data):
 * {
 *   content: string — nội dung phản hồi
 *   files?: File[] (field name: 'files') — bằng chứng phản bác
 * }
 *
 * Điều kiện:
 * - Dispute phải đang OPEN
 * - Người request phải là seller của dispute
 */
const respondToDispute = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const sellerId = req.user._id;

  const dispute = await Dispute.findById(req.params.id).populate('escrow');
  if (!dispute) {
    return res.status(404).json({ success: false, message: 'Dispute not found.' });
  }

  // Chỉ seller của dispute mới được phản hồi
  if (dispute.seller.toString() !== sellerId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Only the seller of this dispute can respond.',
    });
  }

  // Chỉ phản hồi khi dispute đang OPEN
  if (dispute.status !== DISPUTE_STATUS.OPEN) {
    return res.status(400).json({
      success: false,
      message: `Cannot respond to dispute with status "${dispute.status}".`,
    });
  }

  // Upload bằng chứng phản bác của seller (nếu có)
  let sellerEvidence = [];
  if (req.files && req.files.length > 0) {
    sellerEvidence = await uploadManyToCloudinary(
      req.files,
      CLOUDINARY_FOLDERS.SELLER_EVIDENCE
    );
  }

  // Cập nhật dispute
  dispute.sellerResponse = {
    content,
    evidence: sellerEvidence,
    respondedAt: new Date(),
  };
  dispute.status = DISPUTE_STATUS.RESPONDING;
  await dispute.save();

  // Notify buyer và admin
  const admins = await User.find({ role: 'admin' }).select('_id');
  const adminIds = admins.map((a) => a._id);
  await NotificationService.notifyDisputeResponded(dispute.escrow, dispute, adminIds);

  res.status(200).json({
    success: true,
    message: 'Response submitted successfully.',
    data: dispute,
  });
});

// ==================== [5] ADMIN: RESOLVE TRANH CHẤP ====================

/**
 * PATCH /api/disputes/:id/resolve
 * Auth: Admin only
 *
 * Body:
 * {
 *   resolution: 'REFUND_BUYER' | 'RELEASE_SELLER',
 *   adminNote?: string
 * }
 *
 * Sau khi admin resolve:
 * 1. Dispute status → RESOLVED
 * 2. Escrow status → REFUNDED hoặc RELEASED (backend cập nhật)
 * 3. Backend 3 sẽ thực sự gọi smart contract để thực hiện on-chain
 *    (Backend 3 lắng nghe dispute.resolution thay đổi hoặc Admin gọi endpoint riêng của B3)
 * 4. Gửi notification cho buyer và seller
 */
const resolveDispute = asyncHandler(async (req, res) => {
  const { resolution, adminNote } = req.body;

  // Validate resolution value
  if (!Object.values(DISPUTE_RESOLUTION).includes(resolution)) {
    return res.status(400).json({
      success: false,
      message: `Invalid resolution. Must be one of: ${Object.values(DISPUTE_RESOLUTION).join(', ')}`,
    });
  }

  const dispute = await Dispute.findById(req.params.id).populate('escrow');
  if (!dispute) {
    return res.status(404).json({ success: false, message: 'Dispute not found.' });
  }

  // Chỉ resolve được dispute đang OPEN hoặc RESPONDING
  if (![DISPUTE_STATUS.OPEN, DISPUTE_STATUS.RESPONDING].includes(dispute.status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot resolve dispute with status "${dispute.status}".`,
    });
  }

  // Cập nhật dispute
  dispute.resolution = resolution;
  dispute.resolvedBy = req.user._id;
  dispute.resolvedAt = new Date();
  dispute.adminNote = adminNote || '';
  dispute.status = DISPUTE_STATUS.RESOLVED;
  await dispute.save();

  // Cập nhật escrow status tương ứng
  // Backend 3 sẽ gọi smart contract sau — đây là trạng thái DB trước
  const escrow = dispute.escrow;
  escrow.status = resolution === DISPUTE_RESOLUTION.REFUND_BUYER ? 'REFUNDED' : 'RELEASED';
  await escrow.save();

  // Gửi notification cho buyer và seller
  await NotificationService.notifyDisputeResolved(escrow, dispute);

  res.status(200).json({
    success: true,
    message: 'Dispute resolved successfully.',
    data: {
      dispute,
      escrowStatus: escrow.status,
      // Backend 3 sẽ pick up escrow.status và gọi contract
    },
  });
});

// ==================== EXPORTS ====================

module.exports = {
  createDispute,
  getDisputes,
  getDisputeById,
  respondToDispute,
  resolveDispute,
};