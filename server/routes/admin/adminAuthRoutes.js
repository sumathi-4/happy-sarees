// routes/admin/adminAuthRoutes.js
const router = require('express').Router();
const ctrl   = require('../../controllers/admin/authController');
const { adminAuth } = require('../../middleware/adminAuth');

// Public
router.post('/login',           ctrl.login);
router.post('/logout',          ctrl.logout);
router.post('/refresh',         ctrl.refresh);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password',  ctrl.resetPassword);

// Protected
router.get('/me',               adminAuth, ctrl.getMe);
router.put('/profile',          adminAuth, ctrl.updateProfile);
router.put('/change-password',  adminAuth, ctrl.changePassword);

module.exports = router;
