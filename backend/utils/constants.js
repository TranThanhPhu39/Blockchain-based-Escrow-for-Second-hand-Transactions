// ============================================================
// utils/constants.js — Single source of truth cho các giá trị hằng số
//
// TẠI SAO cần file này?
// - Tránh typo: 'LOCKED' vs 'locked' vs 'Locked'
// - Nếu cần đổi tên status, chỉ đổi 1 chỗ duy nhất
// - Backend 1, 2, 3 đều import từ đây → nhất quán
// ============================================================

const ESCROW_STATUS = {
  CREATED: 'CREATED',    // Escrow vừa được tạo trong DB, chưa có tiền
  LOCKED: 'LOCKED',      // Buyer đã deposit tiền vào smart contract
  SHIPPED: 'SHIPPED',    // Seller đã gửi hàng, có tracking number
  DISPUTED: 'DISPUTED',  // Buyer raise dispute, đang chờ admin giải quyết
  RELEASED: 'RELEASED',  // Giao dịch hoàn tất, tiền release cho seller
  REFUNDED: 'REFUNDED',  // Buyer được hoàn tiền (dispute thắng hoặc cancel)
  CANCELLED: 'CANCELLED',// Escrow bị hủy trước khi lock
};

const USER_ROLES = {
  BUYER: 'buyer',   // Người mua hàng
  SELLER: 'seller', // Người bán hàng
  ADMIN: 'admin',   // Quản trị viên / Juror giải quyết dispute
};

module.exports = { ESCROW_STATUS, USER_ROLES };
