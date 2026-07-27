const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// 1. Get User Cart Items
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.id as cart_id, c.quantity, p.* 
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, cart: result.rows, items: result.rows, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch cart items.' });
  }
});

// 2. Add Item to Cart
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const qty = quantity && quantity > 0 ? quantity : 1;

    await db.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id) 
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
      [req.user.id, productId, qty]
    );

    res.json({ success: true, message: 'Item added to cart!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add item to cart.' });
  }
});

// 3. Remove Item from Cart
router.delete('/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    await db.query(`DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2`, [req.user.id, productId]);
    res.json({ success: true, message: 'Item removed from cart.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove item from cart.' });
  }
});

module.exports = router;
