// ============================================================
// models/Dispute.js — Schema cho Dispute (tranh chấp)
//
// QUAN HỆ VỚI ESCROW & BLOCKCHAIN (đọc trước khi sửa file này):
//
// 1. Việc chuyển Escrow.status → DISPUTED đã được xử lý SẴN bởi
//    backend/services/eventListener.service.js (handleDisputeRaised)
//    ngay khi smart contract emit event DisputeRaised — KHÔNG cần
//    (và KHÔNG nên) lặp lại logic đó ở đây.
//
// 2. Dispute document ở đây chỉ lưu các THÔNG TIN BỔ SUNG mà
//    on-chain event không mang đủ chi tiết để hiển thị UI tốt:
//    mô tả tranh chấp, danh sách file bằng chứng (qua Cloudinary —
//    xem services/fileStorage.service.js), và quyết định/note của
//    admin khi resolve.
//
// 3. raiseDispute(escrowId, evidenceURI) trên smart contract chỉ
//    nhận MỘT string evidenceURI duy nhất (không phải mảng file).
//    Quy ước: evidenceURI gửi on-chain trỏ tới MỘT endpoint backend
//    (ví dụ chính dispute._id hoặc một URL tổng hợp), còn danh sách
//    file thật (nhiều ảnh/PDF) được lưu đầy đủ trong DB ở field
//    evidenceFiles bên dưới. Vì vậy luồng đúng là:
//      a) Client/Freelancer upload file bằng chứng trước (POST /api/uploads)
//      b) Tạo Dispute record trong DB (field evidenceFiles)
//      c) Frontend gọi raiseDisputeOnChain(signer, escrowIdOnChain, evidenceURI)
//         trong lib/web3.js, với evidenceURI trỏ về dispute này
//         (ví dụ: `${API_BASE_URL}/api/disputes/${dispute._id}`)
//
// 4. Khi admin resolve dispute (PATCH /api/disputes/:id/resolve),
//    controller sẽ:
//      a) Gọi blockchain.service.js#resolveDispute(escrowIdOnChain, releaseToFreelancer)
//         — admin wallet (owner) ký giao dịch on-chain thật
//      b) Lưu lại resolution, resolvedBy, resolvedAt ở đây
//    Escrow.status sẽ tự chuyển RELEASED/REFUNDED khi eventListener
//    bắt được event FundsReleased/BuyerRefunded tương ứng (đúng
//    nguyên tắc "status DB chỉ đúng khi đã xác nhận on-chain" đang
//    áp dụng xuyên suốt project — xem escrow.controller.js).
// ============================================================

const mongoose = require('mongoose');

const DISPUTE_STATUS = {
  OPEN: 'OPEN', // Đang chờ admin xem xét
  RESOLVED_RELEASE: 'RESOLVED_RELEASE', // Đã xử lý: release cho freelancer
  RESOLVED_REFUND: 'RESOLVED_REFUND', // Đã xử lý: refund cho client
};

const disputeSchema = new mongoose.Schema(
  {
    escrow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Escrow',
      required: [true, 'Escrow reference is required'],
      index: true,
    },
    // Lưu lại escrowIdOnChain tại thời điểm tạo dispute để tiện
    // gọi blockchain.service.js#resolveDispute() mà không cần
    // populate lại Escrow mỗi lần — KHỚP với giá trị Escrow.escrowIdOnChain.
    escrowIdOnChain: {
      type: String,
      lowercase: true,
      required: [true, 'escrowIdOnChain is required'],
    },

    // Người mở tranh chấp — có thể là client hoặc freelancer của escrow này
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'raisedBy is required'],
    },

    reason: {
      type: String,
      required: [true, 'Dispute reason is required'],
      trim: true,
    },

    // Danh sách URL file bằng chứng (ảnh, PDF, ...) đã upload qua
    // Cloudinary (xem upload.controller.js + fileStorage.service.js)
    evidenceFiles: {
      type: [String],
      default: [],
    },

    // URI thực sự đã gửi lên smart contract (raiseDispute evidenceURI param)
    // Lưu lại để đối chiếu/audit, KHÔNG dùng làm nguồn dữ liệu chính
    // (nguồn chính luôn là evidenceFiles + reason ở trên).
    evidenceURIOnChain: {
      type: String,
    },

    // txHash của giao dịch raiseDispute on-chain (nếu frontend gửi kèm
    // khi tạo dispute, sau khi raiseDisputeOnChain() đã confirm)
    raiseTxHash: {
      type: String,
      lowercase: true,
    },

    status: {
      type: String,
      enum: {
        values: Object.values(DISPUTE_STATUS),
        message: 'Invalid dispute status: {VALUE}',
      },
      default: DISPUTE_STATUS.OPEN,
    },

    // ==================== RESOLUTION (admin) ====================

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Admin user đã xử lý dispute này
    },
    resolutionNote: {
      type: String,
      trim: true,
    },
    // true: release cho freelancer | false: refund cho client
    releaseToFreelancer: {
      type: Boolean,
    },
    resolveTxHash: {
      type: String,
      lowercase: true,
      // txHash của giao dịch resolveDispute on-chain do admin wallet ký
      // (xem blockchain.service.js#resolveDispute)
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

disputeSchema.index({ status: 1 });

const Dispute = mongoose.model('Dispute', disputeSchema);

module.exports = Dispute;
module.exports.DISPUTE_STATUS = DISPUTE_STATUS;
