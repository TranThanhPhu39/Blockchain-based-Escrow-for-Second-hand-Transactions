const express = require('express');
const {
  createEscrow,
  getEscrows,
  getEscrowById,
  updateShipping,
  confirmDelivery,
} = require('../controllers/escrow.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

router.post('/', protect, authorize('buyer'), createEscrow);
router.get('/', protect, getEscrows);
router.get('/:id', protect, getEscrowById);
router.patch('/:id/shipping', protect, authorize('seller'), updateShipping);
router.patch('/:id/confirm', protect, authorize('buyer'), confirmDelivery);

module.exports = router;