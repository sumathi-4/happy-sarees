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
  console.log('☁️ Cloudinary Media CDN connected successfully!');
} else {
  console.log('ℹ️ Cloudinary credentials not set. Using optimized media URL handling.');
}

/**
 * Uploads media (Base64 data URI or file buffer) to Cloudinary.
 * Returns the secure Cloudinary CDN URL (or original value if unconfigured).
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

  // If Cloudinary is configured, upload Base64 media to Cloudinary CDN
  if (isCloudinaryConfigured && fileStr.startsWith('data:')) {
    try {
      const isVideo = fileStr.startsWith('data:video/');
      const options = {
        folder: folder,
        resource_type: isVideo ? 'video' : 'auto'
      };

      if (!isVideo) {
        options.transformation = [
          { width: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
        ];
      }

      const uploadResponse = await cloudinary.uploader.upload(fileStr, options);
      return uploadResponse.secure_url;
    } catch (err) {
      console.error('[CloudinaryService] Upload error:', err.message);
      return fileStr;
    }
  }

  return fileStr;
}

/**
 * Uploads a file buffer (from multer memory storage) to Cloudinary via upload_stream.
 *
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} folder - Cloudinary folder
 * @param {string} resourceType - Cloudinary resource type ('raw', 'image', 'video', 'auto')
 * @returns {Promise<string>} Secure Cloudinary CDN URL
 */
async function uploadStreamToCloudinary(fileBuffer, folder = 'happy_sarees/products', resourceType = 'auto') {
  if (!fileBuffer) return null;

  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const options = {
        folder: folder,
        resource_type: resourceType
      };

      if (resourceType === 'video') {
        options.fetch_format = 'auto';
        options.quality = 'auto';
      }

      const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) {
          console.error('[CloudinaryService] Stream upload error:', error.message);
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      });
      stream.write(fileBuffer);
      stream.end();
    });
  }
  
  throw new Error('Cloudinary credentials not configured.');
}

module.exports = {
  uploadToCloudinary,
  uploadStreamToCloudinary,
  isCloudinaryConfigured
};
