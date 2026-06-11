// ============================================================
// models/Dispute.js — Schema cho Dispute (Tranh chấp)
//
// Luồng dispute:
// 1. Buyer mở dispute khi không hài lòng với giao hàng
// 2. Buyer upload bằng chứng (ảnh, video) lên Cloudinary
// 3. Seller phản hồi + upload bằng chứng phản bác
// 4. Admin xem xét và resolve: refund buyer hoặc release cho seller
// 5. Backend 3 gọi smart contract thực hiện refund/release
// ============================================================

const mongoose = require('mongoose');

// ==================== CONSTANTS ====================

const DISPUTE_STATUS = {
  OPEN: 'OPEN',           // Buyer vừa mở dispute, chờ seller phản hồi
  RESPONDING: 'RESPONDING', // Seller đã phản hồi, chờ admin xem xét
  RESOLVED: 'RESOLVED',   // Admin đã xử lý xong
  CLOSED: 'CLOSED',       // Đóng dispute (tự động đóng nếu timeout)
};

const DISPUTE_REASON = {
  ITEM_NOT_RECEIVED: 'ITEM_NOT_RECEIVED',     // Không nhận được hàng
  ITEM_NOT_AS_DESCRIBED: 'ITEM_NOT_AS_DESCRIBED', // Hàng không đúng mô tả
  ITEM_DAMAGED: 'ITEM_DAMAGED',               // Hàng bị hư hỏng
  WRONG_ITEM: 'WRONG_ITEM',                   // Nhận nhầm hàng
  OTHER: 'OTHER',                             // Lý do khác
};

const DISPUTE_RESOLUTION = {
  REFUND_BUYER: 'REFUND_BUYER',       // Hoàn tiền cho buyer
  RELEASE_SELLER: 'RELEASE_SELLER',   // Giải ngân cho seller
};

// ==================== SCHEMA ====================

const disputeSchema = new mongoose.Schema(
  {
    // ==================== LIÊN KẾT VỚI ESCROW ====================
    escrow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Escrow', // Tham chiếu đến Escrow model của Backend 1
      required: [true, 'Escrow reference is required'],
    },

    // ==================== CÁC BÊN LIÊN QUAN ====================
    // Lưu lại buyer và seller để query nhanh, không phải populate Escrow mỗi lần
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Tham chiếu đến User model của Backend 1
      required: [true, 'Buyer reference is required'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller reference is required'],
    },

    // ==================== NỘI DUNG TRANH CHẤP ====================
    reason: {
      type: String,
      enum: {
        values: Object.values(DISPUTE_REASON),
        message: 'Invalid dispute reason: {VALUE}',
      },
      required: [true, 'Dispute reason is required'],
    },
    description: {
      type: String,
      required: [true, 'Dispute description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },

    // ==================== BẰNG CHỨNG CỦA BUYER ====================
    // Mảng URL ảnh/video đã upload lên Cloudinary
    buyerEvidence: [
      {
        url: {
          type: String,
          required: true, // URL Cloudinary
        },
        publicId: {
          type: String,
          required: true, // Cloudinary public_id — dùng để xóa file sau này
        },
        fileType: {
          type: String,
          enum: ['image', 'video', 'document'],
          default: 'image',
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ==================== PHẢN HỒI CỦA SELLER ====================
    sellerResponse: {
      content: {
        type: String,
        trim: true,
        maxlength: [2000, 'Response cannot exceed 2000 characters'],
      },
      // Bằng chứng phản bác của seller
      evidence: [
        {
          url: { type: String },
          publicId: { type: String },
          fileType: {
            type: String,
            enum: ['image', 'video', 'document'],
            default: 'image',
          },
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      respondedAt: {
        type: Date, // Thời điểm seller gửi phản hồi
      },
    },

    // ==================== TRẠNG THÁI ====================
    status: {
      type: String,
      enum: {
        values: Object.values(DISPUTE_STATUS),
        message: 'Invalid dispute status: {VALUE}',
      },
      default: DISPUTE_STATUS.OPEN,
    },

    // ==================== QUYẾT ĐỊNH CỦA ADMIN ====================
    resolution: {
      type: String,
      enum: {
        values: Object.values(DISPUTE_RESOLUTION),
        message: 'Invalid resolution: {VALUE}',
      },
      // Chỉ có giá trị sau khi admin resolve
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Admin user đã xử lý
    },
    resolvedAt: {
      type: Date, // Thời điểm admin xử lý xong
    },
    adminNote: {
      type: String,
      trim: true,
      maxlength: [1000, 'Admin note cannot exceed 1000 characters'],
      // Ghi chú nội bộ của admin — lý do quyết định
    },
  },
  {
    timestamps: true, // createdAt, updatedAt — giống Escrow.js và User.js
  }
);

// ==================== INDEXES ====================
// Tăng tốc query thường gặp nhất

// Query "tất cả dispute của escrow này" — dùng khi xem chi tiết một giao dịch
disputeSchema.index({ escrow: 1 });

// Query "tất cả dispute của buyer này" — dùng trong dashboard buyer
disputeSchema.index({ buyer: 1, status: 1 });

// Query "tất cả dispute chờ xử lý" — dùng trong admin panel
disputeSchema.index({ status: 1, createdAt: -1 });

// ==================== MODEL ====================
const Dispute = mongoose.model('Dispute', disputeSchema);

module.exports = Dispute;
module.exports.DISPUTE_STATUS = DISPUTE_STATUS;
module.exports.DISPUTE_REASON = DISPUTE_REASON;
module.exports.DISPUTE_RESOLUTION = DISPUTE_RESOLUTION;
