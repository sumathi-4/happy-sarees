const db = require('../../db');

/**
 * Seller submits a request to add a new master data item
 */
async function submitRequest(sellerId, data) {
  const { typeSlug, typeName, itemName, reason } = data;

  if (!typeSlug || !typeName || !itemName) {
    throw new Error('typeSlug, typeName, and itemName are required.');
  }

  // Prevent duplicate pending requests for same type+item by the same seller
  const existing = await db.query(
    `SELECT id FROM seller_master_data_requests
     WHERE seller_id = $1 AND type_slug = $2 AND item_name ILIKE $3 AND status = 'pending'`,
    [sellerId, typeSlug, itemName]
  );
  if (existing.rows.length > 0) {
    throw new Error('You already have a pending request for this item.');
  }

  const res = await db.query(
    `INSERT INTO seller_master_data_requests
       (seller_id, type_slug, type_name, item_name, reason)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [sellerId, typeSlug, typeName, itemName, reason || null]
  );

  // Notify admin
  await db.query(
    `INSERT INTO admin_notifications (type, title, message, entity_type, entity_id)
     VALUES ('master_data_request', 'New Master Data Request', $1, 'seller_master_data_request', $2)`,
    [
      `Seller ID ${sellerId} has requested to add "${itemName}" under "${typeName}".`,
      res.rows[0].id
    ]
  );

  return res.rows[0];
}

/**
 * List all requests submitted by a seller
 */
async function getSellerRequests(sellerId) {
  const res = await db.query(
    `SELECT id, type_slug as "typeSlug", type_name as "typeName", item_name as "itemName",
            reason, status, admin_note as "adminNote", reviewed_at as "reviewedAt", created_at as "createdAt"
     FROM seller_master_data_requests
     WHERE seller_id = $1
     ORDER BY created_at DESC`,
    [sellerId]
  );
  return res.rows;
}

/**
 * Admin: List all pending requests (with seller info)
 */
async function getAllRequests(filter = 'all') {
  let query = `
    SELECT smdr.id, smdr.seller_id as "sellerId", smdr.type_slug as "typeSlug",
           smdr.type_name as "typeName", smdr.item_name as "itemName",
           smdr.reason, smdr.status, smdr.admin_note as "adminNote",
           smdr.reviewed_at as "reviewedAt", smdr.created_at as "createdAt",
           s.business_name as "businessName", s.store_name as "storeName", s.email as "sellerEmail"
    FROM seller_master_data_requests smdr
    JOIN sellers s ON smdr.seller_id = s.id
  `;
  if (filter !== 'all') {
    query += ` WHERE smdr.status = '${filter}'`;
  }
  query += ` ORDER BY smdr.created_at DESC`;
  const res = await db.query(query);
  return res.rows;
}

/**
 * Admin: Approve a request — adds the item to master_items and notifies seller
 */
async function approveRequest(requestId, adminId) {
  const reqRes = await db.query(
    `SELECT * FROM seller_master_data_requests WHERE id = $1`,
    [requestId]
  );
  if (reqRes.rows.length === 0) throw new Error('Request not found.');
  const req = reqRes.rows[0];
  if (req.status !== 'pending') throw new Error('Request is already reviewed.');

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Find the master type
    const typeRes = await client.query(
      `SELECT id FROM master_types WHERE slug = $1`,
      [req.type_slug]
    );
    if (typeRes.rows.length === 0) {
      throw new Error(`Master type "${req.type_slug}" not found. Create the type first.`);
    }
    const typeId = typeRes.rows[0].id;

    // Create a slug for the new item
    const rawSlug = req.item_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    // Check uniqueness
    const slugCheck = await client.query(
      `SELECT id FROM master_items WHERE type_id = $1 AND slug = $2`,
      [typeId, rawSlug]
    );
    const finalSlug = slugCheck.rows.length > 0 ? `${rawSlug}-${Date.now()}` : rawSlug;

    // Get current max sort_order
    const orderRes = await client.query(
      `SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM master_items WHERE type_id = $1`,
      [typeId]
    );
    const sortOrder = orderRes.rows[0].next_order;

    // Insert the new master item
    await client.query(
      `INSERT INTO master_items (type_id, name, slug, sort_order, is_active)
       VALUES ($1, $2, $3, $4, true)`,
      [typeId, req.item_name, finalSlug, sortOrder]
    );

    // Mark request as approved
    await client.query(
      `UPDATE seller_master_data_requests
       SET status = 'approved', reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [requestId, adminId]
    );

    // Notify seller
    await client.query(
      `INSERT INTO seller_notifications (seller_id, type, title, message)
       VALUES ($1, 'system', $2, $3)`,
      [
        req.seller_id,
        'Master Data Request Approved',
        `Your request to add "${req.item_name}" under "${req.type_name}" has been approved and is now live.`
      ]
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
 * Admin: Reject a request and notify seller
 */
async function rejectRequest(requestId, adminId, adminNote) {
  const reqRes = await db.query(
    `SELECT * FROM seller_master_data_requests WHERE id = $1`,
    [requestId]
  );
  if (reqRes.rows.length === 0) throw new Error('Request not found.');
  const req = reqRes.rows[0];
  if (req.status !== 'pending') throw new Error('Request is already reviewed.');

  await db.query(
    `UPDATE seller_master_data_requests
     SET status = 'rejected', admin_note = $2, reviewed_by = $3, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [requestId, adminNote || 'Request does not meet catalog requirements.', adminId]
  );

  await db.query(
    `INSERT INTO seller_notifications (seller_id, type, title, message)
     VALUES ($1, 'system', $2, $3)`,
    [
      req.seller_id,
      'Master Data Request Rejected',
      `Your request to add "${req.item_name}" under "${req.type_name}" was not approved. Reason: ${adminNote || 'Does not meet catalog requirements.'}`
    ]
  );

  return true;
}

module.exports = { submitRequest, getSellerRequests, getAllRequests, approveRequest, rejectRequest };
