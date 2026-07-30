const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Helper to safely parse numeric Product ID
function parseProductId(param) {
  if (!isNaN(param)) return parseInt(param);
  const extracted = parseInt(param.replace(/\D/g, ''));
  return extracted || 1;
}

// Helper to recalculate product rating dynamically from approved reviews
async function recalculateProductRating(productId) {
  if (!productId) return;
  try {
    const statsRes = await db.query(
      `SELECT ROUND(AVG(rating), 1) as avg_rating, COUNT(*) as total_count 
       FROM reviews 
       WHERE product_id = $1 AND status = 'approved'`,
      [productId]
    );
    const avgRating = Number(statsRes.rows[0]?.avg_rating || 0);
    const reviewCount = parseInt(statsRes.rows[0]?.total_count || 0);

    await db.query(
      `UPDATE products SET rating = $1, review_count = $2 WHERE id = $3`,
      [avgRating, reviewCount, productId]
    );
  } catch (err) {
    console.error(`Recalculate Rating Error for Product #${productId}:`, err.message);
  }
}

// ── 0. Get Approved Featured Reviews for Home Page Carousel ───────────────
router.get('/approved', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.id, r.product_id, r.user_id, r.rating, r.title, r.comment, 
              r.reviewer_name, r.image_data, r.images, r.featured_image, r.created_at,
              p.name as product_name
       FROM reviews r
       LEFT JOIN products p ON r.product_id = p.id
       WHERE r.status = 'approved' AND r.display_on_homepage = true
       ORDER BY r.created_at DESC`
    );

    const reviews = result.rows.map(row => {
      let imageList = [];
      if (Array.isArray(row.images)) imageList = row.images;
      else if (typeof row.images === 'string') {
        try { imageList = JSON.parse(row.images); } catch (e) {}
      }

      // Display ONLY the Featured Image on Home Page (fallback to 1st image or image_data)
      const featuredImage = row.featured_image || imageList[0] || row.image_data || null;

      return {
        id: row.id,
        name: row.reviewer_name || 'Verified Customer',
        reviewer: row.reviewer_name || 'Verified Customer',
        rating: Number(row.rating) || 5,
        title: row.title || '',
        comment: row.comment,
        quote: row.comment,
        image: featuredImage,
        avatar: featuredImage,
        images: imageList,
        featuredImage,
        productName: row.product_name || null,
        createdAt: row.created_at
      };
    });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    console.warn('Fetch Approved Reviews Notice:', error.message);
    res.json({ success: true, count: 0, reviews: [] });
  }
});

// ── 1. Check Review Eligibility & Existing Review ────────────────────────
router.get('/check-eligibility/:productId', authenticateToken, async (req, res) => {
  try {
    const targetId = parseProductId(req.params.productId);
    const userId = req.user.id;

    // Check if customer has a Delivered order for this product
    const orderCheck = await db.query(
      `SELECT o.id 
       FROM orders o 
       JOIN order_items oi ON o.id = oi.order_id 
       WHERE o.user_id = $1 AND (oi.product_id = $2 OR (CASE WHEN oi.product_id::text ~ '^[0-9]+$' THEN oi.product_id::integer ELSE 0 END = $2)) AND LOWER(o.order_status) = 'delivered' 
       LIMIT 1`,
      [userId, targetId]
    );

    const canReview = orderCheck.rows.length > 0;

    // Check for existing review by this user for this product
    const reviewCheck = await db.query(
      `SELECT * FROM reviews WHERE user_id = $1 AND product_id = $2 LIMIT 1`,
      [userId, targetId]
    );

    const existingReview = reviewCheck.rows[0] || null;

    res.json({
      success: true,
      canReview,
      existingReview
    });
  } catch (error) {
    console.error('Check Review Eligibility Error:', error);
    res.status(500).json({ success: false, message: 'Failed to check review eligibility.' });
  }
});

// ── Get Delivered Products Pending Review for Logged-In Customer ────────
router.get('/pending-products', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT DISTINCT p.id as product_id, p.name as product_name, p.price, o.order_number,
              (SELECT COALESCE(pi.image_url, pi.image_data)
               FROM product_images pi
               WHERE pi.product_id = p.id
               ORDER BY pi.is_primary DESC, pi.display_order ASC
               LIMIT 1) as product_image
       FROM orders o 
       JOIN order_items oi ON o.id = oi.order_id 
       JOIN products p ON (oi.product_id = p.id OR (CASE WHEN oi.product_id::text ~ '^[0-9]+$' THEN oi.product_id::integer ELSE 0 END = p.id))
       WHERE o.user_id = $1 AND LOWER(o.order_status) = 'delivered'
         AND p.id NOT IN (SELECT product_id FROM reviews WHERE user_id = $1 AND product_id IS NOT NULL)
       ORDER BY p.id DESC`,
      [userId]
    );

    const pendingProducts = result.rows.map(row => ({
      productId: row.product_id,
      productName: row.product_name || `Saree #${row.product_id}`,
      image: row.product_image || null,
      price: Number(row.price || 0),
      orderNumber: row.order_number
    }));

    res.json({ success: true, count: pendingProducts.length, pendingProducts });
  } catch (error) {
    console.error('Fetch Pending Review Products Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products pending review.' });
  }
});

// ── 2. Get Approved Reviews & Stats for Product Details Page ──────────────
router.get('/product/:productId', async (req, res) => {
  try {
    const targetId = parseProductId(req.params.productId);

    // Fetch approved reviews for this product
    const result = await db.query(
      `SELECT * FROM reviews WHERE product_id = $1 AND status = 'approved' ORDER BY created_at DESC`,
      [targetId]
    );

    const reviews = result.rows.map(r => {
      let imageList = [];
      if (Array.isArray(r.images)) imageList = r.images;
      else if (typeof r.images === 'string') {
        try { imageList = JSON.parse(r.images); } catch (e) {}
      }

      return {
        id: r.id,
        name: r.reviewer_name || 'Verified Buyer',
        rating: Number(r.rating) || 5,
        title: r.title || '',
        comment: r.comment,
        date: new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        images: imageList,
        photos: imageList.length > 0 ? imageList : (r.image_data ? [r.image_data] : []),
        verified: true
      };
    });

    // Calculate dynamic rating stats
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
      ? Number((reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1))
      : 0;

    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      starCounts[star] = (starCounts[star] || 0) + 1;
    });

    const starBreakdown = [5, 4, 3, 2, 1].map(star => ({
      stars: star,
      count: starCounts[star],
      percent: totalReviews > 0 ? Math.round((starCounts[star] / totalReviews) * 100) : 0
    }));

    res.json({
      success: true,
      count: totalReviews,
      averageRating: avgRating,
      starBreakdown,
      reviews
    });
  } catch (error) {
    console.error('Fetch Product Reviews Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product reviews.' });
  }
});

// ── 3. Submit / Update Product Review (Customer) ─────────────────────────
router.post('/product/:productId', authenticateToken, async (req, res) => {
  try {
    const targetId = parseProductId(req.params.productId);
    const userId = req.user.id;
    const { rating, comment, reviewerName, images } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and comment text are required.' });
    }

    // Verify delivery eligibility
    const orderCheck = await db.query(
      `SELECT o.id 
       FROM orders o 
       JOIN order_items oi ON o.id = oi.order_id 
       WHERE o.user_id = $1 AND (oi.product_id = $2 OR (CASE WHEN oi.product_id::text ~ '^[0-9]+$' THEN oi.product_id::integer ELSE 0 END = $2)) AND LOWER(o.order_status) = 'delivered' 
       LIMIT 1`,
      [userId, targetId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Only customers who have purchased and received this product (Delivered) can submit a review.'
      });
    }

    // Sanitize image array (max 3 images)
    let finalImages = [];
    if (Array.isArray(images)) {
      finalImages = images.slice(0, 3);
    }
    const featuredImg = finalImages.length > 0 ? finalImages[0] : null;

    // Check if user already reviewed this product
    const existingCheck = await db.query(
      `SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2 LIMIT 1`,
      [userId, targetId]
    );

    let reviewRecord;
    if (existingCheck.rows.length > 0) {
      // Update existing review and automatically reset status to 'pending'
      const reviewId = existingCheck.rows[0].id;
      const updateRes = await db.query(
        `UPDATE reviews 
         SET rating = $1, 
             comment = $2, 
             reviewer_name = $3, 
             images = $4::jsonb, 
             featured_image = $5,
             status = 'pending', 
             updated_at = NOW() 
         WHERE id = $6 RETURNING *`,
        [
          rating,
          comment,
          reviewerName || req.user.full_name || req.user.name || req.user.email.split('@')[0],
          JSON.stringify(finalImages),
          featuredImg,
          reviewId
        ]
      );
      reviewRecord = updateRes.rows[0];
    } else {
      // Insert new review with status = 'pending'
      const insertRes = await db.query(
        `INSERT INTO reviews (product_id, user_id, rating, comment, reviewer_name, images, featured_image, status, display_on_homepage)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, 'pending', false) RETURNING *`,
        [
          targetId,
          userId,
          rating,
          comment,
          reviewerName || req.user.full_name || req.user.name || req.user.email.split('@')[0],
          JSON.stringify(finalImages),
          featuredImg
        ]
      );
      reviewRecord = insertRes.rows[0];
    }

    // Recalculate product rating dynamically
    await recalculateProductRating(targetId);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! It will be published after Admin approval.',
      review: reviewRecord
    });
  } catch (error) {
    console.error('Submit Review Error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

// ── 4. Get My Reviews (Customer Profile) ──────────────────────────────────
router.get('/my-reviews', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT r.*,
              p.name as product_name,
              (SELECT COALESCE(pi.image_url, pi.image_data)
               FROM product_images pi
               WHERE pi.product_id = p.id
               ORDER BY pi.is_primary DESC, pi.display_order ASC
               LIMIT 1) as product_image
       FROM reviews r
       LEFT JOIN products p ON r.product_id = p.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );

    const reviews = result.rows.map(r => {
      let imageList = [];
      if (Array.isArray(r.images)) imageList = r.images;
      else if (typeof r.images === 'string') {
        try { imageList = JSON.parse(r.images); } catch (e) {}
      }

      return {
        id: r.id,
        productId: r.product_id,
        productName: r.product_name || 'Saree Product',
        image: r.product_image || null,
        rating: r.rating,
        comment: r.comment,
        status: r.status || 'pending',
        date: new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        images: imageList
      };
    });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    console.error('Fetch My Reviews Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch your reviews.' });
  }
});

// ── 5. Customer Edit Own Review ───────────────────────────────────────────
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const userId = req.user.id;
    const { rating, comment, images } = req.body;

    const existingRes = await db.query('SELECT * FROM reviews WHERE id = $1 AND user_id = $2', [reviewId, userId]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found or unauthorized.' });
    }

    let finalImages = [];
    if (Array.isArray(images)) {
      finalImages = images.slice(0, 3);
    }
    const featuredImg = finalImages.length > 0 ? finalImages[0] : null;

    // Updating an approved/rejected review resets status back to 'pending'
    const updateRes = await db.query(
      `UPDATE reviews 
       SET rating = $1, 
           comment = $2, 
           images = $3::jsonb, 
           featured_image = COALESCE($4, featured_image),
           status = 'pending', 
           updated_at = NOW() 
       WHERE id = $5 RETURNING *`,
      [rating, comment, JSON.stringify(finalImages), featuredImg, reviewId]
    );

    const updatedReview = updateRes.rows[0];
    await recalculateProductRating(updatedReview.product_id);

    res.json({
      success: true,
      message: 'Review updated successfully! It has been submitted for Admin re-approval.',
      review: updatedReview
    });
  } catch (error) {
    console.error('Update Review Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update review.' });
  }
});

// ── 6. Customer Delete Own Review ─────────────────────────────────────────
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const userId = req.user.id;

    const deleteRes = await db.query('DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING product_id', [reviewId, userId]);
    if (deleteRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found or unauthorized.' });
    }

    const productId = deleteRes.rows[0].product_id;
    await recalculateProductRating(productId);

    res.json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    console.error('Delete Review Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
});

module.exports = router;
module.exports.recalculateProductRating = recalculateProductRating;
