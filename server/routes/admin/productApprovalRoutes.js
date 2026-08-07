const express = require('express');
const router = express.Router();
const productApprovalController = require('../../controllers/admin/productApprovalController');
const { adminAuth } = require('../../middleware/adminAuth');

router.get('/', adminAuth, productApprovalController.getProductApprovals);

// Approve
router.put('/:id/approve', adminAuth, productApprovalController.approve);
router.post('/:id/approve', adminAuth, productApprovalController.approve);

// Reject
router.put('/:id/reject', adminAuth, productApprovalController.reject);
router.post('/:id/reject', adminAuth, productApprovalController.reject);

module.exports = router;
