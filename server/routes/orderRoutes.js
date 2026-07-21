const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// 1. Create New Order
router.post('/', authenticateToken, async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { items, totalAmount, shippingAddress, paymentMethod } = req.body;

    if (!items || !items.length || !totalAmount) {
      return res.status(400).json({ success: false, message: 'Cart items and total amount are required.' });
    }

    await client.query('BEGIN');

    const orderNumber = `HS-ORD-${Date.now()}`;
    const orderRes = await client.query(
      `INSERT INTO orders (user_id, order_number, total_amount, payment_method, shipping_address)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, orderNumber, totalAmount, paymentMethod || 'COD', JSON.stringify(shippingAddress || {})]
    );

    const order = orderRes.rows[0];

    // Insert order items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.productId || item.id, item.quantity, item.price]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! 🎉',
      order: {
        id: order.id,
        orderNumber: order.order_number,
        totalAmount: Number(order.total_amount),
        orderStatus: order.order_status,
        createdAt: order.created_at
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create Order Error:', error);
    res.status(500).json({ success: false, message: 'Failed to place order.' });
  } finally {
    client.release();
  }
});

// 2. Get User Orders History
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT o.*, 
              json_agg(
                json_build_object(
                  'id', oi.id,
                  'productId', oi.product_id,
                  'quantity', oi.quantity,
                  'price', oi.price_at_purchase,
                  'productName', p.name,
                  'image', p.image_url
                )
              ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, orders: result.rows });
  } catch (error) {
    console.error('Fetch Orders Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders history.' });
  }
});

module.exports = router;
