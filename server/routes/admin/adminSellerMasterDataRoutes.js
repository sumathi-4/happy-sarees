// routes/admin/adminSellerMasterDataRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/admin/adminSellerMasterDataController');

// GET  /api/admin/seller-master-data-requests?status=pending|approved|rejected|all
router.get('/', ctrl.getAllRequests);

// POST /api/admin/seller-master-data-requests/:id/approve
router.post('/:id/approve', ctrl.approveRequest);

// POST /api/admin/seller-master-data-requests/:id/reject
router.post('/:id/reject', ctrl.rejectRequest);

module.exports = router;
