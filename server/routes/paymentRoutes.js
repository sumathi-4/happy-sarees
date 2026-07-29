const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const db = require('../db');
const emailService = require('../services/emailService');

const router = express.Router();

// Helper to resolve Razorpay Key ID and Secret dynamically
async function getRazorpayCredentials() {
  let keyId = process.env.RAZORPAY_KEY_ID || process.env.RZP_TEST_KEY || process.env.RAZORPAY_KEY;
  let keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.RZP_TEST_SECRET || process.env.RAZORPAY_SECRET;

  if (!keyId || !keySecret) {
    try {
      const settingsRes = await db.query(
        `SELECT setting_value FROM store_settings WHERE setting_key IN ('store_integrations', 'store_payment')`
      );
      settingsRes.rows.forEach(r => {
        let val = r.setting_value;
        if (typeof val === 'string') {
          try { val = JSON.parse(val); } catch (e) {}
        }
        if (val && typeof val === 'object') {
          if (!keyId) keyId = val.razorpayKey || val.razorpay_key;
          if (!keySecret) keySecret = val.razorpaySecret || val.razorpay_secret;
        }
      });
    } catch (e) {
      console.error('[PaymentRoute] Settings fetch error:', e.message);
    }
  }

  // Final fallback defaults for test mode if missing
  if (!keyId) keyId = 'rzp_test_TIsRdBOnjlnxgt';
  if (!keySecret) keySecret = 'QTgRksjTWHdO1O9yBihxIs3A';

  return { keyId, keySecret };
}

// 1. Get Public Razorpay Key ID (Never expose Secret)
router.get('/razorpay-key', async (req, res) => {
  try {
    const { keyId } = await getRazorpayCredentials();
    res.json({ success: true, keyId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch payment configuration.' });
  }
});

// 2. Create Razorpay Order
router.post('/create-razorpay-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', orderId, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required.' });
    }

    const { keyId, keySecret } = await getRazorpayCredentials();

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const amountInPaise = Math.round(Number(amount) * 100);

    const rzpOrder = await instance.orders.create({
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      receipt: `receipt_${orderId || Date.now()}`,
      notes: notes || { source: 'Happy Sarees Web Checkout' }
    });

    res.json({
      success: true,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId
    });
  } catch (err) {
    console.error('[Razorpay Order Creation Error]:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create Razorpay payment order.'
    });
  }
});

// 3. Verify Payment Signature & Update Neon DB Order Status
router.post('/verify-signature', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      dbOrderId,
      orderNumber,
      amount
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing Razorpay signature verification parameters.' });
    }

    const { keySecret } = await getRazorpayCredentials();

    // Verify HMAC SHA256 signature
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest('hex');

    const isValid = generated_signature === razorpay_signature;

    if (!isValid) {
      console.warn('[Razorpay Verification Failed] Invalid Signature!');

      // Update DB order as Payment Failed
      if (dbOrderId || orderNumber) {
        await db.query(
          `UPDATE orders 
           SET payment_status = 'Payment Failed', 
               order_status = 'Pending', 
               updated_at = NOW() 
           WHERE id = $1 OR order_number = $2`,
          [dbOrderId || 0, orderNumber || '']
        );
      }

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid signature.'
      });
    }

    // Signature is valid! Update Neon PostgreSQL DB Order
    const updateRes = await db.query(
      `UPDATE orders 
       SET payment_status = 'Paid',
           order_status = 'Confirmed',
           payment_method = 'Pay Online',
           razorpay_order_id = $1,
           razorpay_payment_id = $2,
           razorpay_signature = $3,
           paid_amount = COALESCE($4, total_amount),
           paid_at = NOW(),
           updated_at = NOW()
       WHERE id = $5 OR order_number = $6
       RETURNING *`,
      [
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount ? Number(amount) : null,
        dbOrderId || 0,
        orderNumber || ''
      ]
    );

    const updatedOrder = updateRes.rows[0] || null;

    if (updatedOrder && updatedOrder.user_id) {
      try {
        await db.query('DELETE FROM cart_items WHERE user_id = $1', [updatedOrder.user_id]);
      } catch (cartErr) {
        console.warn('[PaymentRoutes] Failed to clear cart after payment verification:', cartErr.message);
      }
    }

    if (updatedOrder) {
      try {
        emailService.sendNotification('PAYMENT_SUCCESS', {
          ...updatedOrder,
          id: updatedOrder.id,
          orderNumber: updatedOrder.order_number,
          totalAmount: Number(updatedOrder.total_amount),
          paymentMethod: updatedOrder.payment_method || 'Pay Online',
          paymentStatus: updatedOrder.payment_status || 'Paid',
          orderStatus: updatedOrder.order_status || 'Confirmed'
        }).catch(err => console.error('[Payment Success Email Async Error]:', err.message));
      } catch (e) {}
    }

    res.json({
      success: true,
      message: 'Payment verified and order confirmed! 🎉',
      order: updatedOrder
    });
  } catch (err) {
    console.error('[Razorpay Signature Verification Error]:', err);
    res.status(500).json({ success: false, message: 'Payment verification server error.' });
  }
});

// 4. Record Failed / Dismissed Payment
router.post('/record-failed-payment', async (req, res) => {
  try {
    const { dbOrderId, orderNumber, reason } = req.body;

    if (dbOrderId || orderNumber) {
      await db.query(
        `UPDATE orders 
         SET payment_status = 'Payment Failed', 
             order_status = 'Pending Payment', 
             updated_at = NOW() 
         WHERE id = $1 OR order_number = $2`,
        [dbOrderId || 0, orderNumber || '']
      );
    }

    res.json({ success: true, message: 'Payment status updated to failed/pending.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error recording failed payment.' });
  }
});

module.exports = router;
