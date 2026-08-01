const express = require('express');
const db = require('../db');
const productService = require('../services/admin/productService');

const router = express.Router();

// Helper to format database product row to frontend format
function formatProductRow(row, imagesMap = {}) {
  const images = imagesMap[row.id] || (row.image_url ? [row.image_url] : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop']);
  const hasPriceDiscount = row.original_price && Number(row.original_price) > Number(row.price);
  const discountPercentage = hasPriceDiscount
    ? Math.round(((Number(row.original_price) - Number(row.price)) / Number(row.original_price)) * 100)
    : (row.discount_percentage ? Number(row.discount_percentage) : 0);
  const discountBadge = discountPercentage > 0
    ? `${discountPercentage}% OFF`
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
    discountPercentage,
    discount_percentage: discountPercentage,
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
    isBestSeller: Boolean(row.is_best_seller),
    bestSeller: Boolean(row.is_best_seller),
    is_best_seller: Boolean(row.is_best_seller),
    isNewArrival: Boolean(row.is_new_arrival),
    newArrival: Boolean(row.is_new_arrival),
    is_new_arrival: Boolean(row.is_new_arrival),
    rating: (row.review_count && Number(row.review_count) > 0) ? (row.rating !== null && row.rating !== undefined ? Number(row.rating) : 0) : 0,
    videoUrl: row.video_url || null,
    video: row.video_url || null
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

    if (category) {
      params.push(category);
      queryText += ` AND (c.slug = $${params.length} OR c.name ILIKE $${params.length})`;
    }

    if (search) {
      params.push(`%${search}%`);
      queryText += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length} OR p.fabric ILIKE $${params.length})`;
    }

    if (collection) {
      const colLower = collection.toLowerCase();
      if (colLower === 'bestsellers' || colLower === 'best-sellers') {
        queryText += ` AND p.is_best_seller = true`;
      } else if (colLower === 'newarrivals' || colLower === 'new-arrivals') {
        queryText += ` AND p.is_new_arrival = true`;
      } else if (colLower === 'sale' || colLower === 'discounted') {
        queryText += ` AND (p.discount_percentage > 0 OR (p.original_price IS NOT NULL AND p.original_price > p.price))`;
      }
    }

    if (sort === 'price_asc' || sort === 'price-low') {
      queryText += ` ORDER BY p.price ASC`;
    } else if (sort === 'price_desc' || sort === 'price-high') {
      queryText += ` ORDER BY p.price DESC`;
    } else if (sort === 'newest') {
      queryText += ` ORDER BY p.created_at DESC`;
    } else {
      queryText += ` ORDER BY p.id DESC`;
    }

    const productsRes = await db.query(queryText, params);

    // Fetch images for products
    const imagesRes = await db.query(`SELECT product_id, image_url, is_primary FROM product_images ORDER BY is_primary DESC, display_order ASC`);
    const imagesMap = {};
    imagesRes.rows.forEach((img) => {
      if (!imagesMap[img.product_id]) imagesMap[img.product_id] = [];
      imagesMap[img.product_id].push(img.image_url);
    });

    const formattedProducts = productsRes.rows.map(row => formatProductRow(row, imagesMap));

    res.json({ success: true, count: formattedProducts.length, products: formattedProducts });
  } catch (error) {
    console.error('Fetch Products Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Get Best Sellers
router.get('/bestsellers', async (req, res) => {
  try {
    const productsRes = await db.query(`SELECT p.*, s.meta_title, s.meta_description FROM products p LEFT JOIN product_seo s ON s.product_id = p.id WHERE p.deleted_at IS NULL AND (p.status IS NULL OR LOWER(p.status) = 'published') AND p.is_best_seller = true ORDER BY p.id DESC LIMIT 8`);
    const imagesRes = await db.query(`SELECT product_id, image_url, is_primary FROM product_images ORDER BY is_primary DESC, display_order ASC`);
    const imagesMap = {};
    imagesRes.rows.forEach((img) => {
      if (!imagesMap[img.product_id]) imagesMap[img.product_id] = [];
      imagesMap[img.product_id].push(img.image_url);
    });

    const products = productsRes.rows.map(row => formatProductRow(row, imagesMap));
    res.json({ success: true, products });
  } catch (error) {
    console.error('Fetch Bestsellers Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Get New Arrivals
router.get('/new-arrivals', async (req, res) => {
  try {
    let productsRes = await db.query(`SELECT p.*, s.meta_title, s.meta_description FROM products p LEFT JOIN product_seo s ON s.product_id = p.id WHERE p.deleted_at IS NULL AND (p.status IS NULL OR LOWER(p.status) = 'published') AND p.is_new_arrival = true ORDER BY p.id DESC LIMIT 4`);

    if (productsRes.rows.length < 4) {
      const existingIds = productsRes.rows.map(r => r.id);
      const needed = 4 - productsRes.rows.length;
      let fallbackQuery = `SELECT p.*, s.meta_title, s.meta_description FROM products p LEFT JOIN product_seo s ON s.product_id = p.id WHERE p.deleted_at IS NULL AND (p.status IS NULL OR LOWER(p.status) = 'published')`;
      if (existingIds.length > 0) {
        fallbackQuery += ` AND p.id NOT IN (${existingIds.join(',')})`;
      }
      fallbackQuery += ` ORDER BY p.id DESC LIMIT ${needed}`;
      const additionalRes = await db.query(fallbackQuery);
      productsRes.rows = [...productsRes.rows, ...additionalRes.rows];
    }

    const imagesRes = await db.query(`SELECT product_id, image_url, is_primary FROM product_images ORDER BY is_primary DESC, display_order ASC`);
    const imagesMap = {};
    imagesRes.rows.forEach((img) => {
      if (!imagesMap[img.product_id]) imagesMap[img.product_id] = [];
      imagesMap[img.product_id].push(img.image_url);
    });

    const products = productsRes.rows.map(row => formatProductRow(row, imagesMap));
    res.json({ success: true, products });
  } catch (error) {
    console.error('Fetch New Arrivals Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Get Products With Uploaded Videos (Reusable Endpoint for Watch & Buy, Homepage, Apps)
router.get('/videos', async (req, res) => {
  try {
    const productsRes = await db.query(`
      SELECT p.*, s.meta_title, s.meta_description 
      FROM products p 
      LEFT JOIN product_seo s ON s.product_id = p.id 
      WHERE p.deleted_at IS NULL 
        AND LOWER(p.status) = 'published' 
        AND p.video_url IS NOT NULL 
        AND TRIM(p.video_url) <> '' 
      ORDER BY p.id DESC
    `);
    
    const imagesRes = await db.query(`SELECT product_id, image_url, is_primary FROM product_images ORDER BY is_primary DESC, display_order ASC`);
    const imagesMap = {};
    imagesRes.rows.forEach((img) => {
      if (!imagesMap[img.product_id]) imagesMap[img.product_id] = [];
      imagesMap[img.product_id].push(img.image_url);
    });

    const products = productsRes.rows.map(row => formatProductRow(row, imagesMap));
    res.json({ success: true, count: products.length, data: products, products });
  } catch (error) {
    console.error('Fetch Video Products Error:', error);
    res.status(500).json({ success: false, message: error.message });
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
