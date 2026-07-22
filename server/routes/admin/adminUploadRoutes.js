// routes/admin/adminUploadRoutes.js
const router = require('express').Router();
const ctrl   = require('../../controllers/admin/uploadController');
const { adminAuth } = require('../../middleware/adminAuth');

router.post('/image',   adminAuth, ctrl.uploadImage);
router.post('/images',  adminAuth, ctrl.uploadImages);
router.delete('/',      adminAuth, ctrl.deleteFile);

module.exports = router;
