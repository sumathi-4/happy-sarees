const express = require('express');
const router = express.Router();
const vendorController = require('../../controllers/admin/vendorController');
const { adminAuth } = require('../../middleware/adminAuth');

router.get('/', adminAuth, vendorController.getSellers);
router.get('/:id', adminAuth, vendorController.getSellerById);

// Approve
router.put('/:id/approve', adminAuth, vendorController.approve);
router.post('/:id/approve', adminAuth, vendorController.approve);

// Reject
router.put('/:id/reject', adminAuth, vendorController.reject);
router.post('/:id/reject', adminAuth, vendorController.reject);

// Suspend
router.put('/:id/suspend', adminAuth, vendorController.suspend);
router.post('/:id/suspend', adminAuth, vendorController.suspend);

// Reactivate / Unsuspend
router.put('/:id/reactivate', adminAuth, vendorController.reactivate);
router.post('/:id/reactivate', adminAuth, vendorController.reactivate);
router.post('/:id/unsuspend', adminAuth, vendorController.reactivate);

router.get('/:id/products', adminAuth, vendorController.getSellerProducts);
router.get('/:id/orders', adminAuth, vendorController.getSellerOrders);

module.exports = router;
