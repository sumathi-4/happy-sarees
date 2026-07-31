const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/auth');
const emailService = require('../services/emailService');

const jwt = require('jsonwebtoken');

const router = express.Router();

// Optional Auth Middleware (Allows guest orders while attaching user profile if logged in)
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET || 'happysarees_secret_key_2026');
      req.user = verified;
    } catch (e) {}
  }
  next();
}

// 1. Create New Order
router.post('/', optionalAuth, async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { items, totalAmount, shippingAddress, paymentMethod, couponCode } = req.body;

    if (!items || !items.length || !totalAmount) {
      return res.status(400).json({ success: false, message: 'Cart items and total amount are required.' });
    }

    await client.query('BEGIN');

    const isOnline = paymentMethod && (paymentMethod.includes('Online') || paymentMethod.includes('Razorpay') || paymentMethod === 'pay_online');
    const initialPaymentStatus = isOnline ? 'Pending Payment' : 'Pending';
    const initialOrderStatus = isOnline ? 'Pending Payment' : 'Confirmed';

    const orderNumber = `HS-ORD-${Date.now()}`;
    const orderRes = await client.query(
      `INSERT INTO orders (user_id, order_number, total_amount, payment_method, payment_status, order_status, shipping_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        req.user?.id || null,
        orderNumber,
        totalAmount,
        paymentMethod || (isOnline ? 'Pay Online' : 'COD'),
        initialPaymentStatus,
        initialOrderStatus,
        JSON.stringify(shippingAddress || {})
      ]
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

    // Auto timeline log initial creation
    await client.query(
      `INSERT INTO order_timeline (order_id, status, note) VALUES ($1, $2, $3)`,
      [order.id, initialOrderStatus, 'Order created by customer']
    );

    // Auto increment coupon usage in Neon DB
    if (couponCode) {
      const couponRes = await client.query(
        `UPDATE coupons 
         SET usage_count = usage_count + 1 
         WHERE UPPER(code) = UPPER($1) 
         RETURNING id`,
        [couponCode]
      );
      if (couponRes.rows.length > 0 && req.user?.id) {
        const couponId = couponRes.rows[0].id;
        await client.query(
          `INSERT INTO coupon_usage (coupon_id, user_id, order_id)
           VALUES ($1, $2, $3)`,
          [couponId, req.user.id, order.id]
        );
      }
    }

    // Clear purchaser's cart items ONLY for Cash on Delivery orders.
    // Pay Online orders clear cart in /verify-signature ONLY after payment succeeds!
    if (!isOnline && req.user?.id) {
      await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
    }

    await client.query('COMMIT');

    // Trigger Centralized Email Notification Asynchronously for COD
    if (!isOnline) {
      try {
        if (req.user?.id) {
          await client.query(
            `INSERT INTO notifications (user_id, title, message, type)
             VALUES ($1, $2, $3, 'order')`,
            [req.user.id, `Order #${order.order_number} Placed!`, `Your order #${order.order_number} has been received and is being processed. Total: ₹${order.total_amount}`]
          );
        }
        
        emailService.sendNotification('ORDER_PLACED', {
          id: order.id,
          orderNumber: order.order_number,
          totalAmount: Number(order.total_amount),
          paymentMethod: order.payment_method,
          paymentStatus: order.payment_status,
          orderStatus: order.order_status,
          shippingAddress,
          items,
          created_at: order.created_at,
          customerEmail: req.user?.email
        }).catch(err => console.error('[Order Email Async Error]:', err.message));
      } catch (e) {}
    }

    res.status(201).json({
      success: true,
      message: isOnline ? 'Order session initiated.' : 'Order placed successfully! 🎉',
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
    const [result, timelineRes] = await Promise.all([
      db.query(
        `SELECT o.*, 
                json_agg(
                  json_build_object(
                    'id', oi.id,
                    'productId', oi.product_id,
                    'quantity', oi.quantity,
                    'price', oi.price_at_purchase,
                    'productName', COALESCE(p.name, 'Silk Saree'),
                    'fabric', COALESCE(p.fabric, 'Silk'),
                    'image', COALESCE((SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1), 'https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg')
                  )
                ) as items
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE o.user_id = $1 AND (LOWER(o.payment_method) NOT LIKE '%online%' OR LOWER(o.payment_status) = 'paid')
         GROUP BY o.id
         ORDER BY o.created_at DESC`,
        [req.user.id]
      ),
      db.query(
        `SELECT ot.* FROM order_timeline ot 
         JOIN orders o ON ot.order_id = o.id 
         WHERE o.user_id = $1 
         ORDER BY ot.created_at ASC`,
        [req.user.id]
      )
    ]);

    const timelineMap = {};
    (timelineRes.rows || []).forEach(t => {
      if (!timelineMap[t.order_id]) timelineMap[t.order_id] = [];
      timelineMap[t.order_id].push({
        status: t.status,
        note: t.note,
        date: t.created_at
      });
    });

    const orders = result.rows.map(o => {
      let addr = o.shipping_address;
      if (typeof addr === 'string') {
        try { addr = JSON.parse(addr); } catch(e) {}
      }

      const rawItems = Array.isArray(o.items) ? o.items.filter(i => i && i.id) : [];
      const orderTimeline = timelineMap[o.id] && timelineMap[o.id].length > 0
        ? timelineMap[o.id]
        : [{ status: o.order_status || 'Confirmed', note: 'Order placed', date: o.created_at }];

      return {
        id: o.id,
        orderId: o.id,
        orderNumber: o.order_number || `HS-ORD-${o.id}`,
        order_number: o.order_number || `HS-ORD-${o.id}`,
        totalAmount: Number(o.total_amount || 0),
        total_amount: Number(o.total_amount || 0),
        paymentMethod: o.payment_method || 'Pay Online',
        payment_method: o.payment_method || 'Pay Online',
        paymentStatus: o.payment_status || 'Pending',
        payment_status: o.payment_status || 'Pending',
        returnStatus: o.return_status || 'No Request',
        return_status: o.return_status || 'No Request',
        returnReason: o.return_reason || '',
        return_reason: o.return_reason || '',
        returnRequestedAt: o.return_requested_at || null,
        return_requested_at: o.return_requested_at || null,
        orderStatus: o.order_status || 'Confirmed',
        order_status: o.order_status || 'Confirmed',
        deliveryStatus: o.delivery_status || o.order_status || 'Processing',
        delivery_status: o.delivery_status || o.order_status || 'Processing',
        shippingAddress: addr,
        shipping_address: addr,
        razorpayOrderId: o.razorpay_order_id,
        razorpay_order_id: o.razorpay_order_id,
        razorpayPaymentId: o.razorpay_payment_id,
        razorpay_payment_id: o.razorpay_payment_id,
        razorpaySignature: o.razorpay_signature,
        razorpay_signature: o.razorpay_signature,
        paidAmount: o.paid_amount ? Number(o.paid_amount) : null,
        paid_amount: o.paid_amount ? Number(o.paid_amount) : null,
        paidAt: o.paid_at,
        paid_at: o.paid_at,
        trackingNumber: o.tracking_number || '',
        tracking_number: o.tracking_number || '',
        courierName: o.courier_name || 'Express Delivery',
        courier_name: o.courier_name || 'Express Delivery',
        createdAt: o.created_at,
        created_at: o.created_at,
        items: rawItems,
        timeline: orderTimeline
      };
    });

    res.json({ success: true, orders, data: orders });
  } catch (error) {
    console.error('Fetch Orders Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders history.' });
  }
});

// 3. Customer Cancel Order (Only allowed when status is Pending or Confirmed)
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const orderRes = await db.query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [orderId, req.user.id]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orderRes.rows[0];
    const currentStatus = order.order_status || 'Confirmed';
    if (!['Pending', 'Confirmed'].includes(currentStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: `Order cannot be cancelled at stage "${currentStatus}". Cancellation is only allowed when status is Pending or Confirmed.` 
      });
    }

    await db.query(
      `UPDATE orders SET order_status = 'Cancelled', cancelled_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [orderId]
    );

    // Auto timeline log
    await db.query(
      `INSERT INTO order_timeline (order_id, status, note) VALUES ($1, $2, $3)`,
      [orderId, 'Cancelled', 'Cancelled by customer']
    );

    res.json({ success: true, message: 'Order cancelled successfully.' });
  } catch (error) {
    console.error('Customer Cancel Order Error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel order.' });
  }
});

// 4. Customer Request Return (Only allowed when status is Delivered)
router.post('/:id/return', authenticateToken, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { reason } = req.body;
    const orderRes = await db.query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [orderId, req.user.id]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orderRes.rows[0];
    if (order.order_status !== 'Delivered') {
      return res.status(400).json({ 
        success: false, 
        message: `Return can only be requested after the order has been Delivered.` 
      });
    }

    await db.query(
      `UPDATE orders 
       SET order_status = 'Returned',
           return_status = 'Return Requested', 
           return_reason = $1, 
           return_requested_at = NOW(), 
           updated_at = NOW() 
       WHERE id = $2`,
      [reason || 'Customer requested return', orderId]
    );

    // Auto timeline log
    await db.query(
      `INSERT INTO order_timeline (order_id, status, note) VALUES ($1, $2, $3)`,
      [orderId, 'Return Requested', reason ? `Return requested: ${reason}` : 'Customer requested order return']
    );

    // Trigger Centralized Return Requested Email Asynchronously
    try {
      emailService.sendNotification('RETURN_REQUESTED', {
        ...order,
        id: orderId,
        order_status: 'Returned',
        return_status: 'Return Requested',
        return_reason: reason,
        customerEmail: req.user?.email
      }).catch(err => console.error('[Return Request Email Async Error]:', err.message));
    } catch (e) {}

    res.json({ success: true, message: 'Return request submitted successfully.' });
  } catch (error) {
    console.error('Customer Return Order Error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit return request.' });
  }
});

module.exports = router;
