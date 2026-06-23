// ============================================================
// config/cloudinary.js — Khởi tạo Cloudinary SDK
//
// Dùng để upload file bằng chứng tranh chấp (ảnh, PDF) lên
// Cloudinary thay vì lưu trực tiếp trên server (server có thể
// restart/redeploy và mất file nếu lưu local).
//
// Biến môi trường cần (xem backend/.env.example):
//   CLOUDINARY_CLOUD_NAME
//   CLOUDINARY_API_KEY
//   CLOUDINARY_API_SECRET
// ============================================================

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

module.exports = cloudinary;
