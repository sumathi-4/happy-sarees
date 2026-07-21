const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Helper to safely parse numeric Product ID from "p1" or "1"
function parseProductId(param) {
  if (!isNaN(param)) return parseInt(param);
  const extracted = parseInt(param.replace(/\D/g, ''));
  return extracted || 1;
}

// 1. Get Reviews for a Product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const targetId = parseProductId(productId);

    const result = await db.query(
      `SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC`,
      [targetId]
    );

    res.json({ success: true, count: result.rows.length, reviews: result.rows });
  } catch (error) {
    console.error('Fetch Reviews Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
});

// 2. Submit New Product Review
router.post('/product/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment, reviewerName } = req.body;
    const targetId = parseProductId(productId);

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required.' });
    }

    const reviewRes = await db.query(
      `INSERT INTO reviews (product_id, user_id, rating, title, comment, reviewer_name)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [targetId, req.user.id, rating, title || '', comment, reviewerName || req.user.email.split('@')[0]]
    );

    // Update product average rating and count
    await db.query(
      `UPDATE products 
       SET rating = (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE product_id = $1),
           review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = $1)
       WHERE id = $1`,
      [targetId]
    );

    res.status(201).json({ success: true, message: 'Review submitted successfully!', review: reviewRes.rows[0] });
  } catch (error) {
    console.error('Submit Review Error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

module.exports = router;
