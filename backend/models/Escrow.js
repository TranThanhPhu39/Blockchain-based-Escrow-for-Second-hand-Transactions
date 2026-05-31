// ============================================================
// models/Escrow.js — Schema cho Escrow transaction
//
// Escrow là hợp đồng giữ tiền trung gian:
// 1. Buyer tạo escrow trong DB
// 2. Buyer deposit tiền lên smart contract
// 3. Backend 3 lắng nghe event, cập nhật status → LOCKED
// 4. Sau khi giao hàng thành công, tiền được release cho seller
// ============================================================

const mongoose = require('mongoose');
const { ESCROW_STATUS } = require('../utils/constants');

const escrowSchema = new mongoose.Schema(
  {
    // ==================== BLOCKCHAIN DATA ====================
    // Các field này được điền sau khi smart contract được tương tác
    // Ban đầu khi tạo escrow trong DB, chúng có thể là null/undefined

    contractAddress: {
      type: String,
      lowercase: true, // Ethereum address nên lowercase
    },
    escrowIdOnChain: {
      type: Number,
      // ID của escrow trên smart contract (uint256)
      // Dùng để tham chiếu khi gọi contract functions
    },
    txHash: {
      type: String,
      // Transaction hash của lần deposit đầu tiên
      // Dùng để verify trên blockchain explorer (PolygonScan)
    },

    // ==================== PARTIES ====================

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Tham chiếu đến User model
      // Dùng để .populate('buyer') → thay ObjectId bằng full User object
      required: [true, 'Buyer is required'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required'],
    },

    // ==================== ITEM INFORMATION ====================

    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    itemDescription: {
      type: String,
      trim: true,
    },
    amount: {
      type: String,
      required: [true, 'Amount is required'],
      // TẠI SAO String thay vì Number?
      // JavaScript Number chỉ an toàn đến 2^53 - 1 (Number.MAX_SAFE_INTEGER)
      // Ethereum dùng đơn vị Wei: 1 ETH = 10^18 Wei
      // Số như 1000000000000000000 (1 ETH) có thể mất precision khi dùng JS Number
      // Lưu dạng String rồi để ethers.js (BigInt) xử lý
    },

    // ==================== STATUS ====================

    status: {
      type: String,
      enum: {
        values: Object.values(ESCROW_STATUS),
        message: 'Invalid escrow status: {VALUE}',
      },
      default: ESCROW_STATUS.CREATED,
    },

    // ==================== SHIPPING ====================

    shippingInfo: {
      carrier: { type: String },        // 'GHN', 'GHTK', 'Viettel Post', ...
      trackingNumber: { type: String },
      shippedAt: { type: Date },
      estimatedDelivery: { type: Date },
    },

    // ==================== AUTO RELEASE ====================

    autoReleaseAt: {
      type: Date,
      // Nếu buyer không confirm nhận hàng sau X ngày kể từ ngày ship,
      // smart contract tự động release tiền cho seller
      // Field này được set khi seller update shipping info
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ==================== INDEXES ====================
// Index giúp tăng tốc độ query
// Compound index: buyer + status — query "tất cả escrow LOCKED của user này" sẽ rất nhanh
// Không index tất cả vì index chiếm thêm storage và làm chậm write
escrowSchema.index({ buyer: 1, status: 1 });
escrowSchema.index({ seller: 1, status: 1 });

const Escrow = mongoose.model('Escrow', escrowSchema);

module.exports = Escrow;
