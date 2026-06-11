// ============================================================
// config/cloudinary.js — Cấu hình kết nối Cloudinary
//
// Cloudinary dùng để:
// - Upload ảnh/video bằng chứng của buyer và seller
// - Lưu ảnh sản phẩm
// - Trả về URL public để lưu vào MongoDB
// ============================================================

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Luôn dùng HTTPS cho URL trả về
});

module.exports = cloudinary;