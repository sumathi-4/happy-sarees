const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// 1. Get User Cart Items
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.id as cart_id, c.quantity, p.*,
              (SELECT COALESCE(pi.image_url, pi.image_data)
               FROM product_images pi
               WHERE pi.product_id = p.id
               ORDER BY pi.is_primary DESC, pi.display_order ASC
               LIMIT 1) as product_image
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    const defaultImg = 'https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg';
    const cartItems = result.rows.map(row => {
      const img = row.product_image || row.image_url || row.image || defaultImg;
      return {
        ...row,
        id: row.id,
        productId: row.id,
        cartId: row.cart_id,
        image: img,
        image_url: img,
        originalPrice: row.original_price ? Number(row.original_price) : null,
        price: Number(row.price || 0)
      };
    });

    res.json({ success: true, cart: cartItems, items: cartItems, data: cartItems });
  } catch (error) {
    console.error('Fetch Cart Error:', error);
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

// 3. Clear Entire Cart
router.delete('/', authenticateToken, async (req, res) => {
  try {
    await db.query(`DELETE FROM cart_items WHERE user_id = $1`, [req.user.id]);
    res.json({ success: true, message: 'Cart cleared successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clear cart.' });
  }
});

// 4. Remove Specific Item from Cart
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
