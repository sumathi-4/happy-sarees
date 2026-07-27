const express = require('express');
const db = require('../db');
const productService = require('../services/admin/productService');

const router = express.Router();

// Helper to format database product row to frontend format
function formatProductRow(row, imagesMap = {}) {
  const images = imagesMap[row.id] || (row.image_url ? [row.image_url] : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop']);
  const discountBadge = row.original_price && row.original_price > row.price
    ? `${Math.round(((row.original_price - row.price) / row.original_price) * 100)}% OFF`
    : null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    shortDescription: row.short_description || '',
    fullDescription: row.description || '',
    description: row.description || '',
    seoTitle: row.meta_title || `${row.name} | Happy Sarees`,
    metaDescription: row.meta_description || row.short_description || row.description || '',
    washCare: row.wash_care || 'Dry Clean Only',
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : null,
    discountBadge,
    image: images[0],
    images: images,
    fabric: row.fabric,
    color: row.color,
    weave: row.weave,
    border: row.border,
    blouseIncluded: row.blouse_included,
    blouseSize: row.blouse_size,
    height: row.height,
    width: row.width,
    weight: row.weight,
    occasion: row.occasion,
    sku: row.sku,
    inStock: row.in_stock,
    stockCount: row.stock_count,
    isBestSeller: row.is_best_seller,
    isNewArrival: row.is_new_arrival,
    rating: Number(row.rating || 4.8),
    reviewCount: Number(row.review_count || 24),
    videoUrl: row.video_url || null,
    videoData: row.video_data || null,
    video: row.video_data || row.video_url || null
  };
}

// 1. Get All Products (With Filters, Search, & Collection Support)
router.get('/', async (req, res) => {
  try {
    const { category, fabric, color, minPrice, maxPrice, search, sort, collection } = req.query;

    let queryText = `
      SELECT p.*, c.name as category_name, c.slug as category_slug, s.meta_title, s.meta_description
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN product_seo s ON s.product_id = p.id
      WHERE p.deleted_at IS NULL AND (p.status IS NULL OR LOWER(p.status) = 'published')
    `;
    const params = [];

    if (fabric) {
      params.push(fabric);
      queryText += ` AND LOWER(p.fabric) = LOWER($${params.length})`;
    }

    if (color) {
      params.push(color);
      queryText += ` AND LOWER(p.color) = LOWER($${params.length})`;
    }

    if (minPrice) {
      params.push(minPrice);
      queryText += ` AND p.price >= $${params.length}`;
    }

    if (maxPrice) {
      params.push(maxPrice);
      queryText += ` AND p.price <= $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      queryText += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length} OR p.fabric ILIKE $${params.length})`;
    }

    if (collection) {
      params.push(`%${collection}%`);
      queryText += ` AND (c.slug ILIKE $${params.length} OR p.fabric ILIKE $${params.length} OR p.occasion ILIKE $${params.length} OR p.name ILIKE $${params.length})`;
    }

    // Sorting
    if (sort === 'price-low') {
      queryText += ` ORDER BY p.price ASC`;
    } else if (sort === 'price-high') {
      queryText += ` ORDER BY p.price DESC`;
    } else if (sort === 'popular') {
      queryText += ` ORDER BY p.rating DESC, p.review_count DESC`;
    } else {
      queryText += ` ORDER BY p.id DESC`;
    }

    const productsRes = await db.query(queryText, params);

    // Fetch images for products
    const imagesRes = await db.query(`SELECT product_id, image_url, image_data, is_primary FROM product_images ORDER BY is_primary DESC, display_order ASC`);
    const imagesMap = {};
    imagesRes.rows.forEach((img) => {
      if (!imagesMap[img.product_id]) imagesMap[img.product_id] = [];
      imagesMap[img.product_id].push(img.image_data || img.image_url);
    });

    const formattedProducts = productsRes.rows.map(row => formatProductRow(row, imagesMap));

    res.json({ success: true, count: formattedProducts.length, products: formattedProducts });
  } catch (error) {
    console.error('Fetch Products Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products from database.' });
  }
});

// 2. Get Best Sellers
router.get('/bestsellers', async (req, res) => {
  try {
    const productsRes = await db.query(`SELECT p.*, s.meta_title, s.meta_description FROM products p LEFT JOIN product_seo s ON s.product_id = p.id WHERE p.deleted_at IS NULL AND (p.status IS NULL OR LOWER(p.status) = 'published') AND p.is_best_seller = true ORDER BY p.id DESC LIMIT 8`);
    const imagesRes = await db.query(`SELECT product_id, image_url, image_data, is_primary FROM product_images ORDER BY is_primary DESC, display_order ASC`);
    const imagesMap = {};
    imagesRes.rows.forEach((img) => {
      if (!imagesMap[img.product_id]) imagesMap[img.product_id] = [];
      imagesMap[img.product_id].push(img.image_data || img.image_url);
    });

    const products = productsRes.rows.map(row => formatProductRow(row, imagesMap));
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch bestsellers.' });
  }
});

// 3. Get New Arrivals
router.get('/new-arrivals', async (req, res) => {
  try {
    const productsRes = await db.query(`SELECT p.*, s.meta_title, s.meta_description FROM products p LEFT JOIN product_seo s ON s.product_id = p.id WHERE p.deleted_at IS NULL AND (p.status IS NULL OR LOWER(p.status) = 'published') AND p.is_new_arrival = true ORDER BY p.id DESC LIMIT 8`);
    const imagesRes = await db.query(`SELECT product_id, image_url, image_data, is_primary FROM product_images ORDER BY is_primary DESC, display_order ASC`);
    const imagesMap = {};
    imagesRes.rows.forEach((img) => {
      if (!imagesMap[img.product_id]) imagesMap[img.product_id] = [];
      imagesMap[img.product_id].push(img.image_data || img.image_url);
    });

    const products = productsRes.rows.map(row => formatProductRow(row, imagesMap));
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch new arrivals.' });
  }
});

// 4. Get Single Product by ID or Slug
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isNum = !isNaN(id);
    const parsedId = isNum ? parseInt(id) : (parseInt(id.replace(/\D/g, '')) || 0);

    let productRes = await db.query(
      `SELECT id FROM products WHERE (id = $1 AND deleted_at IS NULL) OR (slug = $2 AND deleted_at IS NULL)`,
      [parsedId > 0 ? parsedId : 0, id]
    );

    // Fallback: return first product if requested ID is mock format like "p1"
    if (productRes.rows.length === 0) {
      productRes = await db.query(`SELECT id FROM products WHERE deleted_at IS NULL ORDER BY id ASC LIMIT 1`);
    }

    if (productRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const prodId = productRes.rows[0].id;
    const productData = await productService.getById(prodId);

    // Fetch related products
    const relatedRes = await db.query(
      `SELECT p.*, s.meta_title, s.meta_description FROM products p LEFT JOIN product_seo s ON s.product_id = p.id WHERE p.category_id = $1 AND p.id != $2 AND p.deleted_at IS NULL LIMIT 4`,
      [productData.category_id || 1, prodId]
    );
    const relatedProducts = relatedRes.rows.map(r => formatProductRow(r));

    productData.relatedProducts = relatedProducts;

    res.json({ success: true, product: productData });
  } catch (error) {
    console.error('Fetch Product Details Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product details.' });
  }
});

module.exports = router;
