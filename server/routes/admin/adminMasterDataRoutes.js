// routes/admin/adminMasterDataRoutes.js
const router = require('express').Router();
const ctrl   = require('../../controllers/admin/masterDataController');
const { adminAuth } = require('../../middleware/adminAuth');
const { requirePermission } = require('../../middleware/rbac');

router.get('/types',                adminAuth, requirePermission('master_data','view'), ctrl.getAllTypes);
router.post('/types',               adminAuth, requirePermission('master_data','create'), ctrl.createType);
router.put('/types/:id',            adminAuth, requirePermission('master_data','edit'), ctrl.updateType);
router.delete('/types/:id',         adminAuth, requirePermission('master_data','delete'), ctrl.deleteType);
router.put('/types/:id/toggle',     adminAuth, requirePermission('master_data','edit'), ctrl.toggleType);
router.put('/reorder',              adminAuth, requirePermission('master_data','edit'), ctrl.reorderItems);

// Support both /:type and /types/:type/items path patterns for items CRUD
router.get('/:type',                adminAuth, requirePermission('master_data','view'), ctrl.getItems);
router.get('/types/:type/items',    adminAuth, requirePermission('master_data','view'), ctrl.getItems);

router.post('/:type',               adminAuth, requirePermission('master_data','create'), ctrl.createItem);
router.post('/types/:type/items',   adminAuth, requirePermission('master_data','create'), ctrl.createItem);

router.put('/:type/:id',            adminAuth, requirePermission('master_data','edit'), ctrl.updateItem);
router.put('/types/:type/items/:id', adminAuth, requirePermission('master_data','edit'), ctrl.updateItem);

router.delete('/:type/:id',         adminAuth, requirePermission('master_data','delete'), ctrl.deleteItem);
router.delete('/types/:type/items/:id', adminAuth, requirePermission('master_data','delete'), ctrl.deleteItem);

router.put('/:type/:id/toggle',     adminAuth, requirePermission('master_data','edit'), ctrl.toggleItem);
router.put('/types/:type/items/:id/toggle', adminAuth, requirePermission('master_data','edit'), ctrl.toggleItem);

module.exports = router;
