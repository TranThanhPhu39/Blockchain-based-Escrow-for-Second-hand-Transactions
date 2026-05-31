// ============================================================
// controllers/escrow.controller.js — Xử lý Escrow operations
//
// Backend 1 chịu trách nhiệm:
// - Tạo escrow record trong DB
// - Xem danh sách và chi tiết escrow
// - Seller update shipping info
// - Buyer confirm delivery
//
// Status LOCKED được set bởi Backend 3 (blockchain event listener)
// khi nhận được event FundsDeposited từ smart contract
// ============================================================

const Escrow = require('../models/Escrow');
const User = require('../models/User');
const { ESCROW_STATUS, USER_ROLES } = require('../utils/constants');
const asyncHandler = require('../utils/asyncHandler');

// ==================== POST /api/escrows ====================
/**
 * Buyer tạo escrow mới
 * Body: { sellerWalletAddress, itemName, itemDescription, amount }
 * Response: { success, escrow }
 */
const createEscrow = asyncHandler(async (req, res) => {
  const { sellerWalletAddress, itemName, itemDescription, amount } = req.body;

  // Validate required fields
  if (!sellerWalletAddress || !itemName || !amount) {
    res.status(400);
    throw new Error('sellerWalletAddress, itemName, and amount are required');
  }

  // Tìm seller bằng wallet address
  // Buyer nhập wallet address của seller khi tạo escrow
  const seller = await User.findOne({
    walletAddress: sellerWalletAddress.toLowerCase(),
  });

  if (!seller) {
    res.status(404);
    throw new Error('Seller with this wallet address not found. Seller must register first.');
  }

  // Buyer và seller không được là cùng 1 người
  // _id.equals() dùng cho ObjectId comparison (không dùng ===)
  if (seller._id.equals(req.user._id)) {
    res.status(400);
    throw new Error('Buyer and seller cannot be the same person');
  }

  // Tạo escrow document trong MongoDB
  // Lúc này chưa có tiền — smart contract chưa được gọi
  // Frontend sẽ gọi smart contract deposit SAU KHI nhận escrow._id
  const escrow = await Escrow.create({
    buyer: req.user._id,
    seller: seller._id,
    itemName,
    itemDescription,
    amount,
    status: ESCROW_STATUS.CREATED,
  });

  // Populate để trả về thông tin đầy đủ ngay
  const populatedEscrow = await Escrow.findById(escrow._id)
    .populate('buyer', 'name email walletAddress')
    .populate('seller', 'name email walletAddress');

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
    // Buyer/Seller chỉ thấy escrows mà họ tham gia
    // $or: điều kiện HOẶC — là buyer HOẶC là seller
    filter.$or = [{ buyer: req.user._id }, { seller: req.user._id }];
    if (status) filter.status = status;
  }

  // Tính số documents để bỏ qua (pagination)
  // page=2, limit=10 → skip=10 (bỏ qua 10 docs đầu)
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Chạy 2 queries song song với Promise.all để tối ưu performance
  // Thay vì chờ query 1 xong rồi mới query 2, chạy đồng thời
  const [escrows, total] = await Promise.all([
    Escrow.find(filter)
      .populate('buyer', 'name email walletAddress')
      .populate('seller', 'name email walletAddress')
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
    .populate('buyer', 'name email walletAddress')
    .populate('seller', 'name email walletAddress');

  if (!escrow) {
    res.status(404);
    throw new Error('Escrow not found');
  }

  // Kiểm tra quyền truy cập: chỉ buyer, seller, hoặc admin
  const isBuyer = escrow.buyer._id.equals(req.user._id);
  const isSeller = escrow.seller._id.equals(req.user._id);
  const isAdmin = req.user.role === USER_ROLES.ADMIN;

  if (!isBuyer && !isSeller && !isAdmin) {
    res.status(403);
    throw new Error('You are not authorized to view this escrow');
  }

  res.json({ success: true, escrow });
});

// ==================== PATCH /api/escrows/:id/shipping ====================
/**
 * Seller cập nhật thông tin shipping
 * Body: { carrier, trackingNumber, estimatedDelivery? }
 * Response: { success, escrow }
 */
const updateShipping = asyncHandler(async (req, res) => {
  const { carrier, trackingNumber, estimatedDelivery } = req.body;

  if (!carrier || !trackingNumber) {
    res.status(400);
    throw new Error('carrier and trackingNumber are required');
  }

  const escrow = await Escrow.findById(req.params.id);

  if (!escrow) {
    res.status(404);
    throw new Error('Escrow not found');
  }

  // Chỉ seller của escrow này được update
  if (!escrow.seller.equals(req.user._id)) {
    res.status(403);
    throw new Error('Only the seller can update shipping information');
  }

  // Chỉ update khi đang ở LOCKED (buyer đã deposit tiền)
  // Nếu CREATED: buyer chưa trả tiền, seller không nên gửi hàng
  if (escrow.status !== ESCROW_STATUS.LOCKED) {
    res.status(400);
    throw new Error(
      `Cannot update shipping when escrow status is '${escrow.status}'. Escrow must be LOCKED.`
    );
  }

  // Cập nhật shipping info và chuyển status sang SHIPPED
  escrow.shippingInfo = {
    carrier,
    trackingNumber,
    shippedAt: new Date(),
    estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
  };
  escrow.status = ESCROW_STATUS.SHIPPED;

  // Auto release sau X ngày nếu buyer không confirm
  const autoReleaseDays = parseInt(process.env.AUTO_RELEASE_DAYS) || 7;
  escrow.autoReleaseAt = new Date(Date.now() + autoReleaseDays * 24 * 60 * 60 * 1000);

  await escrow.save();

  const updatedEscrow = await Escrow.findById(escrow._id)
    .populate('buyer', 'name email walletAddress')
    .populate('seller', 'name email walletAddress');

  res.json({
    success: true,
    message: 'Shipping information updated. Escrow status changed to SHIPPED.',
    escrow: updatedEscrow,
  });
});

// ==================== PATCH /api/escrows/:id/confirm ====================
/**
 * Buyer xác nhận đã nhận hàng → trigger release funds
 * Response: { success, escrow }
 *
 * Lưu ý: Việc thực sự release tiền trên blockchain được thực hiện bởi Backend 3
 * Ở đây chỉ đánh dấu intent trong DB, Backend 3 sẽ gọi smart contract
 */
const confirmDelivery = asyncHandler(async (req, res) => {
  const escrow = await Escrow.findById(req.params.id);

  if (!escrow) {
    res.status(404);
    throw new Error('Escrow not found');
  }

  // Chỉ buyer mới được confirm
  if (!escrow.buyer.equals(req.user._id)) {
    res.status(403);
    throw new Error('Only the buyer can confirm delivery');
  }

  // Chỉ confirm khi đang ở SHIPPED
  if (escrow.status !== ESCROW_STATUS.SHIPPED) {
    res.status(400);
    throw new Error(
      `Cannot confirm delivery when escrow status is '${escrow.status}'. Escrow must be SHIPPED.`
    );
  }

  // Đánh dấu để Backend 3 biết cần release
  // Backend 3 sẽ gọi smart contract releaseFunds(escrowIdOnChain)
  // Sau khi smart contract emit FundsReleased event, Backend 3 update status → RELEASED
  escrow.status = ESCROW_STATUS.RELEASED;
  await escrow.save();

  res.json({
    success: true,
    message: 'Delivery confirmed. Funds will be released to seller.',
    escrow,
  });
});

module.exports = {
  createEscrow,
  getEscrows,
  getEscrowById,
  updateShipping,
  confirmDelivery,
};
