// routes/admin/adminDashboardRoutes.js
const router = require('express').Router();
const ctrl   = require('../../controllers/admin/dashboardController');
const { adminAuth } = require('../../middleware/adminAuth');
const { requirePermission } = require('../../middleware/rbac');

const auth = [adminAuth, requirePermission('dashboard','view')];

router.get('/stats',            ...auth, ctrl.getStats);
router.get('/sales-graph',      ...auth, ctrl.getSalesGraph);
router.get('/order-status',     ...auth, ctrl.getOrderStatusChart);
router.get('/recent-orders',    ...auth, ctrl.getRecentOrders);
router.get('/top-selling',      ...auth, ctrl.getTopSelling);
router.get('/low-stock',        ...auth, ctrl.getLowStock);
router.get('/latest-customers', ...auth, ctrl.getLatestCustomers);
router.get('/activities',       ...auth, ctrl.getActivities);

module.exports = router;
