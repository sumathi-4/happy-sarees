// controllers/admin/uploadController.js
// Handles base64 image/video uploads stored in PostgreSQL
const { success, error } = require('../../utils/response');

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

exports.uploadImage = async (req, res, next) => {
  try {
    const { imageData, filename } = req.body;
    if (!validateBase64(imageData)) {
      return error(res, 'Valid base64 image data URL is required (data:image/...)', 400);
    }
    const sizeKb = base64SizeKb(imageData);
    if (sizeKb > 5120) return error(res, 'Image too large. Maximum size is 5MB.', 413);

    return success(res, {
      url: imageData,
      filename: filename || 'upload.jpg',
      sizeKb,
    }, 'Image ready for use.');
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

exports.deleteFile = async (req, res, next) => {
  // For DB-stored base64 images, deletion is handled by the entity's delete endpoint.
  // This endpoint is a no-op stub for compatibility.
  return success(res, {}, 'File reference removed.');
};
