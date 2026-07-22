// routes/admin/adminReportRoutes.js
const router = require('express').Router();
const ctrl   = require('../../controllers/admin/reportController');
const { adminAuth } = require('../../middleware/adminAuth');
const { requirePermission } = require('../../middleware/rbac');

const auth = [adminAuth, requirePermission('reports','view')];

router.get('/revenue',          ...auth, ctrl.getRevenue);
router.get('/sales',            ...auth, ctrl.getSales);
router.get('/customers',        ...auth, ctrl.getCustomers);
router.get('/orders',           ...auth, ctrl.getOrders);
router.get('/coupons',          ...auth, ctrl.getCoupons);
router.get('/export/:type',     ...auth, ctrl.exportReport);

module.exports = router;
