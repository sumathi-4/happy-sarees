// routes/admin/adminPayoutRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/admin/adminPayoutController');

// GET  /api/admin/payouts?status=pending|paid|all
router.get('/', ctrl.getAllPayouts);

// POST /api/admin/payouts/generate
router.post('/generate', ctrl.generatePayout);

// PUT  /api/admin/payouts/:id/mark-paid
router.put('/:id/mark-paid', ctrl.markPayoutPaid);

// POST /api/admin/payouts/adjustment
router.post('/adjustment', ctrl.createAdjustment);

module.exports = router;
