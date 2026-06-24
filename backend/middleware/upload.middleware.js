// ============================================================
// middleware/upload.middleware.js — Multer middleware xử lý file upload
//
// Dùng memoryStorage (KHÔNG lưu file tạm ra đĩa) vì:
// - Server có thể chạy trên môi trường ephemeral (Render, Railway...)
//   nơi filesystem không persist giữa các lần deploy/restart
// - File chỉ cần đi qua RAM rồi upload thẳng lên Cloudinary
//   (xem fileStorage.service.js#uploadBuffer) — không cần giữ lại
//
// req.file.buffer sẽ chứa nội dung file (Buffer) sau khi qua middleware này
// ============================================================

const multer = require('multer');

// Giới hạn loại file: chỉ ảnh và PDF — đủ cho bằng chứng tranh chấp
// (screenshot, hợp đồng PDF, ...). Chặn sớm ở đây để tránh phí
// Cloudinary cho file không liên quan.
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Gọi cb với Error → multer sẽ trả lỗi qua error middleware chung
    cb(new Error(`Unsupported file type: ${file.mimetype}. Only images and PDF are allowed.`));
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB/file — đủ cho ảnh chụp màn hình/PDF ngắn
    files: 5, // tối đa 5 file mỗi lần upload (đủ cho bộ bằng chứng 1 dispute)
  },
});

module.exports = upload;
