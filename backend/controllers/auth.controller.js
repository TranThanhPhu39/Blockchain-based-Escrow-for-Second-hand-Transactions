// ============================================================
// controllers/auth.controller.js — Xử lý authentication
//
// Controller nhận req, xử lý business logic, trả về res
// ============================================================

const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');

// ==================== POST /api/auth/register ====================
/**
 * Đăng ký tài khoản mới
 * Body: { name, email, password, role? }
 * Response: { success, token, user }
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Kiểm tra email đã tồn tại chưa
  // Mặc dù schema có unique: true nhưng lỗi duplicate key từ Mongoose
  // không có message thân thiện → check trước để trả lỗi rõ ràng hơn
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400); // Set status trước khi throw để error middleware dùng
    throw new Error('Email is already registered');
  }

  // Tạo user mới — password sẽ được hash tự động qua pre('save') hook
  const user = await User.create({ name, email, password, role });

  // Trả về token ngay sau khi đăng ký
  // User không cần login lại → trải nghiệm tốt hơn
  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      // KHÔNG trả về password (dù đã hash)
    },
  });
});

// ==================== POST /api/auth/login ====================
/**
 * Đăng nhập
 * Body: { email, password }
 * Response: { success, token, user }
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Tìm user theo email, cần lấy thêm password để so sánh
  // .select('+password'): override select: false trong schema
  // Dấu '+' nghĩa là "thêm field này vào kết quả"
  const user = await User.findOne({ email }).select('+password');

  // Kiểm tra user tồn tại VÀ password đúng trong cùng 1 điều kiện
  // Tại sao? Bảo mật: không muốn tiết lộ "email không tồn tại" hay "sai password"
  // Attacker biết email tồn tại → có thể brute force password
  // Thông báo chung chung: "Invalid credentials" → an toàn hơn
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    success: true,
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress,
    },
  });
});

// ==================== GET /api/auth/me ====================
/**
 * Lấy thông tin user đang đăng nhập
 * Header: Authorization: Bearer <token>
 * Response: { success, user }
 */
const getMe = asyncHandler(async (req, res) => {
  // req.user đã được gán bởi protect middleware
  // Không cần query DB lại vì protect đã query rồi
  res.json({
    success: true,
    user: req.user,
  });
});

// ==================== PATCH /api/auth/wallet ====================
/**
 * Cập nhật wallet address cho user
 * Body: { walletAddress }
 * Response: { success, user }
 */
const updateWallet = asyncHandler(async (req, res) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    res.status(400);
    throw new Error('Wallet address is required');
  }

  // Validate format Ethereum address (bắt đầu bằng 0x, 42 ký tự)
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!ethAddressRegex.test(walletAddress)) {
    res.status(400);
    throw new Error('Invalid Ethereum wallet address format');
  }

  const duplicate = await User.findOne({ walletAddress: walletAddress.toLowerCase(), _id: { $ne: req.user._id } });
  if (duplicate) {
    res.status(400);
    throw new Error('This wallet address is already registered to another account');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { walletAddress: walletAddress.toLowerCase() },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress,
    },
  });
});

// ==================== PATCH /api/auth/users/:userId/promote-reviewer ====================
/**
 * Admin promote một user lên role reviewer.
 * Đồng thời gọi addReviewer(walletAddress) on-chain để whitelist ví của họ.
 * Body: (không cần)
 * Response: { success, user, txHash }
 */
const { addReviewerOnChain, removeReviewerOnChain } = require('../services/blockchain.service');
const { USER_ROLES } = require('../utils/constants');

const promoteToReviewer = asyncHandler(async (req, res) => {
  if (req.user.role !== USER_ROLES.ADMIN) {
    res.status(403);
    throw new Error('Only admin can promote users to reviewer');
  }

  const target = await User.findById(req.params.userId);
  if (!target) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!target.walletAddress) {
    res.status(400);
    throw new Error('User must have a connected wallet address before becoming a reviewer');
  }

  if (target.role === USER_ROLES.REVIEWER) {
    res.status(400);
    throw new Error('User is already a reviewer');
  }

  // Gọi on-chain trước — nếu revert thì không đổi DB
  const { txHash, blockNumber } = await addReviewerOnChain(target.walletAddress);

  target.role = USER_ROLES.REVIEWER;
  await target.save();

  res.json({
    success: true,
    message: `${target.name} has been promoted to reviewer`,
    user: { id: target._id, name: target.name, email: target.email, role: target.role, walletAddress: target.walletAddress },
    txHash,
    blockNumber,
  });
});

// ==================== PATCH /api/auth/users/:userId/demote-reviewer ====================
/**
 * Admin xoá role reviewer — gọi removeReviewer on-chain + đổi DB về 'client'.
 */
const demoteReviewer = asyncHandler(async (req, res) => {
  if (req.user.role !== USER_ROLES.ADMIN) {
    res.status(403);
    throw new Error('Only admin can demote reviewers');
  }

  const target = await User.findById(req.params.userId);
  if (!target) {
    res.status(404);
    throw new Error('User not found');
  }

  if (target.role !== USER_ROLES.REVIEWER) {
    res.status(400);
    throw new Error('User is not a reviewer');
  }

  const { txHash, blockNumber } = await removeReviewerOnChain(target.walletAddress);

  target.role = USER_ROLES.CLIENT;
  await target.save();

  res.json({
    success: true,
    message: `${target.name} has been demoted from reviewer`,
    user: { id: target._id, name: target.name, email: target.email, role: target.role },
    txHash,
    blockNumber,
  });
});

module.exports = { register, login, getMe, updateWallet, promoteToReviewer, demoteReviewer };
