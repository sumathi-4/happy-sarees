const db = require('../../db');

/**
 * List all sellers with optional status filters
 */
async function listSellers(filters = {}) {
  const { status, search } = filters;
  let query = `
    SELECT s.id, s.business_name, s.store_name, s.owner_name, s.email, s.phone, s.status, s.created_at,
           (SELECT COUNT(*) FROM products WHERE seller_id = s.id) as total_products,
           (SELECT COUNT(DISTINCT order_id) FROM order_items WHERE seller_id = s.id) as total_orders
    FROM sellers s
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    params.push(status);
    query += ` AND s.status = $${params.length}`;
  }

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (s.business_name ILIKE $${params.length} OR s.owner_name ILIKE $${params.length} OR s.email ILIKE $${params.length})`;
  }

  query += ` ORDER BY s.created_at DESC`;

  const res = await db.query(query, params);
  return res.rows;
}

/**
 * Get detailed seller profile (for admin view / drawer)
 */
async function getSellerDetailsForAdmin(sellerId) {
  const sellerRes = await db.query(
    `SELECT s.*, 
            a.name as approved_by_name
     FROM sellers s
     LEFT JOIN admin_users a ON s.approved_by = a.id
     WHERE s.id = $1`,
    [sellerId]
  );

  if (sellerRes.rows.length === 0) {
    throw new Error('Seller not found.');
  }

  const docsRes = await db.query(
    `SELECT doc_type, file_url, uploaded_at FROM seller_documents WHERE seller_id = $1`,
    [sellerId]
  );

  return {
    ...sellerRes.rows[0],
    documents: docsRes.rows
  };
}

/**
 * Approve a seller request
 */
async function approveSeller(sellerId, adminUserId) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE sellers SET
        status = 'approved',
        approved_by = $2,
        approved_at = CURRENT_TIMESTAMP,
        rejection_reason = NULL,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [sellerId, adminUserId]
    );

    // Notify seller
    await client.query(
      `INSERT INTO seller_notifications (seller_id, type, title, message)
       VALUES ($1, 'registration_status', 'Application Approved! 🎉', 'Welcome to Happy Sarees. Your seller account is approved. You can now login and configure your store products.')`,
      [sellerId]
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
 * Reject a seller request
 */
async function rejectSeller(sellerId, reason, adminNotes) {
  if (!reason || !adminNotes) {
    throw new Error('Rejection reason and admin notes are both required.');
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE sellers SET
        status = 'rejected',
        rejection_reason = $2,
        admin_notes = $3,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [sellerId, reason, adminNotes]
    );

    // Notify seller
    await client.query(
      `INSERT INTO seller_notifications (seller_id, type, title, message)
       VALUES ($1, 'registration_status', 'Application Rejected', $2)`,
      [sellerId, `Your seller registration request was rejected by admins. Reason: ${reason}`]
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
 * Suspend an approved seller
 */
async function suspendSeller(sellerId) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE sellers SET
        status = 'suspended',
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [sellerId]
    );

    // Notify seller
    await client.query(
      `INSERT INTO seller_notifications (seller_id, type, title, message)
       VALUES ($1, 'system', 'Account Suspended', 'Your seller account has been suspended by administration. Access to your dashboard is restricted.')`,
      [sellerId]
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
  listSellers,
  getSellerDetailsForAdmin,
  approveSeller,
  rejectSeller,
  suspendSeller
};
