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
  LOCKED: 'LOCKED',      // Client đã deposit tiền vào smart contract
  IN_PROGRESS: 'IN_PROGRESS', // Freelancer đang thực hiện công việc
  SUBMITTED: 'SUBMITTED', // Freelancer đã submit deliverable, chờ client approve
  // ⚠️ FIX (approveWork desync): trạng thái trung gian — Client đã approve
  // qua API (đánh dấu Ý ĐỊNH release), nhưng tiền on-chain CHƯA chắc đã
  // được release thật (Client vẫn cần tự ký confirmDelivery() qua wallet).
  // Chỉ chuyển sang RELEASED khi eventListener.service.js nhận được event
  // FundsReleased thật từ chain (xem handleFundsReleased). Tránh để DB
  // ghi nhận RELEASED trong khi tiền vẫn còn kẹt trong contract (ví dụ
  // Client approve xong nhưng từ chối ký / hết gas / mất kết nối khi gọi
  // confirmDelivery on-chain).
  APPROVED: 'APPROVED',
  DISPUTED: 'DISPUTED',  // Client raise dispute, đang chờ admin giải quyết
  RELEASED: 'RELEASED',  // Giao dịch hoàn tất, tiền release cho freelancer (đã xác nhận on-chain)
  REFUNDED: 'REFUNDED',  // Client được hoàn tiền (dispute thắng hoặc cancel)
  CANCELLED: 'CANCELLED',// Escrow bị hủy trước khi lock
};

const USER_ROLES = {
  CLIENT: 'client',         // Người thuê dịch vụ
  FREELANCER: 'freelancer', // Người cung cấp dịch vụ
  ADMIN: 'admin',           // Quản trị viên / Juror giải quyết dispute
};

module.exports = { ESCROW_STATUS, USER_ROLES };
