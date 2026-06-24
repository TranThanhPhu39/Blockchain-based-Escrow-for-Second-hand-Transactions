// ============================================================
// routes/upload.routes.js — Định nghĩa upload endpoint
// Mount vào /api/uploads trong app.js
// ============================================================

const express = require('express');
const { uploadFiles } = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// POST /api/uploads — Upload tối đa 5 file (form-data field "files")
router.post('/', protect, upload.array('files', 5), uploadFiles);

module.exports = router;
