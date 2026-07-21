const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// 1. Get User Wishlist
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.* 
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, wishlist: result.rows });
  } catch (error) {
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
      `INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.user.id, productId]
    );

    res.json({ success: true, message: 'Added product to wishlist.' });
  } catch (error) {
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
    res.status(500).json({ success: false, message: 'Failed to remove from wishlist.' });
  }
});

module.exports = router;
