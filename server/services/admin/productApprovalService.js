const db = require('../../db');

/**
 * List products pending, approved, or rejected for admin triage
 */
async function getProductApprovals(filters = {}) {
  const { status } = filters;
  let query = `
    SELECT p.id, p.name, p.sku, p.price, p.stock_count, p.approval_status, p.submitted_at, p.reviewed_at, p.rejection_reason,
           s.business_name as seller_name, s.id as seller_id,
           c.name as category_name,
           (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1) as cover_image
    FROM products p
    JOIN sellers s ON p.seller_id = s.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.seller_id IS NOT NULL
  `;
  const params = [];

  if (status) {
    params.push(status);
    query += ` AND p.approval_status = $${params.length}`;
  }

  query += ` ORDER BY p.submitted_at DESC`;

  const res = await db.query(query, params);
  return res.rows.map(r => ({
    id: r.id,
    name: r.name,
    sku: r.sku,
    price: Number(r.price),
    stockCount: r.stock_count,
    approvalStatus: r.approval_status,
    submittedAt: r.submitted_at,
    reviewedAt: r.reviewed_at,
    rejectionReason: r.rejection_reason,
    sellerName: r.seller_name,
    sellerId: r.seller_id,
    categoryName: r.category_name,
    image: r.cover_image || 'https://via.placeholder.com/100x130?text=No+Image'
  }));
}

/**
 * Approve a seller product submission
 */
async function approveProduct(productId) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Update product status
    const updateRes = await client.query(
      `UPDATE products SET
        approval_status = 'approved',
        status = 'published',
        rejection_reason = NULL,
        reviewed_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND seller_id IS NOT NULL
       RETURNING name, seller_id`,
      [productId]
    );

    if (updateRes.rows.length === 0) {
      throw new Error('Product not found or not owned by a seller.');
    }

    const { name, seller_id } = updateRes.rows[0];

    // Notify seller
    await client.query(
      `INSERT INTO seller_notifications (seller_id, type, title, message)
       VALUES ($1, 'product_status', 'Product Approved! 🛍️', $2)`,
      [seller_id, `Your product "${name}" has been approved by admins and is now live on the storefront.`]
    );

    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Reject a seller product submission with a reason
 */
async function rejectProduct(productId, reason) {
  if (!reason || reason.trim() === '') {
    throw new Error('Rejection reason is required.');
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const updateRes = await client.query(
      `UPDATE products SET
        approval_status = 'rejected',
        status = 'draft',
        rejection_reason = $2,
        reviewed_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND seller_id IS NOT NULL
       RETURNING name, seller_id`,
      [productId, reason]
    );

    if (updateRes.rows.length === 0) {
      throw new Error('Product not found or not owned by a seller.');
    }

    const { name, seller_id } = updateRes.rows[0];

    // Notify seller
    await client.query(
      `INSERT INTO seller_notifications (seller_id, type, title, message)
       VALUES ($1, 'product_status', 'Product Submission Rejected', $2)`,
      [seller_id, `Your product "${name}" was rejected. Reason: ${reason}`]
    );

    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  getProductApprovals,
  approveProduct,
  rejectProduct
};
