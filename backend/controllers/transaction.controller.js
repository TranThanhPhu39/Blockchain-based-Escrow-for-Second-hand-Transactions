// ============================================================
// controllers/transaction.controller.js — REST API cho transactions
//
// Cung cấp endpoints để:
// 1. Frontend xem lịch sử transactions của một escrow
// 2. Admin xem toàn bộ logs
// 3. Đồng bộ thủ công khi cần (sync status từ chain về DB)
// 4. Gọi releaseFunds / refundBuyer thủ công (admin only)
// ============================================================

const TransactionLog     = require('../models/TransactionLog');
const Escrow             = require('../models/Escrow');
const asyncHandler       = require('../utils/asyncHandler');
const blockchainService  = require('../services/blockchain.service');
const { ESCROW_STATUS, USER_ROLES } = require('../utils/constants');

// ── GET /api/transactions/escrow/:escrowId ──────────────────
/**
 * Lấy toàn bộ transaction logs của một escrow
 * Dùng để: hiển thị timeline lịch sử giao dịch cho user
 */
const getTransactionsByEscrow = asyncHandler(async (req, res) => {
  const { escrowId } = req.params;

  // Kiểm tra escrow tồn tại và user có quyền xem
  const escrow = await Escrow.findById(escrowId);
  if (!escrow) {
    res.status(404);
    throw new Error('Escrow not found');
  }

  const isBuyer  = escrow.buyer.equals(req.user._id);
  const isSeller = escrow.seller.equals(req.user._id);
  const isAdmin  = req.user.role === USER_ROLES.ADMIN;

  if (!isBuyer && !isSeller && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to view transactions for this escrow');
  }

  // Lấy logs, sắp xếp theo blockNumber tăng dần (chronological)
  const logs = await TransactionLog.find({ escrow: escrowId })
    .sort({ blockNumber: 1 })
    .select('-__v');

  res.json({
    success: true,
    count: logs.length,
    transactions: logs,
  });
});

// ── GET /api/transactions ───────────────────────────────────
/**
 * Lấy toàn bộ logs (admin only)
 * Hỗ trợ filter theo eventType và pagination
 */
const getAllTransactions = asyncHandler(async (req, res) => {
  const { eventType, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (eventType) filter.eventType = eventType;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [logs, total] = await Promise.all([
    TransactionLog.find(filter)
      .populate('escrow', 'itemName status amount')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip),
    TransactionLog.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: logs.length,
    total,
    pages: Math.ceil(total / parseInt(limit)),
    transactions: logs,
  });
});

// ── POST /api/transactions/sync/:escrowId ───────────────────
/**
 * Đồng bộ thủ công: lấy status từ blockchain về DB
 * Dùng khi: backend bị down, miss event, DB và chain không khớp
 * Admin only
 */
const syncEscrowFromChain = asyncHandler(async (req, res) => {
  const escrow = await Escrow.findById(req.params.escrowId);
  if (!escrow) {
    res.status(404);
    throw new Error('Escrow not found');
  }

  if (!escrow.escrowIdOnChain && escrow.escrowIdOnChain !== 0) {
    res.status(400);
    throw new Error('This escrow has no escrowIdOnChain. Not yet deposited on blockchain.');
  }

  // Gọi blockchain để lấy status hiện tại
  const chainData = await blockchainService.getEscrowOnChain(escrow.escrowIdOnChain);

  const previousStatus = escrow.status;
  escrow.status = chainData.status;
  await escrow.save();

  res.json({
    success: true,
    message: `Escrow synced from blockchain.`,
    previousStatus,
    currentStatus: chainData.status,
    chainData,
  });
});

// ── POST /api/transactions/release/:escrowId ────────────────
/**
 * Admin gọi thủ công releaseFunds trên smart contract
 * Dùng khi: cần release khẩn cấp, hoặc sau khi resolve dispute
 */
const manualRelease = asyncHandler(async (req, res) => {
  const escrow = await Escrow.findById(req.params.escrowId);
  if (!escrow) {
    res.status(404);
    throw new Error('Escrow not found');
  }

  // Chỉ release khi đang SHIPPED hoặc DISPUTED
  const allowedStatuses = [ESCROW_STATUS.SHIPPED, ESCROW_STATUS.DISPUTED];
  if (!allowedStatuses.includes(escrow.status)) {
    res.status(400);
    throw new Error(`Cannot release funds when status is '${escrow.status}'`);
  }

  if (!escrow.escrowIdOnChain && escrow.escrowIdOnChain !== 0) {
    res.status(400);
    throw new Error('No escrowIdOnChain found');
  }

  // Gọi smart contract — transaction được ký bởi admin wallet
  const result = await blockchainService.releaseFunds(escrow.escrowIdOnChain);
  // Event listener (FundsReleased) sẽ tự động cập nhật DB
  // Nên không cần update escrow.status ở đây

  res.json({
    success: true,
    message: 'releaseFunds transaction sent. DB will be updated by event listener.',
    txHash: result.txHash,
    blockNumber: result.blockNumber,
  });
});

// ── POST /api/transactions/refund/:escrowId ─────────────────
/**
 * Admin gọi thủ công refundBuyer trên smart contract
 */
const manualRefund = asyncHandler(async (req, res) => {
  const escrow = await Escrow.findById(req.params.escrowId);
  if (!escrow) {
    res.status(404);
    throw new Error('Escrow not found');
  }

  if (escrow.status !== ESCROW_STATUS.DISPUTED) {
    res.status(400);
    throw new Error(`Can only refund when status is DISPUTED. Current: '${escrow.status}'`);
  }

  if (!escrow.escrowIdOnChain && escrow.escrowIdOnChain !== 0) {
    res.status(400);
    throw new Error('No escrowIdOnChain found');
  }

  const result = await blockchainService.refundBuyer(escrow.escrowIdOnChain);

  res.json({
    success: true,
    message: 'refundBuyer transaction sent. DB will be updated by event listener.',
    txHash: result.txHash,
    blockNumber: result.blockNumber,
  });
});

module.exports = {
  getTransactionsByEscrow,
  getAllTransactions,
  syncEscrowFromChain,
  manualRelease,
  manualRefund,
};
