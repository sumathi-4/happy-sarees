const sellerProductService = require('../../services/seller/sellerProductService');
const { uploadToCloudinary } = require('../../services/cloudinaryService');
const db = require('../../db');

async function getCategories(req, res, next) {
  try {
    const result = await db.query('SELECT id, name FROM categories ORDER BY name ASC');
    res.json({ success: true, categories: result.rows });
  } catch (err) {
    next(err);
  }
}

async function getProducts(req, res, next) {
  try {
    const filters = {
      status: req.query.status,
      search: req.query.search
    };
    const products = await sellerProductService.getSellerProducts(req.seller.id, filters);
    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
}

async function getProductById(req, res, next) {
  try {
    const product = await sellerProductService.getSellerProductById(req.seller.id, req.params.id);
    res.json({ success: true, product });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
}

async function createProduct(req, res, next) {
  try {
    const {
      name,
      categoryId,
      description,
      price,
      originalPrice,
      fabric,
      color,
      weave,
      border,
      pallu,
      occasion,
      blouseIncluded,
      blouseSize,
      height,
      width,
      weight,
      sku,
      stockCount,
      images // Array of base64 strings or URLs
    } = req.body;

    // Upload base64 images to Cloudinary
    const uploadedImages = [];
    if (images && Array.isArray(images)) {
      for (const img of images) {
        if (img.startsWith('data:image/')) {
          const url = await uploadToCloudinary(img);
          uploadedImages.push(url);
        } else {
          uploadedImages.push(img);
        }
      }
    }

    const productId = await sellerProductService.createSellerProduct(req.seller.id, {
      name,
      categoryId,
      description,
      price,
      originalPrice,
      fabric,
      color,
      weave,
      border,
      pallu,
      occasion,
      blouseIncluded,
      blouseSize,
      height,
      width,
      weight,
      sku,
      stockCount,
      images: uploadedImages
    });

    res.status(201).json({
      success: true,
      message: 'Product created and submitted for approval successfully.',
      productId
    });
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const {
      name,
      categoryId,
      description,
      price,
      originalPrice,
      fabric,
      color,
      weave,
      border,
      pallu,
      occasion,
      blouseIncluded,
      blouseSize,
      height,
      width,
      weight,
      sku,
      stockCount,
      images // Array of base64 strings or URLs
    } = req.body;

    // Upload new base64 images to Cloudinary if they are raw base64 data
    const uploadedImages = [];
    if (images && Array.isArray(images)) {
      for (const img of images) {
        if (img.startsWith('data:image/')) {
          const url = await uploadToCloudinary(img);
          uploadedImages.push(url);
        } else {
          uploadedImages.push(img);
        }
      }
    }

    await sellerProductService.updateSellerProduct(req.seller.id, req.params.id, {
      name,
      categoryId,
      description,
      price,
      originalPrice,
      fabric,
      color,
      weave,
      border,
      pallu,
      occasion,
      blouseIncluded,
      blouseSize,
      height,
      width,
      weight,
      sku,
      stockCount,
      images: images ? uploadedImages : undefined
    });

    res.json({
      success: true,
      message: 'Product updated successfully.'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function deleteProduct(req, res, next) {
  try {
    await sellerProductService.deleteSellerProduct(req.seller.id, req.params.id);
    res.json({
      success: true,
      message: 'Product deleted successfully.'
    });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
}

async function uploadProductImage(req, res, next) {
  try {
    const { image } = req.body; // base64
    if (!image) {
      return res.status(400).json({ success: false, message: 'Image data is required.' });
    }

    const url = await uploadToCloudinary(image);
    res.json({
      success: true,
      url
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCategories,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage
};

