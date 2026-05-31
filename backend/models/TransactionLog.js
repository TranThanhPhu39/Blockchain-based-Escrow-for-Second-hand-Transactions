// ============================================================
// models/TransactionLog.js — Lưu lịch sử tất cả blockchain events
//
// Mục đích:
// - Audit trail: biết chính xác mọi thứ đã xảy ra trên blockchain
// - Debug: khi có vấn đề, xem lại log để trace
// - Frontend: hiển thị lịch sử giao dịch cho user
// - Tránh xử lý trùng event: check txHash trước khi xử lý
// ============================================================

const mongoose = require('mongoose');

// Các loại event mà smart contract có thể emit
const EVENT_TYPES = [
  'EscrowCreated',  // Escrow được tạo và có tiền deposit
  'FundsDeposited', // Buyer đã gửi tiền vào contract
  'DisputeRaised',  // Buyer raise dispute
  'FundsReleased',  // Tiền được release cho seller
  'BuyerRefunded',  // Buyer được hoàn tiền
  'AutoReleased',   // Tự động release sau X ngày
];

const transactionLogSchema = new mongoose.Schema(
  {
    // ── LIÊN KẾT VỚI ESCROW ──────────────────────────────────
    escrow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Escrow',
      required: true,
      // index: true giúp query nhanh: "tất cả transactions của escrow này"
      index: true,
    },
    escrowIdOnChain: {
      type: Number,
      required: true,
      // ID trên smart contract, khác với MongoDB _id
    },

    // ── THÔNG TIN BLOCKCHAIN ─────────────────────────────────
    txHash: {
      type: String,
      required: true,
      unique: true, // Mỗi transaction hash là duy nhất trên blockchain
      // Dùng để: tránh xử lý event 2 lần (idempotency)
      // Dùng để: verify trên PolygonScan
    },
    blockNumber: {
      type: Number,
      required: true,
      // Block chứa transaction này
      // Dùng để: biết transaction này được confirm vào block nào
    },
    blockTimestamp: {
      type: Date,
      // Thời điểm block được mine (thời gian thực trên blockchain)
      // Khác với createdAt của MongoDB (thời điểm backend ghi vào DB)
    },
    contractAddress: {
      type: String,
      lowercase: true,
    },

    // ── LOẠI EVENT ───────────────────────────────────────────
    eventType: {
      type: String,
      enum: EVENT_TYPES,
      required: true,
    },

    // ── DỮ LIỆU EVENT ────────────────────────────────────────
    // Lưu dạng Mixed (object tự do) vì mỗi event có data khác nhau
    // VD: FundsDeposited có { amount }, FundsReleased có { seller, amount }
    eventData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // ── TRẠNG THÁI XỬ LÝ ────────────────────────────────────
    // Backend có thể fail sau khi nhận event (DB lỗi, ...)
    // Field này giúp retry những event chưa xử lý thành công
    processed: {
      type: Boolean,
      default: false,
    },
    processError: {
      type: String, // Lưu error message nếu xử lý thất bại
    },
  },
  {
    timestamps: true, // createdAt = thời điểm backend ghi log vào DB
  }
);

// Index để query nhanh
transactionLogSchema.index({ escrow: 1, eventType: 1 });
transactionLogSchema.index({ txHash: 1 }, { unique: true });
transactionLogSchema.index({ processed: 1 }); // Tìm logs chưa xử lý

const TransactionLog = mongoose.model('TransactionLog', transactionLogSchema);

module.exports = TransactionLog;
