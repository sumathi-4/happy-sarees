// routes/admin/adminCustomerRoutes.js
const router = require('express').Router();
const ctrl   = require('../../controllers/admin/customerController');
const { adminAuth } = require('../../middleware/adminAuth');
const { requirePermission } = require('../../middleware/rbac');

router.get('/',               adminAuth, requirePermission('customers','view'),   ctrl.getAll);
router.get('/:id',            adminAuth, requirePermission('customers','view'),   ctrl.getById);
router.put('/:id/status',     adminAuth, requirePermission('customers','edit'),   ctrl.setStatus);
router.get('/:id/analytics',  adminAuth, requirePermission('customers','view'),   ctrl.getAnalytics);

module.exports = router;
