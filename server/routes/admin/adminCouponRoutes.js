// routes/admin/adminCouponRoutes.js
const router = require('express').Router();
const ctrl   = require('../../controllers/admin/couponController');
const { adminAuth } = require('../../middleware/adminAuth');
const { requirePermission } = require('../../middleware/rbac');

router.get('/',               adminAuth, requirePermission('coupons','view'),   ctrl.getAll);
router.post('/',              adminAuth, requirePermission('coupons','create'),  ctrl.create);
router.post('/validate',      adminAuth, requirePermission('coupons','view'),   ctrl.validate);
router.get('/:id',            adminAuth, requirePermission('coupons','view'),   ctrl.getById);
router.put('/:id',            adminAuth, requirePermission('coupons','edit'),    ctrl.update);
router.delete('/:id',         adminAuth, requirePermission('coupons','delete'),  ctrl.delete);
router.put('/:id/toggle',     adminAuth, requirePermission('coupons','edit'),    ctrl.toggle);

module.exports = router;
