// ============================================================
// services/blockchain.service.js — Gọi smart contract functions
//
// Service layer chứa logic tương tác với blockchain
// Controller sẽ gọi service, không gọi blockchain trực tiếp
//
// Phân biệt:
// - READ functions  (view/pure): không tốn gas, không cần ký
// - WRITE functions (state change): tốn gas, cần private key ký
//
// LƯU Ý: escrowIdOnChain ở đây luôn là bytes32 hex string
// (ví dụ "0xabc123...000000"), KHÔNG phải Number.
// ============================================================

const { getContract, getProvider } = require('../config/blockchain');
const { ethers } = require('ethers');

/**
 * ── READ: Lấy trạng thái contract từ smart contract ──────────
 * Dùng để đồng bộ: so sánh status trên chain vs DB
 *
 * ContractData struct (EscrowContract v2):
 *   (bool exists, address client, address freelancer, uint256 amount,
 *    uint8 status, string contractURI, string submissionURI,
 *    uint256 revisionCount, uint256 createdAt, uint256 updatedAt)
 *
 * @param {string} escrowIdOnChain - bytes32 hex string
 * @returns {Object} { exists, client, freelancer, amount, status, contractURI, submissionURI, revisionCount, createdAt, updatedAt }
 */
const getEscrowOnChain = async (escrowIdOnChain) => {
  const contract = getContract();

  // Gọi view function — chỉ đọc, không tốn gas
  // getContract() revert với ContractNotFound nếu escrowId không tồn tại
  const result = await contract.getContract(escrowIdOnChain);

  // Status trên chain là số (uint8), map sang string cho dễ đọc
  // Đồng bộ với enum Status trong EscrowContract.sol (v2 — 10 trạng thái)
  const STATUS_MAP = {
    0: 'CREATED',
    1: 'ACCEPTED',
    2: 'DEPOSITED',
    3: 'SUBMITTED',
    4: 'REVISION_REQUESTED',
    5: 'DISPUTED',
    6: 'REVIEWING_DISPUTE',
    7: 'RELEASED',
    8: 'REFUNDED',
    9: 'CANCELLED',
  };

  return {
    exists:        result.exists,
    client:        result.client,
    freelancer:    result.freelancer,
    amount:        result.amount.toString(), // BigInt → String để tránh mất precision
    status:        STATUS_MAP[Number(result.status)] || 'UNKNOWN',
    contractURI:   result.contractURI,
    submissionURI: result.submissionURI,
    revisionCount: Number(result.revisionCount),
    createdAt:     new Date(Number(result.createdAt) * 1000),
    updatedAt:     new Date(Number(result.updatedAt) * 1000),
  };
};

/**
 * ── WRITE: Client approve công việc → release tiền cho freelancer ──
 * Gọi khi Client xác nhận hài lòng với công việc (contract đang ở SUBMITTED on-chain)
 *
 * Tương ứng hàm approveWork(bytes32 contractId) trong EscrowContract v2.
 * CHỈ client (người tạo contract) mới được gọi — _onlyClient modifier.
 * Trong luồng hiện tại, client tự ký từ frontend/MetaMask; function này
 * chỉ dùng cho mục đích script/test nội bộ nếu cần.
 *
 * @param {string} escrowIdOnChain - bytes32 hex string
 * @returns {Object} { txHash, blockNumber }
 */
const confirmDelivery = async (escrowIdOnChain) => {
  const contract = getContract();

  console.log(`📤 Calling approveWork for escrow ${escrowIdOnChain}...`);

  const tx = await contract.approveWork(escrowIdOnChain);
  console.log(`⏳ Transaction sent: ${tx.hash}`);

  const receipt = await tx.wait(1);
  console.log(`✅ approveWork confirmed at block: ${receipt.blockNumber}`);

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
};

/**
 * ── DEPRECATED: resolveDispute không còn tồn tại trong EscrowContract v2 ──
 *
 * Contract v2 đã chuyển sang mô hình voting phi tập trung:
 *   1. Reviewer gọi castDisputeVote() qua MetaMask (frontend)
 *   2. Sau đủ 9 phiếu hoặc hết 3 ngày → gọi finalizeDisputeOnChain()
 *
 * Hàm này được giữ lại để không break import trong dispute.controller.js
 * trong thời gian chờ refactor (Task 7). Throw error rõ ràng thay vì
 * crash với "TypeError: contract.resolveDispute is not a function".
 *
 * @deprecated Dùng finalizeDisputeOnChain() thay thế
 * @throws {Error} Luôn throw — không gọi được on-chain
 */
const resolveDispute = async (escrowIdOnChain, releaseToFreelancer) => {
  throw new Error(
    '[resolveDispute] Deprecated: EscrowContract v2 không có hàm resolveDispute(). ' +
      'Dispute được giải quyết qua reviewer voting + finalizeDispute(). ' +
      'Dùng POST /api/disputes/:id/finalize thay thế.'
  );
};

/**
 * ── HELPER: Lấy thông tin block ────────────────────────────
 * Dùng để lấy timestamp thực của block khi xử lý event
 *
 * @param {number} blockNumber
 * @returns {Date} timestamp của block
 */
const getBlockTimestamp = async (blockNumber) => {
  const provider = getProvider();
  const block = await provider.getBlock(blockNumber);
  // block.timestamp là Unix timestamp (giây)
  // Nhân 1000 để chuyển sang milliseconds cho JavaScript Date
  return new Date(block.timestamp * 1000);
};

/**
 * ── HELPER: Format đơn vị token theo decimals ──────────────
 * MockUSDC dùng 6 decimals (không phải 18 như ETH/MATIC),
 * nên KHÔNG dùng ethers.formatEther (mặc định 18 decimals).
 *
 * @param {string|BigInt} rawAmount - số lượng thô (chưa chia decimals)
 * @param {number} decimals - số decimals của token (mặc định 6 cho MockUSDC)
 * @returns {string} VD: "100.0" (USDC)
 */
const formatAmount = (rawAmount, decimals = 6) => {
  return ethers.formatUnits(rawAmount.toString(), decimals);
};

/**
 * ── READ: Kiểm tra wallet có trong whitelist reviewer on-chain ──
 * Dùng làm eligibility check trước khi cho phép vote dispute.
 * Contract là source of truth — không phụ thuộc vào DB role.
 *
 * @param {string} walletAddress - Địa chỉ ví cần kiểm tra
 * @returns {boolean} true nếu wallet đã được whitelist là reviewer
 */
const checkIsReviewerOnChain = async (walletAddress) => {
  const contract = getContract();
  return await contract.isReviewer(walletAddress);
};

/**
 * ── WRITE: Admin thêm địa chỉ ví vào whitelist reviewer on-chain ──
 * Chỉ owner (admin wallet) được gọi — hàm addReviewer(address) trong contract.
 * @param {string} walletAddress - Địa chỉ ví reviewer cần thêm
 * @returns {Object} { txHash, blockNumber }
 */
const addReviewerOnChain = async (walletAddress) => {
  const contract = getContract();
  console.log(`📤 addReviewer on-chain: ${walletAddress}`);
  const tx = await contract.addReviewer(walletAddress);
  const receipt = await tx.wait(1);
  console.log(`✅ addReviewer confirmed at block: ${receipt.blockNumber}`);
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
};

/**
 * ── WRITE: Admin xoá địa chỉ ví khỏi whitelist reviewer on-chain ──
 * @param {string} walletAddress - Địa chỉ ví reviewer cần xoá
 * @returns {Object} { txHash, blockNumber }
 */
const removeReviewerOnChain = async (walletAddress) => {
  const contract = getContract();
  console.log(`📤 removeReviewer on-chain: ${walletAddress}`);
  const tx = await contract.removeReviewer(walletAddress);
  const receipt = await tx.wait(1);
  console.log(`✅ removeReviewer confirmed at block: ${receipt.blockNumber}`);
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
};

/**
 * ── WRITE: Finalize dispute sau khi đủ phiếu hoặc hết 3 ngày ──
 * Bất kỳ ai cũng gọi được — backend dùng admin wallet để trigger.
 * @param {string} escrowIdOnChain - bytes32 hex string
 * @returns {Object} { txHash, blockNumber }
 */
const finalizeDisputeOnChain = async (escrowIdOnChain) => {
  const contract = getContract();
  console.log(`📤 finalizeDispute on-chain for escrow: ${escrowIdOnChain}`);
  const tx = await contract.finalizeDispute(escrowIdOnChain);
  const receipt = await tx.wait(1);
  console.log(`✅ finalizeDispute confirmed at block: ${receipt.blockNumber}`);
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
};

module.exports = {
  getEscrowOnChain,
  confirmDelivery,
  resolveDispute,
  checkIsReviewerOnChain,
  addReviewerOnChain,
  removeReviewerOnChain,
  finalizeDisputeOnChain,
  getBlockTimestamp,
  formatAmount,
};