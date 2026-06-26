// ============================================================
// routes/auth.routes.js — Định nghĩa các auth endpoints
//
// Router là mini Express app chỉ xử lý routes
// Được mount vào app.js với prefix /api/auth
// Kết quả: GET /api/auth/me, POST /api/auth/login, ...
// ============================================================

const express = require('express');
const { register, login, getMe, updateWallet, promoteToReviewer, demoteReviewer } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

// Public routes — không cần đăng nhập
router.post('/register', register);
router.post('/login', login);

// Protected routes — cần JWT token hợp lệ
// protect chạy trước, nếu pass thì chạy controller
router.get('/me', protect, getMe);
router.patch('/wallet', protect, updateWallet);

// Admin-only: promote / demote reviewer role (on-chain + DB)
router.patch('/users/:userId/promote-reviewer', protect, authorize('admin'), promoteToReviewer);
router.patch('/users/:userId/demote-reviewer',  protect, authorize('admin'), demoteReviewer);

module.exports = router;
