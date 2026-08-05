const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/auth');
const productService = require('../services/admin/productService');

const router = express.Router();

// 1. Get User Wishlist (Live Joined Products from Neon DB)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT w.id as wishlist_id, w.created_at as added_at, p.* 
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = $1 AND p.deleted_at IS NULL AND (p.status IS NULL OR LOWER(p.status) = 'published' OR LOWER(p.status) = 'active')
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );

    // Fetch primary images for wishlisted products
    const imagesRes = await db.query(
      `SELECT product_id, image_url, is_primary FROM product_images ORDER BY is_primary DESC, display_order ASC`
    );
    const imagesMap = {};
    imagesRes.rows.forEach(img => {
      if (!imagesMap[img.product_id]) imagesMap[img.product_id] = [];
      imagesMap[img.product_id].push(img.image_url);
    });

    const items = result.rows.map(row => {
      const imgList = imagesMap[row.id] || (row.image_url ? [row.image_url] : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop']);
      const discountBadge = row.original_price && row.original_price > row.price
        ? `${Math.round(((row.original_price - row.price) / row.original_price) * 100)}% OFF`
        : null;

      return {
        id: row.id,
        productId: row.id,
        wishlistId: row.wishlist_id,
        name: row.name,
        slug: row.slug,
        shortDescription: row.short_description || '',
        fullDescription: row.description || '',
        description: row.description || '',
        washCare: row.wash_care || 'Dry Clean Only',
        price: Number(row.price),
        originalPrice: row.original_price ? Number(row.original_price) : null,
        discountBadge,
        image: imgList[0],
        images: imgList,
        fabric: row.fabric,
        color: row.color,
        weave: row.weave,
        border: row.border,
        occasion: row.occasion,
        blouseIncluded: row.blouse_included,
        blouseSize: row.blouse_size,
        height: row.height,
        width: row.width,
        weight: row.weight,
        sku: row.sku,
        inStock: row.in_stock,
        stockCount: row.stock_count,
        isBestSeller: row.is_best_seller,
        isNewArrival: row.is_new_arrival,
        isTrending: row.is_trending,
        addedAt: row.added_at
      };
    });

    res.json({ success: true, wishlist: items, items, data: items });
  } catch (error) {
    console.error('Fetch Wishlist Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch wishlist.' });
  }
});

// 2. Add Item to Wishlist
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    await db.query(
      `INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) ON CONFLICT (user_id, product_id) DO NOTHING`,
      [req.user.id, productId]
    );

    res.json({ success: true, message: 'Added product to wishlist.' });
  } catch (error) {
    console.error('Add Wishlist Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update wishlist.' });
  }
});

// 3. Remove Item from Wishlist
router.delete('/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    await db.query(
      `DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2`,
      [req.user.id, productId]
    );

    res.json({ success: true, message: 'Removed product from wishlist.' });
  } catch (error) {
    console.error('Remove Wishlist Error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove from wishlist.' });
  }
});

// 4. Check if Product is in User Wishlist
router.get('/check/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const checkRes = await db.query(
      `SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2`,
      [req.user.id, productId]
    );
    res.json({ success: true, inWishlist: checkRes.rows.length > 0 });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to check wishlist status.' });
  }
});

module.exports = router;
