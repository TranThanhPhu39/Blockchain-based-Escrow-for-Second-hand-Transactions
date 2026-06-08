// ============================================================
// middleware/upload.middleware.js — Multer config cho file upload
//
// Dùng memoryStorage (không lưu file xuống disk) vì:
// - File được đẩy thẳng lên Cloudinary từ buffer trong RAM
// - Server không cần quyền ghi disk
// - Phù hợp với cloud deployment (Heroku, Railway...)
//
// Luồng: Request → multer (validate + buffer) → controller → Cloudinary
// ============================================================

const multer = require('multer');

// ==================== STORAGE ====================
// memoryStorage: file nằm trong req.file.buffer (Buffer object)
// Không tạo file tạm trên disk
const storage = multer.memoryStorage();

// ==================== FILE FILTER ====================
// Chỉ chấp nhận image và video — đúng với usecase bằng chứng tranh chấp
const fileFilter = (req, file, cb) => {
  const ALLOWED_MIME_TYPES = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    // Videos
    'video/mp4',
    'video/quicktime', // .mov
    'video/x-msvideo', // .avi
    'video/webm',
    // Documents (bill/invoice làm bằng chứng)
    'application/pdf',
  ];

  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true); // Chấp nhận file
  } else {
    cb(
      new Error(
        `Unsupported file type: ${file.mimetype}. Allowed: images, videos, PDF`
      ),
      false // Từ chối file
    );
  }
};

// ==================== LIMITS ====================
const LIMITS = {
  fileSize: 50 * 1024 * 1024, // 50MB — đủ cho video ngắn làm bằng chứng
  files: 5,                   // Tối đa 5 file mỗi request (1 dispute upload)
};

// ==================== MULTER INSTANCES ====================

// upload.single('file') — dùng cho upload 1 file (ảnh sản phẩm)
// upload.array('files', 5) — dùng cho upload nhiều bằng chứng dispute
// upload.fields([...]) — dùng khi cần nhiều field khác nhau

const upload = multer({
  storage,
  fileFilter,
  limits: LIMITS,
});

// ==================== MIDDLEWARE EXPORTS ====================

/**
 * uploadSingle — Upload 1 file duy nhất
 * Field name: 'file'
 * Dùng cho: upload ảnh sản phẩm, avatar
 */
const uploadSingle = upload.single('file');

/**
 * uploadMultiple — Upload nhiều file cùng lúc (tối đa 5)
 * Field name: 'files'
 * Dùng cho: upload bằng chứng dispute (có thể nhiều ảnh/video)
 */
const uploadMultiple = upload.array('files', 5);

/**
 * handleUploadError — Error handler cho multer errors
 * Phải được dùng sau uploadSingle/uploadMultiple trong route
 * Multer errors không được catch bởi express error handler thông thường
 */
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Lỗi từ multer (file quá lớn, quá nhiều file...)
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 50MB per file.',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 5 files per upload.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  if (err) {
    // Lỗi từ fileFilter (sai định dạng file)
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next();
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  handleUploadError,
};