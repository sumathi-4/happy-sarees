const express = require('express');
const db = require('../../db');
const { recalculateProductRating } = require('../reviewRoutes');

const router = express.Router();

// GET /api/admin/reviews — Fetch all reviews for Admin Review Management page
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT r.id, r.product_id, r.user_id, r.rating, r.comment, r.reviewer_name,
             r.status, r.display_on_homepage, r.images, r.featured_image, r.created_at, r.updated_at,
             p.name as product_name,
             (SELECT COALESCE(pi.image_url, pi.image_data)
              FROM product_images pi
              WHERE pi.product_id = p.id
              ORDER BY pi.is_primary DESC, pi.display_order ASC
              LIMIT 1) as product_image,
             u.email as user_email
      FROM reviews r
      LEFT JOIN products p ON r.product_id = p.id
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);

    const reviews = result.rows.map(row => {
      let imageList = [];
      if (Array.isArray(row.images)) imageList = row.images;
      else if (typeof row.images === 'string') {
        try { imageList = JSON.parse(row.images); } catch (e) {}
      }

      // Default featured image to 1st image in array if not explicitly set
      const featuredImage = row.featured_image || (imageList.length > 0 ? imageList[0] : null);

      return {
        id: row.id,
        productId: row.product_id,
        productName: row.product_name || `Product #${row.product_id}`,
        productImage: row.product_image || '/src/assets/hero_saree_model.png',
        customerName: row.reviewer_name || 'Customer',
        customerEmail: row.user_email || 'customer@happysarees.com',
        rating: Number(row.rating) || 5,
        comment: row.comment,
        status: row.status || 'pending',
        displayOnHomepage: Boolean(row.display_on_homepage),
        images: imageList,
        featuredImage,
        createdAt: row.created_at
      };
    });

    res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (err) {
    console.error('Admin Fetch Reviews Error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch customer reviews for Admin.' });
  }
});

// PUT /api/admin/reviews/:id — Admin manage review status, homepage display & featured image
// Note: Admin cannot edit customer's rating or comment text.
router.put('/:id', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const { status, displayOnHomepage, featuredImage } = req.body;

    const existingRes = await db.query('SELECT * FROM reviews WHERE id = $1', [reviewId]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const review = existingRes.rows[0];
    const newStatus = status || review.status || 'pending';
    const newDisplayHome = displayOnHomepage !== undefined ? Boolean(displayOnHomepage) : Boolean(review.display_on_homepage);
    const newFeaturedImage = featuredImage !== undefined ? featuredImage : review.featured_image;

    const updateRes = await db.query(
      `UPDATE reviews 
       SET status = $1, 
           display_on_homepage = $2, 
           featured_image = $3, 
           updated_at = NOW() 
       WHERE id = $4 RETURNING *`,
      [newStatus, newDisplayHome, newFeaturedImage, reviewId]
    );

    const updatedReview = updateRes.rows[0];

    // Recalculate product rating dynamically
    await recalculateProductRating(updatedReview.product_id);

    res.json({
      success: true,
      message: `Review #${reviewId} status updated to '${newStatus}'.`,
      review: updatedReview
    });
  } catch (err) {
    console.error('Admin Update Review Error:', err);
    res.status(500).json({ success: false, message: 'Failed to update review.' });
  }
});

// DELETE /api/admin/reviews/:id — Admin delete review
router.delete('/:id', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);

    const deleteRes = await db.query('DELETE FROM reviews WHERE id = $1 RETURNING product_id', [reviewId]);
    if (deleteRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const productId = deleteRes.rows[0].product_id;
    await recalculateProductRating(productId);

    res.json({
      success: true,
      message: `Review #${reviewId} deleted successfully.`
    });
  } catch (err) {
    console.error('Admin Delete Review Error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
});

module.exports = router;
