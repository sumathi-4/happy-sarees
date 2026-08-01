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

// Standardized ID-based path patterns for items CRUD
router.get('/items',                         adminAuth, requirePermission('master_data','view'), ctrl.getAllItems);
router.get('/types/:typeId/items',           adminAuth, requirePermission('master_data','view'), ctrl.getItems);
router.post('/types/:typeId/items',          adminAuth, requirePermission('master_data','create'), ctrl.createItem);
router.put('/types/:typeId/items/:id',       adminAuth, requirePermission('master_data','edit'), ctrl.updateItem);
router.delete('/types/:typeId/items/:id',    adminAuth, requirePermission('master_data','delete'), ctrl.deleteItem);
router.put('/types/:typeId/items/:id/toggle', adminAuth, requirePermission('master_data','edit'), ctrl.toggleItem);

module.exports = router;
