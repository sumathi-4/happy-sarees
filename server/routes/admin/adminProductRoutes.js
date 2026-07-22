// routes/admin/adminProductRoutes.js
const router = require('express').Router();
const ctrl   = require('../../controllers/admin/productController');
const { adminAuth } = require('../../middleware/adminAuth');
const { requirePermission } = require('../../middleware/rbac');

router.get('/',                     adminAuth, requirePermission('products','view'),   ctrl.getAll);
router.post('/',                    adminAuth, requirePermission('products','create'),  ctrl.create);
router.post('/bulk',                adminAuth, requirePermission('products','manage'),  ctrl.bulkAction);
router.get('/:id',                  adminAuth, requirePermission('products','view'),   ctrl.getById);
router.put('/:id',                  adminAuth, requirePermission('products','edit'),    ctrl.update);
router.delete('/:id',               adminAuth, requirePermission('products','delete'),  ctrl.delete);
router.post('/:id/images',          adminAuth, requirePermission('products','edit'),    ctrl.addImage);
router.delete('/:id/images/:imageId', adminAuth, requirePermission('products','edit'), ctrl.removeImage);

module.exports = router;
