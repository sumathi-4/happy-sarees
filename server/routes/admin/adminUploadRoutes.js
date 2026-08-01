// routes/admin/adminUploadRoutes.js
const router = require('express').Router();
const ctrl   = require('../../controllers/admin/uploadController');
const { adminAuth } = require('../../middleware/adminAuth');
const multer = require('multer');

// Configure multer with memory storage for direct Cloudinary streaming
const upload = multer({ storage: multer.memoryStorage() });

router.post('/image',        adminAuth, ctrl.uploadImage);
router.post('/images',       adminAuth, ctrl.uploadImages);
router.post('/video',        adminAuth, upload.single('video'), ctrl.uploadVideo);
router.post('/delete-video', adminAuth, ctrl.deleteVideo);
router.delete('/',          adminAuth, ctrl.deleteFile);

module.exports = router;
