const express = require('express');
const db = require('../db');
const productService = require('../services/admin/productService');

const router = express.Router();

// Helper to format database product row to frontend format
function formatProductRow(row, imagesMap = {}, specsMap = {}) {
  const images = imagesMap[row.id] || (row.image_url ? [row.image_url] : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop']);
  const hasPriceDiscount = row.original_price && Number(row.original_price) > Number(row.price);
  const discountPercentage = hasPriceDiscount
    ? Math.round(((Number(row.original_price) - Number(row.price)) / Number(row.original_price)) * 100)
    : (row.discount_percentage ? Number(row.discount_percentage) : 0);
  const discountBadge = discountPercentage > 0
    ? `${discountPercentage}% OFF`
    : null;

  const productSpecs = specsMap[row.id] || {};

  const fabricVal = productSpecs.fabric || productSpecs.fabrics || row.fabric;
  const colorVal = productSpecs.color || productSpecs.colors || row.color;
  const occasionVal = productSpecs.occasion || productSpecs.occasions || row.occasion;
  const patternVal = productSpecs.pattern || productSpecs.patterns || row.pattern;
  const weaveVal = productSpecs.weave || productSpecs.weaves || row.weave;
  const borderVal = productSpecs.border || productSpecs.borders || row.border;
  const brandVal = productSpecs.brand || productSpecs.brands || row.brand || 'Happy Sarees';
  const collectionVal = productSpecs.collection || productSpecs.collections || row.collection;

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
    
    // Dynamic specifications mapping
    fabric: fabricVal,
    color: colorVal,
    weave: weaveVal,
    border: borderVal,
    occasion: occasionVal,
    brand: brandVal,
    collection: collectionVal,
    pattern: patternVal,
    
    blouseIncluded: row.blouse_included,
    blouseSize: row.blouse_size,
    height: row.height,
    width: row.width,
    weight: row.weight,
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
    video_url: row.video_url || null,
    videoData: row.video_data || null,
    video_data: row.video_data || null,
    video: row.video_url || null,
    customMasterData: productSpecs,
    custom_master_data: productSpecs
  };
}

// Helper to query and build specs mapping for list views
async function getSpecsMap() {
  try {
    const specsRes = await db.query(`
      SELECT ps.product_id, ps.master_type_id, ps.master_value_id, mt.slug as master_type_slug, mt.name as master_type_name,
             mi.name as master_value_name, ps.custom_value
      FROM product_specifications ps
      JOIN master_types mt ON ps.master_type_id = mt.id
      LEFT JOIN master_items mi ON ps.master_value_id = mi.id
      WHERE mt.is_active = true
    `);
    
    const specsMap = {};
    specsRes.rows.forEach(r => {
      const prodId = r.product_id;
      if (!specsMap[prodId]) specsMap[prodId] = {};
      const valName = r.master_value_name || r.custom_value;
      if (valName) {
        specsMap[prodId][r.master_type_id] = valName;
        specsMap[prodId][r.master_type_slug] = valName;
        specsMap[prodId][r.master_type_name] = valName;
        const singular = r.master_type_slug.endsWith('s') ? r.master_type_slug.slice(0, -1) : r.master_type_slug;
        specsMap[prodId][singular] = valName;
        specsMap[prodId][singular.replace(/-/g, '_')] = valName;
      }
    });
    return specsMap;
  } catch (err) {
    console.error('Error fetching specs map:', err.message);
    return {};
  }
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
      WHERE p.deleted_at IS NULL AND (p.status IS NULL OR LOWER(p.status) = 'published') AND p.approval_status = 'approved'
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

    const specsMap = await getSpecsMap();
    const formattedProducts = productsRes.rows.map(row => formatProductRow(row, imagesMap, specsMap));

    res.json({ success: true, count: formattedProducts.length, products: formattedProducts });
  } catch (error) {
    console.error('Fetch Products Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Get Best Sellers
router.get('/bestsellers', async (req, res) => {
  try {
    const productsRes = await db.query(`SELECT p.*, s.meta_title, s.meta_description FROM products p LEFT JOIN product_seo s ON s.product_id = p.id WHERE p.deleted_at IS NULL AND (p.status IS NULL OR LOWER(p.status) = 'published') AND p.approval_status = 'approved' AND p.is_best_seller = true ORDER BY p.id DESC LIMIT 8`);
    const imagesRes = await db.query(`SELECT product_id, image_url, is_primary FROM product_images ORDER BY is_primary DESC, display_order ASC`);
    const imagesMap = {};
    imagesRes.rows.forEach((img) => {
      if (!imagesMap[img.product_id]) imagesMap[img.product_id] = [];
      imagesMap[img.product_id].push(img.image_url);
    });

    const specsMap = await getSpecsMap();
    const products = productsRes.rows.map(row => formatProductRow(row, imagesMap, specsMap));
    res.json({ success: true, products });
  } catch (error) {
    console.error('Fetch Bestsellers Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Get New Arrivals
router.get('/new-arrivals', async (req, res) => {
  try {
    let productsRes = await db.query(`SELECT p.*, s.meta_title, s.meta_description FROM products p LEFT JOIN product_seo s ON s.product_id = p.id WHERE p.deleted_at IS NULL AND (p.status IS NULL OR LOWER(p.status) = 'published') AND p.approval_status = 'approved' AND p.is_new_arrival = true ORDER BY p.id DESC LIMIT 4`);

    if (productsRes.rows.length < 4) {
      const existingIds = productsRes.rows.map(r => r.id);
      const needed = 4 - productsRes.rows.length;
      let fallbackQuery = `SELECT p.*, s.meta_title, s.meta_description FROM products p LEFT JOIN product_seo s ON s.product_id = p.id WHERE p.deleted_at IS NULL AND (p.status IS NULL OR LOWER(p.status) = 'published') AND p.approval_status = 'approved'`;
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

    const specsMap = await getSpecsMap();
    const products = productsRes.rows.map(row => formatProductRow(row, imagesMap, specsMap));
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
        AND p.approval_status = 'approved'
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

    const specsMap = await getSpecsMap();
    const products = productsRes.rows.map(row => formatProductRow(row, imagesMap, specsMap));
    res.json({ success: true, count: products.length, data: products, products });
  } catch (error) {
    console.error('Fetch Video Products Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Get Single Product by ID or Slug
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isNum = !isNaN(id);
    const parsedId = isNum ? parseInt(id) : (parseInt(id.replace(/\D/g, '')) || 0);

    let productRes = await db.query(
      `SELECT id FROM products WHERE ((id = $1 AND deleted_at IS NULL) OR (slug = $2 AND deleted_at IS NULL)) AND approval_status = 'approved'`,
      [parsedId > 0 ? parsedId : 0, id]
    );

    // Fallback: return first product if requested ID is mock format like "p1"
    if (productRes.rows.length === 0) {
      productRes = await db.query(`SELECT id FROM products WHERE deleted_at IS NULL AND approval_status = 'approved' ORDER BY id ASC LIMIT 1`);
    }

    if (productRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const prodId = productRes.rows[0].id;
    const productData = await productService.getById(prodId);

    // Fetch related products
    const relatedRes = await db.query(
      `SELECT p.*, s.meta_title, s.meta_description FROM products p LEFT JOIN product_seo s ON s.product_id = p.id WHERE p.category_id = $1 AND p.id != $2 AND p.deleted_at IS NULL AND p.approval_status = 'approved' LIMIT 4`,
      [productData.category_id || 1, prodId]
    );
    const specsMap = await getSpecsMap();
    const relatedProducts = relatedRes.rows.map(r => formatProductRow(r, {}, specsMap));

    productData.relatedProducts = relatedProducts;

    res.json({ success: true, product: productData });
  } catch (error) {
    console.error('Fetch Product Details Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product details.' });
  }
});

module.exports = router;
