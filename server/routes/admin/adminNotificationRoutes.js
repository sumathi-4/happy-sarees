// routes/admin/adminNotificationRoutes.js
const router = require('express').Router();
const ctrl   = require('../../controllers/admin/notificationController');
const { adminAuth } = require('../../middleware/adminAuth');

router.get('/',              adminAuth, ctrl.getAll);
router.put('/:id/read',      adminAuth, ctrl.markRead);
router.put('/read-all',      adminAuth, ctrl.markAllRead);
router.delete('/:id',        adminAuth, ctrl.delete);
router.post('/check-stock',  adminAuth, ctrl.checkLowStock);

module.exports = router;
