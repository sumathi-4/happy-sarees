// routes/admin/adminCmsRoutes.js
const router = require('express').Router();
const ctrl   = require('../../controllers/admin/cmsController');
const { adminAuth } = require('../../middleware/adminAuth');
const { requirePermission } = require('../../middleware/rbac');

router.get('/sections',                           adminAuth, requirePermission('homepage_cms','view'),   ctrl.getAllSections);
router.get('/sections/:section',                  adminAuth, requirePermission('homepage_cms','view'),   ctrl.getSection);
router.put('/sections/:section',                  adminAuth, requirePermission('homepage_cms','edit'),   ctrl.updateSection);
router.post('/sections/:section/media',           adminAuth, requirePermission('homepage_cms','edit'),   ctrl.uploadMedia);
router.put('/sections/:section/publish',          adminAuth, requirePermission('homepage_cms','manage'), ctrl.togglePublish);
router.delete('/sections/:section/blocks/:blockId', adminAuth, requirePermission('homepage_cms','delete'), ctrl.deleteBlock);

module.exports = router;
