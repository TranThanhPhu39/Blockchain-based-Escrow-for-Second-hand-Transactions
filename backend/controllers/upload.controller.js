// ============================================================
// controllers/upload.controller.js — Xử lý request upload file
//
// API: POST /api/upload
//
// Controller này chỉ làm 1 việc: nhận file từ multer và đẩy lên Cloudinary
// Không lưu gì vào DB ở đây — URL trả về sẽ được frontend dùng
// để gắn vào dispute evidence khi gọi POST /api/disputes
//
// Luồng:
// Request (multipart/form-data)
//   → upload.middleware.js (multer validate + buffer)
//   → upload.controller.js (gọi fileStorage.service)
//   → fileStorage.service.js (đẩy lên Cloudinary)
//   → Response: { url, publicId, fileType }
// ============================================================

const asyncHandler = require('../utils/asyncHandler');
const {
  uploadToCloudinary,
  uploadManyToCloudinary,
  CLOUDINARY_FOLDERS,
} = require('../services/fileStorage.service');

// ==================== UPLOAD SINGLE FILE ====================

/**
 * POST /api/upload
 * Body: multipart/form-data với field 'file'
 * Query: ?type=evidence | product (default: evidence)
 *
 * Dùng cho:
 * - Upload 1 ảnh sản phẩm khi tạo escrow
 * - Upload 1 file bằng chứng dispute
 *
 * Response:
 * {
 *   success: true,
 *   data: { url, publicId, fileType }
 * }
 */
const uploadFile = asyncHandler(async (req, res) => {
  // Multer đã xử lý file trước khi vào đây
  // req.file có: buffer, mimetype, originalname, size
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file provided. Use field name "file".',
    });
  }

  // Chọn folder Cloudinary theo query param
  const uploadType = req.query.type || 'evidence';
  const folderMap = {
    evidence: CLOUDINARY_FOLDERS.DISPUTE_EVIDENCE,
    seller: CLOUDINARY_FOLDERS.SELLER_EVIDENCE,
    product: CLOUDINARY_FOLDERS.PRODUCT_IMAGES,
  };
  const folder = folderMap[uploadType] || CLOUDINARY_FOLDERS.DISPUTE_EVIDENCE;

  const result = await uploadToCloudinary(
    req.file.buffer,
    req.file.mimetype,
    folder
  );

  res.status(200).json({
    success: true,
    data: result, // { url, publicId, fileType }
  });
});

// ==================== UPLOAD MULTIPLE FILES ====================

/**
 * POST /api/upload/multiple
 * Body: multipart/form-data với field 'files' (tối đa 5 file)
 * Query: ?type=evidence | seller | product
 *
 * Dùng cho: upload nhiều bằng chứng dispute cùng lúc
 *
 * Response:
 * {
 *   success: true,
 *   data: [{ url, publicId, fileType }, ...]
 * }
 */
const uploadMultipleFiles = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files provided. Use field name "files".',
    });
  }

  const uploadType = req.query.type || 'evidence';
  const folderMap = {
    evidence: CLOUDINARY_FOLDERS.DISPUTE_EVIDENCE,
    seller: CLOUDINARY_FOLDERS.SELLER_EVIDENCE,
    product: CLOUDINARY_FOLDERS.PRODUCT_IMAGES,
  };
  const folder = folderMap[uploadType] || CLOUDINARY_FOLDERS.DISPUTE_EVIDENCE;

  const results = await uploadManyToCloudinary(req.files, folder);

  res.status(200).json({
    success: true,
    count: results.length,
    data: results, // Array of { url, publicId, fileType }
  });
});

module.exports = {
  uploadFile,
  uploadMultipleFiles,
};