// ============================================================
// routes/upload.routes.js
//
// POST /api/upload          — Upload 1 file
// POST /api/upload/multiple — Upload nhiều file (tối đa 5)
//
// Middleware order QUAN TRỌNG:
// protect → uploadSingle/uploadMultiple → handleUploadError → controller
// handleUploadError phải đứng SAU multer để catch multer errors
// ============================================================

const express = require('express');
const router = express.Router();

const { uploadFile, uploadMultipleFiles } = require('../controllers/upload.controller');
const { uploadSingle, uploadMultiple, handleUploadError } = require('../middleware/upload.middleware');
const { protect } = require('../middleware/auth.middleware');

// POST /api/upload
// Query: ?type=evidence | seller | product
router.post(
  '/',
  protect,
  uploadSingle,
  handleUploadError,
  uploadFile
);

// POST /api/upload/multiple
// Query: ?type=evidence | seller | product
router.post(
  '/multiple',
  protect,
  uploadMultiple,
  handleUploadError,
  uploadMultipleFiles
);

module.exports = router;