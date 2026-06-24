// ============================================================
// controllers/transaction.controller.js — Xử lý Transaction Logs (Backend 2)
//
// TransactionLog đã được TẠO SẴN bởi
// backend/services/eventListener.service.js#saveTransactionLog()
// mỗi khi 1 on-chain event được xử lý (EscrowCreated, FundsDeposited,
// ItemShipped, DisputeRaised, FundsReleased, BuyerRefunded, EscrowCancelled).
//
// Controller này CHỈ ĐỌC dữ liệu đó — không có hàm tạo/sửa/xoá log,
// vì txHash trên blockchain là nguồn sự thật duy nhất, ghi log là
// trách nhiệm riêng của event listener.
//
// Dùng để render "lịch sử giao dịch" / timeline cho 1 escrow trên
// EscrowDetailsPage, hoặc xem toàn bộ log nếu là admin.
// ============================================================

const TransactionLog = require('../models/TransactionLog');
const Escrow = require('../models/Escrow');
const { USER_ROLES } = require('../utils/constants');
const asyncHandler = require('../utils/asyncHandler');

// ==================== GET /api/transactions/escrow/:escrowId ====================
/**
 * Lấy toàn bộ lịch sử transaction (on-chain events) của 1 escrow,
 * sắp xếp theo thời gian xảy ra trên chain (blockTimestamp tăng dần)
 * Params: escrowId (MongoDB ObjectId của Escrow, không phải escrowIdOnChain)
 * Response: { success, count, logs }
 */
const getTransactionsByEscrow = asyncHandler(async (req, res) => {
  const escrow = await Escrow.findById(req.params.escrowId);

  if (!escrow) {
    res.status(404);
    throw new Error('Escrow not found');
  }

  // Kiểm tra quyền truy cập — chỉ client, freelancer của escrow, hoặc admin
  const isClient = escrow.client.equals(req.user._id);
  const isFreelancer = escrow.freelancer.equals(req.user._id);
  const isAdmin = req.user.role === USER_ROLES.ADMIN;

  if (!isClient && !isFreelancer && !isAdmin) {
    res.status(403);
    throw new Error('You are not authorized to view transactions for this escrow');
  }

  const logs = await TransactionLog.find({ escrow: escrow._id }).sort({ blockTimestamp: 1 });

  res.json({ success: true, count: logs.length, logs });
});

// ==================== GET /api/transactions ====================
/**
 * Lấy toàn bộ transaction logs trong hệ thống (chỉ admin)
 * Query params: eventType, page, limit
 * Response: { success, count, total, pages, currentPage, logs }
 */
const getAllTransactions = asyncHandler(async (req, res) => {
  if (req.user.role !== USER_ROLES.ADMIN) {
    res.status(403);
    throw new Error('Only admin can view all transaction logs');
  }

  const { eventType, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (eventType) filter.eventType = eventType;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [logs, total] = await Promise.all([
    TransactionLog.find(filter)
      .populate('escrow', 'serviceName status')
      .sort({ blockTimestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip),
    TransactionLog.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: logs.length,
    total,
    pages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    logs,
  });
});

module.exports = { getTransactionsByEscrow, getAllTransactions };
