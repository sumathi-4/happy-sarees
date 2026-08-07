const express = require('express');
const router = express.Router();

const sellerAuthController = require('../../controllers/seller/sellerAuthController');
const sellerProductController = require('../../controllers/seller/sellerProductController');
const sellerOrderController = require('../../controllers/seller/sellerOrderController');
const sellerDashboardController = require('../../controllers/seller/sellerDashboardController');
const sellerProfileController = require('../../controllers/seller/sellerProfileController');
const sellerNotificationController = require('../../controllers/seller/sellerNotificationController');

const { sellerAuth, requireApprovedSeller } = require('../../middleware/sellerAuth');

// ── Auth Endpoints (No Gate) ──────────────────────────────
router.post('/register', sellerAuthController.register);
router.post('/login', sellerAuthController.login);

// ── Status/Self Check (Auth Token verification only) ─────
router.get('/me', sellerAuth, sellerAuthController.getMe);
router.post('/logout', sellerAuth, sellerAuthController.logout);

// ── Dashboard & Summary (Approved Sellers only) ────────────
router.get('/dashboard/summary', sellerAuth, requireApprovedSeller, sellerDashboardController.getSummary);

router.get('/categories', sellerAuth, requireApprovedSeller, sellerProductController.getCategories);
router.get('/products', sellerAuth, requireApprovedSeller, sellerProductController.getProducts);
router.get('/products/:id', sellerAuth, requireApprovedSeller, sellerProductController.getProductById);
router.post('/products', sellerAuth, requireApprovedSeller, sellerProductController.createProduct);
router.put('/products/:id', sellerAuth, requireApprovedSeller, sellerProductController.updateProduct);
router.delete('/products/:id', sellerAuth, requireApprovedSeller, sellerProductController.deleteProduct);
router.post('/products/:id/images', sellerAuth, requireApprovedSeller, sellerProductController.uploadProductImage);

// ── Orders & Shipments (Approved Sellers only) ────────────
router.get('/orders', sellerAuth, requireApprovedSeller, sellerOrderController.getOrders);
router.get('/orders/:id', sellerAuth, requireApprovedSeller, sellerOrderController.getOrderById);
router.put('/orders/:itemId/status', sellerAuth, requireApprovedSeller, sellerOrderController.updateStatus);
router.put('/orders/:itemId/payment-status', sellerAuth, requireApprovedSeller, sellerOrderController.updatePaymentStatus);

// ── Notifications (Approved Sellers only) ──────────────────
router.get('/notifications', sellerAuth, requireApprovedSeller, sellerNotificationController.getNotifications);
router.put('/notifications/read-all', sellerAuth, requireApprovedSeller, sellerNotificationController.markAllRead);
router.put('/notifications/:id/read', sellerAuth, requireApprovedSeller, sellerNotificationController.markRead);

// ── Analytics (Approved Sellers only) ─────────────────────
router.get('/analytics/sales', sellerAuth, requireApprovedSeller, sellerDashboardController.getSalesAnalytics);
router.get('/analytics/payouts', sellerAuth, requireApprovedSeller, sellerDashboardController.getPayoutsAnalytics);

// ── Profile Settings (Approved Sellers only) ──────────────
router.get('/profile', sellerAuth, requireApprovedSeller, sellerProfileController.getProfile);
router.put('/profile', sellerAuth, requireApprovedSeller, sellerProfileController.updateProfile);
router.put('/settings/password', sellerAuth, requireApprovedSeller, sellerProfileController.updatePassword);

module.exports = router;
