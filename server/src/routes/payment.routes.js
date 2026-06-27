const express = require('express');
const router = express.Router();
const { initiate, verify, webhook, getPayments } = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

// IMPORTANT: Webhook must use raw body — registered in app.js separately
// @route   POST /api/payments/webhook
router.post('/webhook', webhook);

// @route   POST /api/payments/initiate
router.post('/initiate', protect, initiate);

// @route   GET /api/payments/verify/:reference
router.get('/verify/:reference', protect, verify);

// @route   GET /api/payments
router.get('/', protect, requireAdmin, getPayments);

module.exports = router;