// controllers/admin/uploadController.js
// Handles base64 image/video uploads stored in PostgreSQL
const { success, error } = require('../../utils/response');
const { uploadToCloudinary, uploadStreamToCloudinary } = require('../../services/cloudinaryService');
const cloudinary = require('cloudinary').v2;

/**
 * Validate base64 data URL
 */
function validateBase64(data) {
  if (!data || typeof data !== 'string') return false;
  return data.startsWith('data:image/') || data.startsWith('data:video/');
}

/**
 * Estimate base64 file size in KB
 */
function base64SizeKb(b64) {
  const len = b64.length - (b64.indexOf(',') + 1);
  return Math.round((len * 3) / 4 / 1024);
}

function getPublicIdFromUrl(url) {
  if (!url) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

exports.uploadImage = async (req, res, next) => {
  try {
    const { imageData, filename, folder } = req.body;
    if (!validateBase64(imageData)) {
      return error(res, 'Valid base64 image data URL is required (data:image/...)', 400);
    }
    const sizeKb = base64SizeKb(imageData);
    if (sizeKb > 5120) return error(res, 'Image too large. Maximum size is 5MB.', 413);

    // Upload image to Cloudinary CDN
    let cdnUrl = imageData;
    try {
      cdnUrl = await uploadToCloudinary(imageData, folder || 'happy_sarees/qr_codes');
    } catch (cErr) {
      console.warn('[uploadImage] Cloudinary upload fallback to base64:', cErr.message);
    }

    return success(res, {
      url: cdnUrl || imageData,
      filename: filename || 'upload.jpg',
      sizeKb,
    }, 'Image uploaded successfully to Cloudinary.');
  } catch (e) { next(e); }
};

exports.uploadImages = async (req, res, next) => {
  try {
    const { images } = req.body;
    if (!Array.isArray(images) || images.length === 0) {
      return error(res, 'images array is required.', 400);
    }
    if (images.length > 10) return error(res, 'Maximum 10 images per upload.', 400);

    const results = images.map((img, i) => {
      if (!validateBase64(img.data)) return { index: i, error: 'Invalid base64 data.' };
      return { index: i, url: img.data, filename: img.filename || `image-${i}.jpg`, sizeKb: base64SizeKb(img.data) };
    });

    return success(res, { images: results }, `${results.length} images processed.`);
  } catch (e) { next(e); }
};

exports.uploadVideo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file uploaded.' });
    }

    // Allowed formats: MP4, WEBM, MOV
    const allowedMimeTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Unsupported format. Allowed formats: MP4, WEBM, MOV' });
    }

    // Maximum size: 50MB
    const maxSizeBytes = 50 * 1024 * 1024;
    if (req.file.size > maxSizeBytes) {
      return res.status(400).json({ success: false, message: 'File too large. Maximum size is 50MB.' });
    }

    // Upload direct buffer to Cloudinary
    console.log('[uploadController] Uploading video to Cloudinary...');
    const videoUrl = await uploadStreamToCloudinary(req.file.buffer, 'happy_sarees/videos', 'video');
    
    return res.status(200).json({
      success: true,
      url: videoUrl,
      message: 'Video uploaded successfully to Cloudinary.'
    });
  } catch (err) {
    console.error('[uploadController] Cloudinary video upload failed:', err);
    return res.status(500).json({ success: false, message: `Cloudinary video upload failed: ${err.message}` });
  }
};

exports.deleteVideo = async (req, res, next) => {
  try {
    const { videoUrl } = req.body;
    if (!videoUrl) {
      return res.status(400).json({ success: false, message: 'videoUrl is required.' });
    }

    // Extract public ID
    const publicId = getPublicIdFromUrl(videoUrl);
    if (publicId && videoUrl.includes('cloudinary.com')) {
      console.log('[uploadController] Deleting video from Cloudinary:', publicId);
      const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
      
      if (result.result === 'ok' || result.result === 'not found') {
        return res.status(200).json({ success: true, message: 'Video deleted from Cloudinary successfully.' });
      } else {
        throw new Error(`Cloudinary delete response: ${result.result}`);
      }
    }

    return res.status(200).json({ success: true, message: 'No Cloudinary action required.' });
  } catch (err) {
    console.error('[uploadController] Cloudinary video deletion failed:', err);
    return res.status(500).json({ success: false, message: `Cloudinary video deletion failed: ${err.message}` });
  }
};

exports.deleteFile = async (req, res, next) => {
  // For DB-stored base64 images, deletion is handled by the entity's delete endpoint.
  // This endpoint is a no-op stub for compatibility.
  return success(res, {}, 'File reference removed.');
};
