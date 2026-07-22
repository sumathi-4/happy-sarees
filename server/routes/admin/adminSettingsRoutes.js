// routes/admin/adminSettingsRoutes.js
const router = require('express').Router();
const ctrl   = require('../../controllers/admin/settingsController');
const { adminAuth } = require('../../middleware/adminAuth');
const { requirePermission } = require('../../middleware/rbac');

const view   = [adminAuth, requirePermission('settings','view')];
const manage = [adminAuth, requirePermission('settings','manage')];

// Store Settings
router.get('/',                  ...view,   ctrl.getAll);
router.put('/store',             ...manage, ctrl.updateStore);
router.put('/smtp',              ...manage, ctrl.updateSmtp);
router.put('/payment',           ...manage, ctrl.updatePayment);
router.put('/shipping',          ...manage, ctrl.updateShipping);
router.put('/tax',               ...manage, ctrl.updateTax);
router.put('/seo',               ...manage, ctrl.updateSeo);
router.post('/logo',             ...manage, ctrl.uploadLogo);
router.post('/favicon',          ...manage, ctrl.uploadFavicon);

// Admin User Management
router.get('/admins',            ...view,   ctrl.getAdminUsers);
router.post('/admins',           ...manage, ctrl.createAdminUser);
router.put('/admins/:id',        ...manage, ctrl.updateAdminUser);
router.delete('/admins/:id',     ...manage, ctrl.deleteAdminUser);

// Roles & Permissions
router.get('/roles',             ...view,   ctrl.getRoles);
router.get('/roles/:roleId/permissions', ...view, ctrl.getPermissions);
router.put('/roles/:roleId/permissions', ...manage, ctrl.updatePermissions);

module.exports = router;
