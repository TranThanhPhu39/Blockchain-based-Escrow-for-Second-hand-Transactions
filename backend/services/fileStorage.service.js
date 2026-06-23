// ============================================================
// services/fileStorage.service.js — Upload file lên Cloudinary
//
// Nhận buffer từ multer (memoryStorage, xem upload.middleware.js)
// và upload lên Cloudinary bằng upload_stream — không cần ghi
// file tạm ra đĩa ở bất kỳ bước nào trong toàn bộ luồng.
// ============================================================

const cloudinary = require('../config/cloudinary');

/**
 * Upload 1 buffer file lên Cloudinary.
 * @param {Buffer} buffer - nội dung file (từ req.file.buffer / req.files[i].buffer)
 * @param {Object} options
 * @param {string} options.folder - thư mục lưu trên Cloudinary, ví dụ 'escrowx/disputes'
 * @param {string} [options.filename] - tên gợi nhớ cho file (không bắt buộc)
 * @returns {Promise<{ url: string, publicId: string }>}
 */
const uploadBuffer = (buffer, { folder, filename } = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder || 'escrowx/uploads',
        // resource_type 'auto': Cloudinary tự nhận diện ảnh hay PDF
        // (PDF được lưu dưới resource_type 'image' nội bộ ở Cloudinary,
        // 'auto' xử lý đúng cho cả 2 trường hợp mà không cần check thủ công)
        resource_type: 'auto',
        public_id: filename ? filename.replace(/\.[^/.]+$/, '') : undefined,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Upload nhiều file cùng lúc (Promise.all) — dùng cho dispute evidence
 * (tối đa 5 file/lần, xem upload.middleware.js).
 * @param {Array<{buffer: Buffer, originalname: string}>} files - req.files từ multer
 * @param {Object} options
 * @param {string} options.folder
 * @returns {Promise<Array<{ url: string, publicId: string }>>}
 */
const uploadMultiple = async (files, options = {}) => {
  const uploads = files.map((file) =>
    uploadBuffer(file.buffer, { ...options, filename: file.originalname })
  );
  return Promise.all(uploads);
};

/**
 * Xoá file trên Cloudinary theo publicId (dùng nếu cần cleanup,
 * ví dụ user xoá 1 ảnh bằng chứng trước khi submit dispute).
 * @param {string} publicId
 */
const deleteFile = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadBuffer, uploadMultiple, deleteFile };
