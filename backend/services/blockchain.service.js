// ============================================================
// services/blockchain.service.js — Gọi smart contract functions
//
// Service layer chứa logic tương tác với blockchain
// Controller sẽ gọi service, không gọi blockchain trực tiếp
//
// Phân biệt:
// - READ functions  (view/pure): không tốn gas, không cần ký
// - WRITE functions (state change): tốn gas, cần private key ký
// ============================================================

const { getContract, getProvider } = require('../config/blockchain');
const { ethers } = require('ethers');

/**
 * ── READ: Lấy trạng thái escrow từ smart contract ──────────
 * Dùng để đồng bộ: so sánh status trên chain vs DB
 *
 * @param {number} escrowIdOnChain - ID escrow trên smart contract
 * @returns {Object} { buyer, seller, amount, status }
 */
const getEscrowOnChain = async (escrowIdOnChain) => {
  const contract = getContract();

  // Gọi view function — chỉ đọc, không tốn gas
  // ethers.js tự convert uint256 → BigInt trong JS
  const [buyer, seller, amount, status] = await contract.getEscrow(escrowIdOnChain);

  // Status trên chain là số (uint8), map sang string cho dễ đọc
  // Phải đồng bộ với enum trong Solidity contract
  const STATUS_MAP = {
    0: 'CREATED',
    1: 'LOCKED',
    2: 'SHIPPED',
    3: 'DISPUTED',
    4: 'RELEASED',
    5: 'REFUNDED',
    6: 'CANCELLED',
  };

  return {
    buyer,
    seller,
    amount: amount.toString(), // BigInt → String để tránh mất precision
    status: STATUS_MAP[Number(status)] || 'UNKNOWN',
  };
};

/**
 * ── WRITE: Release tiền cho seller ─────────────────────────
 * Gọi khi:
 *   - Buyer confirm nhận hàng (từ escrow.controller)
 *   - Auto release sau X ngày (từ eventListener)
 *   - Admin resolve dispute thắng cho seller (từ dispute.controller)
 *
 * @param {number} escrowIdOnChain - ID escrow trên smart contract
 * @returns {Object} { txHash, blockNumber }
 */
const releaseFunds = async (escrowIdOnChain) => {
  const contract = getContract();

  console.log(`📤 Calling releaseFunds for escrow #${escrowIdOnChain}...`);

  // contract.releaseFunds() gửi transaction lên blockchain
  // Signer (admin wallet) tự động ký transaction
  // Trả về transaction object (chưa confirm)
  const tx = await contract.releaseFunds(escrowIdOnChain);
  console.log(`⏳ Transaction sent: ${tx.hash}`);

  // tx.wait(): chờ transaction được mine vào 1 block
  // Mặc định chờ 1 confirmation (1 block)
  // Trả về receipt chứa blockNumber, gasUsed, logs, ...
  const receipt = await tx.wait(1);
  console.log(`✅ releaseFunds confirmed at block: ${receipt.blockNumber}`);

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
};

/**
 * ── WRITE: Hoàn tiền cho buyer ──────────────────────────────
 * Gọi khi admin resolve dispute thắng cho buyer
 *
 * @param {number} escrowIdOnChain
 * @returns {Object} { txHash, blockNumber }
 */
const refundBuyer = async (escrowIdOnChain) => {
  const contract = getContract();

  console.log(`📤 Calling refundBuyer for escrow #${escrowIdOnChain}...`);

  const tx = await contract.refundBuyer(escrowIdOnChain);
  console.log(`⏳ Transaction sent: ${tx.hash}`);

  const receipt = await tx.wait(1);
  console.log(`✅ refundBuyer confirmed at block: ${receipt.blockNumber}`);

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
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
 * ── HELPER: Format Wei → ETH/MATIC ─────────────────────────
 * @param {string|BigInt} weiAmount
 * @returns {string} VD: "0.5" (MATIC)
 */
const formatAmount = (weiAmount) => {
  return ethers.formatEther(weiAmount.toString());
};

module.exports = {
  getEscrowOnChain,
  releaseFunds,
  refundBuyer,
  getBlockTimestamp,
  formatAmount,
};
