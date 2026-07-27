const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Helper to format product row
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
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : null,
    discountBadge,
    image: images[0],
    images: images,
    fabric: row.fabric,
    color: row.color,
    inStock: row.in_stock,
    rating: Number(row.rating || 4.8),
    reviewCount: Number(row.review_count || 24)
  };
}

// 1. Get Recently Viewed Products for Authenticated User
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT p.*, rv.viewed_at
       FROM recently_viewed rv
       JOIN products p ON rv.product_id = p.id
       WHERE rv.user_id = $1 AND p.deleted_at IS NULL AND (p.status IS NULL OR LOWER(p.status) = 'published')
       ORDER BY rv.viewed_at DESC
       LIMIT 10`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ success: true, products: [] });
    }

    const productIds = result.rows.map(r => r.id);
    const imagesRes = await db.query(
      `SELECT product_id, image_url, image_data, is_primary 
       FROM product_images 
       WHERE product_id = ANY($1)
       ORDER BY is_primary DESC, display_order ASC`,
      [productIds]
    );

    const imagesMap = {};
    imagesRes.rows.forEach(img => {
      if (!imagesMap[img.product_id]) imagesMap[img.product_id] = [];
      imagesMap[img.product_id].push(img.image_data || img.image_url);
    });

    const products = result.rows.map(row => formatProductRow(row, imagesMap));
    res.json({ success: true, products });
  } catch (error) {
    console.error('Fetch Recently Viewed Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recently viewed products.' });
  }
});

// 2. Record a Product View
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' });
    }

    const isNum = !isNaN(productId);
    const parsedId = isNum ? parseInt(productId) : 0;
    if (parsedId <= 0) {
      return res.json({ success: true, message: 'Skipped non-numeric productId' });
    }

    await db.query(
      `INSERT INTO recently_viewed (user_id, product_id, viewed_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET viewed_at = CURRENT_TIMESTAMP`,
      [userId, parsedId]
    );

    res.json({ success: true, message: 'Product view recorded in Neon DB' });
  } catch (error) {
    console.error('Record Product View Error:', error);
    res.status(500).json({ success: false, message: 'Failed to record product view.' });
  }
});

module.exports = router;
