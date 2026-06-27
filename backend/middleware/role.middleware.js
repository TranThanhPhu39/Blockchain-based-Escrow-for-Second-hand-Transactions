// ============================================================
// middleware/role.middleware.js — Phân quyền theo role
//
// Dùng SAU protect middleware (cần req.user đã được set)
// Cho phép truyền vào nhiều roles được phép truy cập
//
// Ví dụ dùng:
//   router.delete('/:id', protect, authorize('admin'), deleteEscrow)
//   router.post('/', protect, authorize('user'), createEscrow)
//
// Backward compat (v1 → v2):
//   'client', 'freelancer', 'reviewer' đều được treat như 'user'.
//   Routes dùng authorize('reviewer') vẫn hoạt động với role 'reviewer'.
//   Routes mới dùng authorize('user') — chấp nhận cả legacy roles.
// ============================================================

// v1 roles được coi là tương đương 'user' trong v2
const LEGACY_USER_ROLES = new Set(['client', 'freelancer', 'reviewer']);

/**
 * Middleware kiểm tra role của user
 * @param {...string} roles - Danh sách roles được phép truy cập
 * @returns {Function} Express middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user.role;

    // Check 1: Direct match — hỗ trợ tất cả routes hiện tại không đổi
    // authorize('admin') với admin → pass
    // authorize('reviewer') với reviewer → pass (legacy dispute route)
    if (roles.includes(userRole)) return next();

    // Check 2: Legacy roles được treat như 'user' khi route cho phép 'user'
    // authorize('user') với 'client'/'freelancer'/'reviewer' → pass
    if (roles.includes('user') && LEGACY_USER_ROLES.has(userRole)) return next();

    // 403 Forbidden: đã xác thực (401) nhưng không có quyền (403)
    return next(
      Object.assign(
        new Error(`Role '${userRole}' is not authorized to access this route`),
        { statusCode: 403 }
      )
    );
  };
};

module.exports = { authorize };
