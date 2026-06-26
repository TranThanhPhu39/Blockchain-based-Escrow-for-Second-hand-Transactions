// ============================================================
// controllers/escrow.controller.js — Xử lý Escrow operations
//
// Backend 1 chịu trách nhiệm:
// - Tạo escrow record trong DB
// - Xem danh sách và chi tiết escrow
// - Freelancer submit deliverable
// - Client approve work (xác nhận công việc hoàn thành)
//
// Status LOCKED được set bởi Backend 3 (blockchain event listener)
// khi nhận được event FundsDeposited từ smart contract
//
// ⚠️ FIX (escrowIdOnChain):
// Trước đây escrowIdOnChain CHỈ được set bởi Backend 3 (event listener)
// khi nhận event EscrowCreated/FundsDeposited từ blockchain. Vấn đề:
// nếu listener bỏ lỡ event đó (rớt kết nối, lỗi filter, server restart
// giữa lúc xử lý...), escrow trong DB sẽ KHÔNG BAO GIỜ có escrowIdOnChain,
// nên mọi event on-chain sau này (FundsDeposited, FundsReleased, ...)
// không tìm được escrow tương ứng trong DB → bị log "not found" và bỏ qua.
//
// → Giải pháp: set escrowIdOnChain NGAY LÚC TẠO escrow trong createEscrow,
// bằng cách encode escrow._id (ObjectId, 12 byte) sang bytes32 (pad thêm
// 20 byte số 0 ở cuối — đúng theo cách contract/frontend đang dùng
// escrow._id làm escrowId khi gọi createEscrow() on-chain).
// Như vậy DB luôn biết TRƯỚC escrowId on-chain sẽ là gì, không phụ thuộc
// vào việc listener có bắt được event hay không. Listener vẫn cần chạy
// để cập nhật status (LOCKED, RELEASED, ...), nhưng việc tìm escrow theo
// escrowIdOnChain sẽ luôn thành công ngay từ đầu.
// ============================================================

const Escrow = require('../models/Escrow');
const User = require('../models/User');
const { ESCROW_STATUS, USER_ROLES } = require('../utils/constants');
const asyncHandler = require('../utils/asyncHandler');

// ============================================================
// FIX: Encode MongoDB ObjectId (12 byte / 24 hex char) sang bytes32
// (32 byte / 64 hex char) bằng cách pad thêm 20 byte số 0 ở bên phải.
//
// Đây là CÙNG quy tắc mà services/eventListener.service.js đang dùng
// để decode escrowId on-chain ngược lại — chỉ là chiều ngược lại.
// Ví dụ: ObjectId "6a361d618f4227c1b149ddd3" (24 hex char)
//     → "0x6a361d618f4227c1b149ddd30000000000000000000000000000000000000000"
//        (64 hex char sau "0x", tức 32 byte)
//
// QUAN TRỌNG: nếu frontend/contract dùng quy tắc encode KHÁC (ví dụ pad
// bên trái thay vì bên phải, hoặc dùng ethers.zeroPadValue/hexlify khác
// cách này), phải sửa hàm này để khớp 100% với cách frontend gọi
// createEscrow() on-chain — nếu không, escrowIdOnChain set ở đây sẽ
// không khớp với escrowId thật mà contract emit ra.
// ============================================================
const objectIdToBytes32 = (objectId) => {
  const hex = objectId.toString(); // 24 hex char
  const padded = hex.padEnd(64, '0'); // pad thêm '0' bên phải cho đủ 64 hex char (32 byte)
  return `0x${padded}`.toLowerCase();
};

// ==================== POST /api/escrows ====================
/**
 * Client đăng hợp đồng mới (chưa có freelancer)
 * Body: { serviceName, jobDescription, amount, deadline? }
 * Response: { success, escrow }
 */
const createEscrow = asyncHandler(async (req, res) => {
  const {
    // Core (required)
    serviceName, amount,
    // Job Information
    serviceCategory, skillRequirements, jobDescription,
    // Financial Terms
    paymentToken, gasFeeResponsibility,
    // Deliverables
    expectedDeliverables, deliverableFormat, submissionLinkRequirement,
    // Acceptance Criteria
    acceptanceChecklist, qualityStandard, testingRequirement,
    // Timeline
    deadline, gracePeriod, reviewPeriod, autoReleasePeriod,
    // Revision Policy
    numberOfRevisions, revisionScope,
    // Cancellation Policy
    clientCancellationRule, freelancerWithdrawalRule, refundRule,
    // Evidence Rules
    acceptedEvidenceTypes, timestampSource, communicationLogUsage,
    // Dispute Resolution
    disputeReasons, evidenceUploadRequirement, reviewerDecisionOptions, appealPolicy,
    // Legal & Ownership
    intellectualPropertyTransfer, confidentialityRequirement, commercialUsageRights,
    // Integrity
    contractMetadataHash,
  } = req.body;

  if (!serviceName || !amount) {
    res.status(400);
    throw new Error('serviceName and amount are required');
  }

  const escrow = await Escrow.create({
    client: req.user._id,
    // Job Information
    serviceName,
    serviceCategory,
    skillRequirements,
    jobDescription,
    // Financial Terms
    amount,
    paymentToken:         paymentToken || 'USDT',
    gasFeeResponsibility: gasFeeResponsibility || 'client',
    // Deliverables
    expectedDeliverables,
    deliverableFormat:         Array.isArray(deliverableFormat) ? deliverableFormat : [],
    submissionLinkRequirement: submissionLinkRequirement || 'required',
    // Acceptance Criteria
    acceptanceChecklist: Array.isArray(acceptanceChecklist) ? acceptanceChecklist : [],
    qualityStandard,
    testingRequirement:  testingRequirement || 'none',
    // Timeline
    deadline:          deadline ? new Date(deadline) : undefined,
    gracePeriod:       gracePeriod       !== undefined ? Number(gracePeriod)       : 1,
    reviewPeriod:      reviewPeriod      !== undefined ? Number(reviewPeriod)      : 3,
    autoReleasePeriod: autoReleasePeriod !== undefined ? Number(autoReleasePeriod) : 5,
    // Revision Policy
    numberOfRevisions: numberOfRevisions || '2',
    revisionScope,
    // Cancellation Policy
    clientCancellationRule,
    freelancerWithdrawalRule,
    refundRule,
    // Evidence Rules
    acceptedEvidenceTypes: Array.isArray(acceptedEvidenceTypes) ? acceptedEvidenceTypes : [],
    timestampSource:       timestampSource       || 'blockchain',
    communicationLogUsage: communicationLogUsage || 'allowed',
    // Dispute Resolution
    disputeReasons:           Array.isArray(disputeReasons)           ? disputeReasons           : [],
    evidenceUploadRequirement: evidenceUploadRequirement || 'both',
    reviewerDecisionOptions:  Array.isArray(reviewerDecisionOptions)  ? reviewerDecisionOptions  : [],
    appealPolicy:             appealPolicy || 'none',
    // Legal & Ownership
    intellectualPropertyTransfer,
    confidentialityRequirement: confidentialityRequirement || 'public',
    commercialUsageRights:      commercialUsageRights      || 'commercial',
    // Integrity
    contractMetadataHash,
    status: ESCROW_STATUS.CREATED,
  });

  // FIX: set escrowIdOnChain NGAY LÚC TẠO, không chờ event listener.
  // escrow._id vừa được Mongo sinh ra ở Escrow.create() phía trên,
  // nên ta encode nó sang bytes32 rồi lưu lại — đảm bảo escrow này
  // LUÔN tìm được qua escrowIdOnChain ngay từ khi vừa tạo, dù listener
  // có bắt được event on-chain hay không.
  escrow.escrowIdOnChain = objectIdToBytes32(escrow._id);
  await escrow.save();

  // Populate để trả về thông tin đầy đủ ngay
  const populatedEscrow = await Escrow.findById(escrow._id)
    .populate('client', 'name email walletAddress')
    .populate('freelancer', 'name email walletAddress');

  res.status(201).json({
    success: true,
    message: 'Escrow created. Please proceed to deposit funds via smart contract.',
    escrow: populatedEscrow,
  });
});

// ==================== GET /api/escrows ====================
/**
 * Lấy danh sách escrows của user hiện tại
 * Query params: status, page, limit
 * Response: { success, count, total, pages, escrows }
 */
const getEscrows = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  // Xây dựng filter query
  let filter = {};

  if (req.user.role === USER_ROLES.ADMIN) {
    // Admin thấy tất cả escrows
    if (status) filter.status = status;
  } else {
    // Client/Freelancer chỉ thấy escrows mà họ tham gia
    // $or: điều kiện HOẶC — là client HOẶC là freelancer
    filter.$or = [{ client: req.user._id }, { freelancer: req.user._id }];
    if (status) filter.status = status;
  }

  // Tính số documents để bỏ qua (pagination)
  // page=2, limit=10 → skip=10 (bỏ qua 10 docs đầu)
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Chạy 2 queries song song với Promise.all để tối ưu performance
  // Thay vì chờ query 1 xong rồi mới query 2, chạy đồng thời
  const [escrows, total] = await Promise.all([
    Escrow.find(filter)
      .populate('client', 'name email walletAddress')
      .populate('freelancer', 'name email walletAddress')
      .sort({ createdAt: -1 })   // Sắp xếp mới nhất trước (-1 = descending)
      .limit(parseInt(limit))
      .skip(skip),
    Escrow.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: escrows.length,
    total,
    pages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    escrows,
  });
});

// ==================== GET /api/escrows/:id ====================
/**
 * Lấy chi tiết một escrow
 * Params: id (MongoDB ObjectId)
 * Response: { success, escrow }
 */
const getEscrowById = asyncHandler(async (req, res) => {
  const escrow = await Escrow.findById(req.params.id)
    .populate('client', 'name email walletAddress')
    .populate('freelancer', 'name email walletAddress');

  if (!escrow) {
    res.status(404);
    throw new Error('Escrow not found');
  }

  // Kiểm tra quyền truy cập: chỉ client, freelancer, hoặc admin
  const isClient = escrow.client._id.equals(req.user._id);
  const isFreelancer = escrow.freelancer._id.equals(req.user._id);
  const isAdmin = req.user.role === USER_ROLES.ADMIN;

  if (!isClient && !isFreelancer && !isAdmin) {
    res.status(403);
    throw new Error('You are not authorized to view this escrow');
  }

  res.json({ success: true, escrow });
});

// ==================== PATCH /api/escrows/:id/submit ====================
/**
 * Freelancer submit deliverable (nộp bài)
 * Body: { deliverableUrl, workProof?, note? }
 * Response: { success, escrow }
 */
const submitDeliverable = asyncHandler(async (req, res) => {
  const { deliverableUrl, workProof, note } = req.body;

  if (!deliverableUrl) {
    res.status(400);
    throw new Error('deliverableUrl is required');
  }

  const escrow = await Escrow.findById(req.params.id);

  if (!escrow) {
    res.status(404);
    throw new Error('Escrow not found');
  }

  // Chỉ freelancer của escrow này được submit
  if (!escrow.freelancer.equals(req.user._id)) {
    res.status(403);
    throw new Error('Only the freelancer can submit deliverables');
  }

  // Chỉ submit khi đang ở LOCKED hoặc IN_PROGRESS
  // (client đã deposit tiền)
  if (escrow.status !== ESCROW_STATUS.LOCKED && escrow.status !== ESCROW_STATUS.IN_PROGRESS) {
    res.status(400);
    throw new Error(
      `Cannot submit deliverable when escrow status is '${escrow.status}'. Escrow must be LOCKED or IN_PROGRESS.`
    );
  }

  // Cập nhật deliverable info và chuyển status sang SUBMITTED
  escrow.deliverableInfo = {
    deliverableUrl,
    workProof,
    submittedAt: new Date(),
    note,
  };
  escrow.status = ESCROW_STATUS.SUBMITTED;

  // Auto release sau X ngày nếu client không approve
  const autoReleaseDays = parseInt(process.env.AUTO_RELEASE_DAYS) || 5;
  escrow.autoReleaseAt = new Date(Date.now() + autoReleaseDays * 24 * 60 * 60 * 1000);

  await escrow.save();

  const updatedEscrow = await Escrow.findById(escrow._id)
    .populate('client', 'name email walletAddress')
    .populate('freelancer', 'name email walletAddress');

  res.json({
    success: true,
    message: 'Deliverable submitted. Waiting for client approval.',
    escrow: updatedEscrow,
  });
});

// ==================== PATCH /api/escrows/:id/approve ====================
/**
 * Client approve công việc → trigger release funds cho freelancer
 * Response: { success, escrow }
 *
 * Lưu ý: Việc thực sự release tiền trên blockchain được thực hiện bởi Backend 3
 * Ở đây chỉ đánh dấu intent trong DB, Backend 3 sẽ gọi smart contract
 */
const approveWork = asyncHandler(async (req, res) => {
  const escrow = await Escrow.findById(req.params.id);

  if (!escrow) {
    res.status(404);
    throw new Error('Escrow not found');
  }

  // Chỉ client mới được approve
  if (!escrow.client.equals(req.user._id)) {
    res.status(403);
    throw new Error('Only the client can approve work');
  }

  // Chỉ approve khi đang ở SUBMITTED
  if (escrow.status !== ESCROW_STATUS.SUBMITTED) {
    res.status(400);
    throw new Error(
      `Cannot approve work when escrow status is '${escrow.status}'. Escrow must be SUBMITTED.`
    );
  }

  // Đánh dấu để Backend 3 biết cần release
  // Backend 3 sẽ gọi smart contract releaseFunds(escrowIdOnChain)
  // Sau khi smart contract emit FundsReleased event, Backend 3 update status → RELEASED
  escrow.status = ESCROW_STATUS.RELEASED;
  await escrow.save();

  res.json({
    success: true,
    message: 'Work approved. Funds will be released to freelancer.',
    escrow,
  });
});

// ==================== GET /api/escrows/available ====================
/**
 * Freelancer xem danh sách hợp đồng chưa có người nhận
 * Response: { success, count, escrows }
 */
const getAvailableEscrows = asyncHandler(async (req, res) => {
  const escrows = await Escrow.find({
    status: ESCROW_STATUS.CREATED,
    freelancer: null,
    client: { $ne: req.user._id },
  })
    .populate('client', 'name email walletAddress')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: escrows.length, escrows });
});

// ==================== PATCH /api/escrows/:id/lock ====================
/**
 * Freelancer nhận việc — gán bản thân vào escrow
 * Response: { success, escrow }
 */
const lockEscrow = asyncHandler(async (req, res) => {
  const escrow = await Escrow.findById(req.params.id);

  if (!escrow) {
    res.status(404);
    throw new Error('Escrow not found');
  }

  if (escrow.status !== ESCROW_STATUS.CREATED || escrow.freelancer) {
    res.status(400);
    throw new Error('This job is no longer available');
  }

  if (escrow.client.equals(req.user._id)) {
    res.status(400);
    throw new Error('Client cannot accept their own contract');
  }

  escrow.freelancer = req.user._id;
  await escrow.save();

  const updatedEscrow = await Escrow.findById(escrow._id)
    .populate('client', 'name email walletAddress')
    .populate('freelancer', 'name email walletAddress');

  res.json({
    success: true,
    message: 'Job accepted. Waiting for client to deposit funds.',
    escrow: updatedEscrow,
  });
});

module.exports = {
  createEscrow,
  getEscrows,
  getEscrowById,
  getAvailableEscrows,
  lockEscrow,
  submitDeliverable,
  approveWork,
};