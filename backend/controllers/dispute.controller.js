// ============================================================
// controllers/dispute.controller.js — Xử lý Disputes (Backend 2)
//
// QUAN TRỌNG — đọc trước khi sửa file này (xem thêm models/Dispute.js):
//
// 1. Escrow.status → DISPUTED đã được set SẴN bởi
//    eventListener.service.js#handleDisputeRaised ngay khi smart
//    contract emit event DisputeRaised (sau khi Client/Freelancer
//    tự ký raiseDispute() qua wallet ở frontend, dùng
//    raiseDisputeOnChain() trong lib/web3.js). Vì vậy createDispute
//    ở đây KHÔNG tự đổi status — chỉ lưu record chi tiết bổ sung.
//
// 2. Luồng đúng (frontend gọi theo thứ tự):
//    a) POST /api/uploads → lấy URL các file bằng chứng
//    b) POST /api/disputes (route này) → tạo Dispute record DB,
//       backend trả về dispute._id
//    c) Frontend gọi raiseDisputeOnChain(signer, escrowIdOnChain, evidenceURI)
//       trong lib/web3.js, với evidenceURI = URL trỏ về dispute này
//       (ví dụ `${API_BASE_URL}/api/disputes/${dispute._id}`)
//    d) Frontend PATCH lại dispute với raiseTxHash sau khi tx confirm
//       (xem attachRaiseTx bên dưới) — tuỳ chọn, chỉ để audit, vì
//       eventListener vẫn ghi nhận DisputeRaised độc lập qua TransactionLog.
//
// 3. Admin resolve dispute bằng cách trigger finalizeDispute() on-chain
//    qua PATCH /api/disputes/:id/resolve (hoặc POST /:id/finalize).
//    Contract v2 không có resolveDispute() — kết quả do reviewer voting
//    quyết định, admin chỉ trigger finalization sau khi đủ điều kiện
//    (≥9 phiếu hoặc hết 3 ngày — contract tự kiểm tra và revert nếu chưa đủ).
// ============================================================

const Dispute = require('../models/Dispute');
const Escrow = require('../models/Escrow');
const { ESCROW_STATUS, USER_ROLES } = require('../utils/constants');
const { finalizeDisputeOnChain, checkIsReviewerOnChain } = require('../services/blockchain.service');
const { createNotificationForMany } = require('../services/notification.service');
const { NOTIFICATION_TYPES } = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

// ==================== POST /api/disputes ====================
/**
 * Tạo dispute record (chi tiết bổ sung cho 1 escrow đang tranh chấp)
 * Body: { escrowId, reason, evidenceFiles? }
 *   - escrowId: MongoDB ObjectId của Escrow (KHÔNG phải escrowIdOnChain)
 *   - evidenceFiles: mảng URL đã upload qua POST /api/uploads (tuỳ chọn)
 * Response: { success, dispute }
 */
const createDispute = asyncHandler(async (req, res) => {
  const { escrowId, reason, evidenceFiles } = req.body;

  if (!escrowId || !reason) {
    res.status(400);
    throw new Error('escrowId and reason are required');
  }

  const escrow = await Escrow.findById(escrowId);
  if (!escrow) {
    res.status(404);
    throw new Error('Escrow not found');
  }

  // Chỉ client mới được mở dispute — contract raiseDispute() có _onlyClient modifier.
  // Freelancer gọi on-chain sẽ revert; reject sớm ở đây để tránh DB record "mồ côi".
  const isClient = escrow.client.equals(req.user._id);
  if (!isClient) {
    res.status(403);
    throw new Error('Only the client of this escrow can raise a dispute');
  }

  if (!escrow.escrowIdOnChain) {
    res.status(400);
    throw new Error('This escrow does not have an on-chain ID yet. Cannot raise a dispute.');
  }

  // Không cho tạo dispute mới nếu escrow đã RELEASED/REFUNDED/CANCELLED
  // (tiền đã xử lý xong, dispute lúc này không còn ý nghĩa)
  const finalStates = [ESCROW_STATUS.RELEASED, ESCROW_STATUS.REFUNDED, ESCROW_STATUS.CANCELLED];
  if (finalStates.includes(escrow.status)) {
    res.status(400);
    throw new Error(`Cannot raise a dispute when escrow status is '${escrow.status}'.`);
  }

  const existing = await Dispute.findOne({ escrow: escrow._id, status: 'OPEN' });
  if (existing) {
    res.status(400);
    throw new Error('Escrow này đã có tranh chấp đang mở (OPEN). Không thể tạo thêm.');
  }

  const dispute = await Dispute.create({
    escrow: escrow._id,
    escrowIdOnChain: escrow.escrowIdOnChain,
    raisedBy: req.user._id,
    reason,
    evidenceFiles: Array.isArray(evidenceFiles) ? evidenceFiles : [],
  });

  res.status(201).json({
    success: true,
    message:
      'Dispute record created. Please proceed to call raiseDispute() on-chain via your wallet to formally open the dispute.',
    dispute,
  });
});

// ==================== PATCH /api/disputes/:id/raise-tx ====================
/**
 * Gắn txHash của giao dịch raiseDispute on-chain vào dispute record
 * (gọi sau khi frontend đã raiseDisputeOnChain() và tx confirm)
 * Body: { raiseTxHash, evidenceURIOnChain? }
 * Response: { success, dispute }
 */
const attachRaiseTx = asyncHandler(async (req, res) => {
  const { raiseTxHash, evidenceURIOnChain } = req.body;

  if (!raiseTxHash) {
    res.status(400);
    throw new Error('raiseTxHash is required');
  }

  const dispute = await Dispute.findById(req.params.id);
  if (!dispute) {
    res.status(404);
    throw new Error('Dispute not found');
  }

  if (!dispute.raisedBy.equals(req.user._id)) {
    res.status(403);
    throw new Error('Only the user who raised this dispute can attach the transaction hash');
  }

  dispute.raiseTxHash = raiseTxHash;
  if (evidenceURIOnChain) dispute.evidenceURIOnChain = evidenceURIOnChain;
  await dispute.save();

  res.json({ success: true, dispute });
});

// ==================== GET /api/disputes ====================
/**
 * Danh sách disputes.
 * - Admin: xem tất cả (lọc theo status nếu có)
 * - Client/Freelancer: chỉ xem disputes của escrow mà họ tham gia
 * Query params: status, page, limit
 * Response: { success, count, total, pages, currentPage, disputes }
 */
const getDisputes = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  if (req.user.role !== USER_ROLES.ADMIN) {
    // Tìm escrows mà user này tham gia, rồi lọc dispute theo các escrow đó
    const myEscrows = await Escrow.find({
      $or: [{ client: req.user._id }, { freelancer: req.user._id }],
    }).select('_id');
    filter.escrow = { $in: myEscrows.map((e) => e._id) };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [disputes, total] = await Promise.all([
    Dispute.find(filter)
      .populate('escrow', 'serviceName amount status client freelancer')
      .populate('raisedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip),
    Dispute.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: disputes.length,
    total,
    pages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    disputes,
  });
});

// ==================== GET /api/disputes/:id ====================
/**
 * Chi tiết 1 dispute
 * Response: { success, dispute }
 */
const getDisputeById = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id)
    .populate('escrow', 'serviceName amount status client freelancer')
    .populate('raisedBy', 'name email role')
    .populate('resolvedBy', 'name email role');

  if (!dispute) {
    res.status(404);
    throw new Error('Dispute not found');
  }

  const isAdmin = req.user.role === USER_ROLES.ADMIN;
  const isClient = dispute.escrow.client.equals(req.user._id);
  const isFreelancer = dispute.escrow.freelancer.equals(req.user._id);

  if (!isAdmin && !isClient && !isFreelancer) {
    res.status(403);
    throw new Error('You are not authorized to view this dispute');
  }

  res.json({ success: true, dispute });
});

// ==================== PATCH /api/disputes/:id/resolve ====================
/**
 * Admin trigger finalizeDispute() on-chain bằng admin wallet.
 * Contract v2 không có resolveDispute() — kết quả do reviewer voting quyết định.
 * Admin chỉ trigger finalization; contract tự revert nếu chưa đủ điều kiện
 * (chưa đủ 9 phiếu VÀ chưa hết 3 ngày).
 *
 * Body: { resolutionNote? }
 * Response: { success, dispute, txHash, blockNumber }
 *
 * Escrow.status sẽ tự chuyển RELEASED/REFUNDED khi eventListener bắt được
 * event DisputeFinalized/FundsReleased/ClientRefunded từ giao dịch này.
 */
const resolveDisputeController = asyncHandler(async (req, res) => {
  if (req.user.role !== USER_ROLES.ADMIN) {
    res.status(403);
    throw new Error('Only admin can resolve disputes');
  }

  const { resolutionNote } = req.body;

  const dispute = await Dispute.findById(req.params.id).populate('escrow');
  if (!dispute) {
    res.status(404);
    throw new Error('Dispute not found');
  }

  if (!['OPEN', 'REVIEWING'].includes(dispute.status)) {
    res.status(400);
    throw new Error(`Dispute cannot be finalized (status: ${dispute.status})`);
  }

  // Trigger finalizeDispute() on-chain — contract kiểm tra đủ điều kiện
  // (≥9 phiếu hoặc hết 3 ngày). Nếu chưa đủ, contract revert và
  // error.middleware.js sẽ trả error message gốc từ ethers.js về client.
  const { txHash, blockNumber } = await finalizeDisputeOnChain(dispute.escrowIdOnChain);

  if (resolutionNote) dispute.resolutionNote = resolutionNote;
  dispute.resolvedBy    = req.user._id;
  dispute.resolvedAt    = new Date();
  dispute.resolveTxHash = txHash;
  dispute.finalizedAt   = new Date();
  dispute.finalizeTxHash = txHash;
  // Status sẽ được set chính xác bởi eventListener khi DisputeFinalized confirm.
  // Tạm set REVIEWING để frontend biết "đang xử lý" nếu status vẫn là OPEN.
  if (dispute.status === 'OPEN') dispute.status = 'REVIEWING';
  await dispute.save();

  const escrow = dispute.escrow;
  await createNotificationForMany([escrow.client, escrow.freelancer], {
    type: NOTIFICATION_TYPES.DISPUTE_RESOLVED,
    title: 'Dispute Finalized',
    message: `The dispute for "${escrow.serviceName}" has been finalized on-chain. Result will be confirmed shortly.`,
    escrow: escrow._id,
  });

  res.json({
    success: true,
    message: 'Dispute finalized on-chain. Escrow status will update once the transaction is indexed.',
    dispute,
    txHash,
    blockNumber,
  });
});

// ==================== POST /api/disputes/:id/vote ====================
/**
 * Ghi nhận phiếu bầu vào DB SAU KHI đã castDisputeVote() on-chain thành công.
 * Reviewer tự ký giao dịch on-chain qua MetaMask (frontend) → lấy txHash → gọi API này.
 *
 * Eligibility (v2 — context-based):
 *   - User phải có walletAddress trong DB
 *   - walletAddress phải được whitelist on-chain (isReviewer[address] == true)
 *   - DB role KHÔNG còn là tiêu chí — contract là source of truth
 *
 * Body: {
 *   txHash,              // bắt buộc — hash giao dịch on-chain đã confirm
 *   voteForFreelancer,   // boolean — true: freelancer thắng, false: client thắng
 *   reason,              // string — lý do (mirror của reason on-chain)
 *   // checklist (7 mục — mirror của DisputeChecklist struct on-chain):
 *   deliverablesMatch, acceptanceCriteriaMet, deadlineMet,
 *   revisionHistoryReviewed, submissionHistoryReviewed,
 *   blockchainTimelineReviewed, evidenceReviewed
 * }
 */
const recordVote = asyncHandler(async (req, res) => {
  // Kiểm tra user có wallet chưa
  if (!req.user.walletAddress) {
    res.status(403);
    throw new Error('You must connect a wallet before voting on disputes');
  }

  // Kiểm tra wallet có trong whitelist reviewer on-chain không
  // Contract là source of truth — không check DB role
  const isEligible = await checkIsReviewerOnChain(req.user.walletAddress);
  if (!isEligible) {
    res.status(403);
    throw new Error('Your wallet is not registered as a reviewer on-chain. Please connect your wallet first.');
  }

  const { txHash, voteForFreelancer, reason,
    deliverablesMatch, acceptanceCriteriaMet, deadlineMet,
    revisionHistoryReviewed, submissionHistoryReviewed,
    blockchainTimelineReviewed, evidenceReviewed } = req.body;

  if (!txHash || typeof voteForFreelancer !== 'boolean') {
    res.status(400);
    throw new Error('txHash and voteForFreelancer (boolean) are required');
  }

  const dispute = await Dispute.findById(req.params.id);
  if (!dispute) {
    res.status(404);
    throw new Error('Dispute not found');
  }

  if (!['OPEN', 'REVIEWING'].includes(dispute.status)) {
    res.status(400);
    throw new Error(`Cannot vote on a dispute with status '${dispute.status}'`);
  }

  // Kiểm tra reviewer chưa bỏ phiếu cho dispute này
  const alreadyVoted = dispute.votes.some(v => v.reviewer.equals(req.user._id));
  if (alreadyVoted) {
    res.status(400);
    throw new Error('You have already submitted a vote for this dispute');
  }

  dispute.votes.push({
    reviewer: req.user._id,
    txHash: txHash.toLowerCase(),
    voteForFreelancer,
    reason,
    deliverablesMatch:          !!deliverablesMatch,
    acceptanceCriteriaMet:      !!acceptanceCriteriaMet,
    deadlineMet:                !!deadlineMet,
    revisionHistoryReviewed:    !!revisionHistoryReviewed,
    submissionHistoryReviewed:  !!submissionHistoryReviewed,
    blockchainTimelineReviewed: !!blockchainTimelineReviewed,
    evidenceReviewed:           !!evidenceReviewed,
    votedAt: new Date(),
  });

  if (dispute.status === 'OPEN') {
    dispute.status = 'REVIEWING';
    dispute.reviewStartedAt = new Date();
  }

  await dispute.save();

  res.json({ success: true, message: 'Vote recorded', totalVotes: dispute.votes.length, dispute });
});

// ==================== POST /api/disputes/:id/finalize ====================
/**
 * Trigger finalizeDispute() on-chain bằng admin wallet.
 * Có thể gọi sau khi đủ 9 phiếu hoặc hết 3 ngày (contract tự kiểm tra).
 * Bất kỳ ai cũng được phép gọi endpoint này — contract sẽ revert nếu chưa đủ điều kiện.
 */
const finalizeDisputeController = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id).populate('escrow', 'serviceName escrowIdOnChain client freelancer');
  if (!dispute) {
    res.status(404);
    throw new Error('Dispute not found');
  }

  if (!['OPEN', 'REVIEWING'].includes(dispute.status)) {
    res.status(400);
    throw new Error(`Dispute already finalized (status: ${dispute.status})`);
  }

  const { txHash, blockNumber } = await finalizeDisputeOnChain(dispute.escrowIdOnChain);

  dispute.finalizedAt   = new Date();
  dispute.finalizeTxHash = txHash;
  // Status sẽ được cập nhật chính xác qua eventListener khi chain emit DisputeFinalized.
  // Tạm set REVIEWING để báo "đang xử lý" — eventListener sẽ set RESOLVED_RELEASE/REFUND.
  if (dispute.status === 'OPEN') dispute.status = 'REVIEWING';
  await dispute.save();

  await createNotificationForMany([dispute.escrow.client, dispute.escrow.freelancer], {
    type: NOTIFICATION_TYPES.DISPUTE_RESOLVED,
    title: 'Dispute Finalized',
    message: `The dispute for "${dispute.escrow.serviceName}" has been finalized on-chain. Result will be confirmed shortly.`,
    escrow: dispute.escrow._id,
  });

  res.json({
    success: true,
    message: 'finalizeDispute called on-chain. Escrow status will update once the transaction is indexed.',
    txHash,
    blockNumber,
  });
});

module.exports = {
  createDispute,
  attachRaiseTx,
  getDisputes,
  getDisputeById,
  resolveDispute: resolveDisputeController,
  recordVote,
  finalizeDispute: finalizeDisputeController,
};
