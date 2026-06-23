// ============================================================
// controllers/upload.controller.js — Xử lý upload file (Backend 2)
//
// Dùng cho 2 trường hợp chính trong UI:
// 1. Freelancer đính kèm file bằng chứng công việc khi submit
//    deliverable (workProof) — tuỳ chọn, vì deliverableUrl chính
//    (link Figma/GitHub) đã có thể nhập tay.
// 2. Client/Freelancer đính kèm file bằng chứng khi mở dispute
//    (evidenceFiles trong Dispute model).
//
// Luồng dùng (frontend):
//   1. POST /api/uploads (multipart/form-data, field "files", tối đa 5)
//   2. Backend trả về { success, files: [{ url, publicId }] }
//   3. Frontend dùng url(s) này khi gọi POST /api/escrows/:id/submit
//      (workProof) hoặc tạo Dispute (evidenceFiles)
// ============================================================

const { uploadMultiple } = require('../services/fileStorage.service');
const asyncHandler = require('../utils/asyncHandler');

// ==================== POST /api/uploads ====================
/**
 * Upload 1 hoặc nhiều file lên Cloudinary
 * Form-data field: "files" (tối đa 5 file, xem upload.middleware.js)
 * Query param tuỳ chọn: ?folder=escrowx/disputes (mặc định escrowx/uploads)
 * Response: { success, files: [{ url, publicId }] }
 */
const uploadFiles = asyncHandler(async (req, res) => {
  // req.files được gán bởi multer.array('files', 5) ở route
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('No files provided. Use form-data field "files".');
  }

  const folder = req.query.folder || 'escrowx/uploads';

  // Validate folder để tránh path traversal / ghi đè thư mục lạ trên Cloudinary
  // — chỉ cho phép chữ, số, gạch ngang, gạch dưới, và dấu '/'
  if (!/^[a-zA-Z0-9/_-]+$/.test(folder)) {
    res.status(400);
    throw new Error('Invalid folder name');
  }

  const uploaded = await uploadMultiple(req.files, { folder });

  res.status(201).json({
    success: true,
    files: uploaded,
  });
});

module.exports = { uploadFiles };
