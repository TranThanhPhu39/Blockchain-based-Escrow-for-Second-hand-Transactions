// ============================================================
// lib/api.js — Gọi REST API backend (Express)
//
// QUY ƯỚC:
// - Token JWT được lưu trong localStorage (key: "escrowx-token")
//   và TỰ ĐỘNG gắn vào header Authorization của mọi request sau
//   khi login/register thành công.
// - Mọi hàm export ở đây trả về data đã parse JSON (res.json()
//   của axios/fetch), hoặc throw Error với message lấy từ
//   response.message (đúng format mà error.middleware.js trả về:
//   { success: false, message: "..." }).
// - KHÔNG tự ý đổi format request/response ở đây — phải khớp
//   chính xác với backend/controllers/*.controller.js và
//   backend/routes/*.routes.js đã có trên nhánh dev.
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const TOKEN_KEY = "escrowx-token";

// ──────────────────────────────────────────────────────────
// TOKEN STORAGE
// ──────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// ──────────────────────────────────────────────────────────
// CORE: hàm fetch dùng chung cho mọi API call
// Tự gắn header Authorization nếu có token, tự parse JSON,
// tự throw Error có message rõ ràng nếu request fail.
// ──────────────────────────────────────────────────────────
const request = async (path, { method = "GET", body, auth = true } = {}) => {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    // fetch() chỉ throw khi lỗi network thật (server không phản hồi),
    // KHÔNG throw khi response có status 4xx/5xx — phân biệt rõ 2 loại
    // lỗi này để hiển thị thông báo đúng cho người dùng.
    throw new Error("Không thể kết nối tới server. Vui lòng kiểm tra backend có đang chạy không.");
  }

  // Cố gắng parse JSON ngay cả khi response lỗi, vì error.middleware.js
  // luôn trả về JSON { success: false, message } cho mọi lỗi
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.message || `Yêu cầu thất bại (HTTP ${response.status})`;
    throw new Error(message);
  }

  return data;
};

// ============================================================
// AUTH — khớp backend/routes/auth.routes.js
// ============================================================

/**
 * @param {{ name: string, email: string, password: string, role?: "client"|"freelancer" }} payload
 */
export const register = async (payload) => {
  const data = await request("/api/auth/register", { method: "POST", body: payload, auth: false });
  setToken(data.token);
  return data.user;
};

/**
 * @param {{ email: string, password: string }} payload
 */
export const login = async (payload) => {
  const data = await request("/api/auth/login", { method: "POST", body: payload, auth: false });
  setToken(data.token);
  return data.user;
};

export const getMe = async () => {
  const data = await request("/api/auth/me");
  return data.user;
};

/**
 * @param {string} walletAddress - định dạng "0x" + 40 hex char
 */
export const updateWallet = async (walletAddress) => {
  const data = await request("/api/auth/wallet", { method: "PATCH", body: { walletAddress } });
  return data.user;
};

export const logout = () => clearToken();

// ============================================================
// ESCROW — khớp backend/routes/escrow.routes.js
// ============================================================

/**
 * Client tạo escrow mới (chỉ tạo bản ghi DB, CHƯA gọi smart contract).
 * Response trả về escrow.escrowIdOnChain đã được backend encode sẵn —
 * dùng giá trị này khi gọi createEscrowOnChain() ở lib/web3.js, KHÔNG
 * tự encode lại ở frontend (xem quy ước trong lib/web3.js).
 *
 * @param {{ freelancerWalletAddress: string, serviceName: string, jobDescription?: string, amount: string|number, deadline?: string }} payload
 */
export const createEscrow = async (payload) => {
  const data = await request("/api/escrows", { method: "POST", body: payload });
  return data.escrow;
};

/**
 * @param {{ status?: string, page?: number, limit?: number }} params
 */
export const getEscrows = async (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== "")
  ).toString();
  const data = await request(`/api/escrows${query ? `?${query}` : ""}`);
  return data; // { count, total, pages, currentPage, escrows }
};

export const getEscrowById = async (id) => {
  const data = await request(`/api/escrows/${id}`);
  return data.escrow;
};

/**
 * @param {string} id
 * @param {{ deliverableUrl: string, workProof?: string, note?: string }} payload
 */
export const submitDeliverable = async (id, payload) => {
  const data = await request(`/api/escrows/${id}/submit`, { method: "PATCH", body: payload });
  return data.escrow;
};

/**
 * Đánh dấu Ý ĐỊNH approve trong DB (status → APPROVED). Sau khi gọi
 * hàm này, frontend PHẢI tiếp tục gọi confirmDeliveryOnChain() ở
 * lib/web3.js để thực sự release tiền on-chain — backend KHÔNG tự
 * release (xem ghi chú "approveWork desync" trong escrow.controller.js).
 * @param {string} id
 */
export const approveWork = async (id) => {
  const data = await request(`/api/escrows/${id}/approve`, { method: "PATCH" });
  return data.escrow;
};
