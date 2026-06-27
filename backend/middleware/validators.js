// ============================================================
// middleware/validators.js — Server-side input validation
// Dùng express-validator. Wire vào routes trước controller.
// ============================================================

const { body, validationResult } = require('express-validator');

/**
 * Middleware cuối trong chuỗi validator — kiểm tra kết quả.
 * Nếu có lỗi → 400 với danh sách lỗi rõ ràng.
 * Nếu không → gọi next() để controller xử lý tiếp.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ==================== AUTH ====================

const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name must be at most 100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

// ==================== ESCROW ====================

const createEscrowRules = [
  body('serviceName')
    .trim()
    .notEmpty().withMessage('Service name is required')
    .isLength({ max: 200 }).withMessage('Service name must be at most 200 characters'),

  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isNumeric().withMessage('Amount must be a number')
    .custom((val) => Number(val) > 0).withMessage('Amount must be greater than 0'),

  body('deadline')
    .optional()
    .isISO8601().withMessage('Deadline must be a valid ISO 8601 date')
    .custom((val) => new Date(val) > new Date()).withMessage('Deadline must be in the future'),
];

// ==================== DISPUTE ====================

const createDisputeRules = [
  body('escrowId')
    .notEmpty().withMessage('escrowId is required')
    .isMongoId().withMessage('escrowId must be a valid MongoDB ObjectId'),

  body('reason')
    .trim()
    .notEmpty().withMessage('Dispute reason is required')
    .isLength({ max: 1000 }).withMessage('Reason must be at most 1000 characters'),
];

module.exports = {
  validateRequest,
  registerRules,
  loginRules,
  createEscrowRules,
  createDisputeRules,
};
