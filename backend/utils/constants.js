// ============================================================
// utils/constants.js — Single source of truth cho các giá trị hằng số
//
// TẠI SAO cần file này?
// - Tránh typo: 'LOCKED' vs 'locked' vs 'Locked'
// - Nếu cần đổi tên status, chỉ đổi 1 chỗ duy nhất
// - Backend 1, 2, 3 đều import từ đây → nhất quán
// ============================================================

const ESCROW_STATUS = {
  // ── EscrowContract v2 — 10 trạng thái (enum Status on-chain) ──────────────
  // Thứ tự khớp với uint8 trong contract: 0→CREATED, 1→ACCEPTED, ..., 9→CANCELLED
  CREATED:            'CREATED',            // 0 — Escrow vừa tạo trong DB, chờ freelancer nhận
  ACCEPTED:           'ACCEPTED',           // 1 — Freelancer đã acceptContract() on-chain
  DEPOSITED:          'DEPOSITED',          // 2 — Client đã depositFunds() on-chain
  SUBMITTED:          'SUBMITTED',          // 3 — Freelancer submitWork() xong, chờ client approve
  REVISION_REQUESTED: 'REVISION_REQUESTED', // 4 — Client requestRevision(), freelancer cần sửa lại
  DISPUTED:           'DISPUTED',           // 5 — Client raiseDispute(), đang chờ reviewer vote
  REVIEWING_DISPUTE:  'REVIEWING_DISPUTE',  // 6 — Có ít nhất 1 reviewer đã bỏ phiếu
  RELEASED:           'RELEASED',           // 7 — Tiền release cho freelancer (approveWork / dispute)
  REFUNDED:           'REFUNDED',           // 8 — Tiền hoàn về client (dispute thắng client)
  CANCELLED:          'CANCELLED',          // 9 — Escrow bị huỷ trước khi deposit

  // ── Legacy (contract v1) — giữ lại để backward compat ────────────────────
  // Escrow cũ trong DB và một số controller vẫn dùng các giá trị này.
  // Không xóa cho đến khi migration hoàn tất (Phase 2).
  LOCKED:      'LOCKED',       // ≈ DEPOSITED trong v1
  IN_PROGRESS: 'IN_PROGRESS',  // Không còn trong v2; freelancer tự làm việc sau DEPOSITED
};

const USER_ROLES = {
  // ── v2: context-based permissions ────────────────────────────────────────
  // Role gắn với user account; quyền thực tế xác định theo context:
  //   - USER tạo escrow → là "client" trong escrow đó
  //   - USER accept escrow → là "freelancer" trong escrow đó
  //   - USER eligible (wallet là reviewer on-chain) → được vote dispute
  USER:  'user',   // Người dùng thông thường — role mặc định kể từ v2
  ADMIN: 'admin',  // Quản trị viên hệ thống

  // ── Legacy (v1) — giữ lại để backward compat ─────────────────────────────
  // Users cũ trong DB vẫn có các role này. Không xóa cho đến khi hoàn tất
  // migration (Phase 2). Middleware sẽ treat CLIENT/FREELANCER/REVIEWER như USER.
  CLIENT:     'client',
  FREELANCER: 'freelancer',
  REVIEWER:   'reviewer',
};

module.exports = { ESCROW_STATUS, USER_ROLES };
