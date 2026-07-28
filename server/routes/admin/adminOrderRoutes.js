// routes/admin/adminOrderRoutes.js
const router = require('express').Router();
const ctrl   = require('../../controllers/admin/orderController');
const { adminAuth } = require('../../middleware/adminAuth');
const { requirePermission } = require('../../middleware/rbac');

router.get('/',               adminAuth, requirePermission('orders','view'),   ctrl.getAll);
router.get('/:id',            adminAuth, requirePermission('orders','view'),   ctrl.getById);
router.put('/:id/status',     adminAuth, requirePermission('orders','edit'),   ctrl.updateStatus);
router.put('/:id/tracking',   adminAuth, requirePermission('orders','edit'),   ctrl.updateTracking);
router.post('/:id/refund',    adminAuth, requirePermission('orders','manage'), ctrl.processRefund);
router.put('/:id/cancel',     adminAuth, requirePermission('orders','manage'), ctrl.cancel);
router.get('/:id/invoice',    adminAuth, requirePermission('orders','view'),   ctrl.getInvoice);
router.put('/:id/notes',      adminAuth, requirePermission('orders','edit'),   ctrl.updateNotes);
router.delete('/:id',         adminAuth, requirePermission('orders','manage'), ctrl.deleteOrder);

module.exports = router;
