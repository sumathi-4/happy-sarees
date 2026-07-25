const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary from environment variables
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  console.log('☁️ Cloudinary Image CDN connected successfully!');
} else {
  console.log('ℹ️ Cloudinary credentials not set. Using optimized lightweight image handling.');
}

/**
 * Uploads an image (Base64 data URI or file buffer) to Cloudinary.
 * Returns the secure Cloudinary CDN URL (or original value if Cloudinary is unconfigured).
 *
 * @param {string} fileStr - Base64 data URI or HTTP URL
 * @param {string} folder - Destination folder on Cloudinary (default: 'happy_sarees/products')
 * @returns {Promise<string>} Secure Cloudinary CDN URL
 */
async function uploadToCloudinary(fileStr, folder = 'happy_sarees/products') {
  if (!fileStr) return null;

  // If already an HTTP/HTTPS URL (e.g. Unsplash or Cloudinary), return directly
  if (fileStr.startsWith('http://') || fileStr.startsWith('https://')) {
    return fileStr;
  }

  // If Cloudinary is configured, upload Base64 image to Cloudinary CDN
  if (isCloudinaryConfigured && fileStr.startsWith('data:')) {
    try {
      const uploadResponse = await cloudinary.uploader.upload(fileStr, {
        folder: folder,
        resource_type: 'auto',
        transformation: [
          { width: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
        ]
      });
      return uploadResponse.secure_url;
    } catch (err) {
      console.error('[CloudinaryService] Upload error:', err.message);
      return fileStr;
    }
  }

  return fileStr;
}

module.exports = {
  uploadToCloudinary,
  isCloudinaryConfigured
};
