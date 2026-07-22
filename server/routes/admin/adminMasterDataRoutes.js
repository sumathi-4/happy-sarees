// routes/admin/adminMasterDataRoutes.js
const router = require('express').Router();
const ctrl   = require('../../controllers/admin/masterDataController');
const { adminAuth } = require('../../middleware/adminAuth');
const { requirePermission } = require('../../middleware/rbac');

router.get('/types',                adminAuth, requirePermission('master_data','view'), ctrl.getAllTypes);
router.put('/reorder',              adminAuth, requirePermission('master_data','edit'), ctrl.reorderItems);
router.get('/:type',                adminAuth, requirePermission('master_data','view'), ctrl.getItems);
router.post('/:type',               adminAuth, requirePermission('master_data','create'), ctrl.createItem);
router.put('/:type/:id',            adminAuth, requirePermission('master_data','edit'), ctrl.updateItem);
router.delete('/:type/:id',         adminAuth, requirePermission('master_data','delete'), ctrl.deleteItem);
router.put('/:type/:id/toggle',     adminAuth, requirePermission('master_data','edit'), ctrl.toggleItem);

module.exports = router;
