const db = require('../../db');
const masterDataService = require('../admin/masterDataService');

/**
 * Seller submits a catalog master data request
 */
async function submitRequest(sellerId, data) {
  const { requestType = 'add_item', typeSlug, typeName, itemName, reason, targetTypeId, targetItemId, payload } = data;

  const validTypes = ['add_type', 'edit_type', 'delete_type', 'add_item', 'edit_item', 'delete_item'];
  if (!validTypes.includes(requestType)) {
    throw new Error(`Invalid requestType: ${requestType}`);
  }

  // Basic validation checks
  if (requestType === 'add_item' && (!typeSlug || !itemName)) {
    throw new Error('typeSlug and itemName are required for adding an item.');
  }
  if (requestType === 'add_type' && !typeName) {
    throw new Error('typeName is required for adding a type.');
  }
  if ((requestType === 'edit_type' || requestType === 'delete_type') && !targetTypeId) {
    throw new Error('targetTypeId is required.');
  }
  if ((requestType === 'edit_item' || requestType === 'delete_item') && !targetItemId) {
    throw new Error('targetItemId is required.');
  }

  // â”€â”€ Ownership check: sellers may only request edit/delete on their own rows â”€â”€
  if (requestType === 'edit_item' || requestType === 'delete_item') {
    const itemRow = await db.query(
      `SELECT created_by_seller_id, source FROM master_items WHERE id = $1`,
      [parseInt(targetItemId)]
    );
    if (itemRow.rows.length === 0) {
      const notFound = new Error(`Item ID ${targetItemId} not found.`);
      notFound.status = 404;
      throw notFound;
    }
    const { created_by_seller_id, source } = itemRow.rows[0];
    if (source !== 'seller' || created_by_seller_id !== sellerId) {
      const forbidden = new Error(
        'You can only request edits or deletions for items you personally created. ' +
        'Items managed by Happy Sarees cannot be modified by sellers.'
      );
      forbidden.status = 403;
      throw forbidden;
    }
  }

  if (requestType === 'edit_type' || requestType === 'delete_type') {
    const typeRow = await db.query(
      `SELECT created_by_seller_id, source FROM master_types WHERE id = $1`,
      [parseInt(targetTypeId)]
    );
    if (typeRow.rows.length === 0) {
      const notFound = new Error(`Type ID ${targetTypeId} not found.`);
      notFound.status = 404;
      throw notFound;
    }
    const { created_by_seller_id, source } = typeRow.rows[0];
    if (source !== 'seller' || created_by_seller_id !== sellerId) {
      const forbidden = new Error(
        'You can only request edits or deletions for attribute types you personally created. ' +
        'Types managed by Happy Sarees cannot be modified by sellers.'
      );
      forbidden.status = 403;
      throw forbidden;
    }
  }

  // Prevent duplicate pending requests for same action by the same seller
  const existing = await db.query(
    `SELECT id FROM seller_master_data_requests
     WHERE seller_id = $1 
       AND request_type = $2 
       AND status = 'pending'
       AND COALESCE(type_slug, '') = COALESCE($3, '')
       AND COALESCE(item_name, '') = COALESCE($4, '')
       AND COALESCE(target_type_id, 0) = COALESCE($5, 0)
       AND COALESCE(target_item_id, 0) = COALESCE($6, 0)`,
    [
      sellerId, 
      requestType, 
      typeSlug || null, 
      itemName || null, 
      targetTypeId ? parseInt(targetTypeId) : null, 
      targetItemId ? parseInt(targetItemId) : null
    ]
  );
  if (existing.rows.length > 0) {
    throw new Error('You already have a pending request for this catalog update.');
  }

  const res = await db.query(
    `INSERT INTO seller_master_data_requests
       (seller_id, request_type, type_slug, type_name, item_name, reason, target_type_id, target_item_id, payload)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      sellerId,
      requestType,
      typeSlug || null,
      typeName || null,
      itemName || null,
      reason || null,
      targetTypeId ? parseInt(targetTypeId) : null,
      targetItemId ? parseInt(targetItemId) : null,
      payload ? JSON.stringify(payload) : null
    ]
  );

  // Notify admin
  let displayMsg = '';
  if (requestType === 'add_item') {
    displayMsg = `Seller requested to add item "${itemName}" under "${typeName || typeSlug}".`;
  } else if (requestType === 'add_type') {
    displayMsg = `Seller requested to create new attribute type "${typeName}".`;
  } else {
    displayMsg = `Seller requested to ${requestType.replace('_', ' ')} (ID: ${targetItemId || targetTypeId}).`;
  }

  await db.query(
    `INSERT INTO admin_notifications (type, title, message, entity_type, entity_id)
     VALUES ('master_data_request', 'New Catalog Master Data Request', $1, 'seller_master_data_request', $2)`,
    [displayMsg, res.rows[0].id]
  );

  return res.rows[0];
}

/**
 * List all requests submitted by a seller
 */
async function getSellerRequests(sellerId) {
  const res = await db.query(
    `SELECT id, request_type as "requestType", type_slug as "typeSlug", type_name as "typeName", item_name as "itemName",
            reason, status, admin_note as "adminNote", reviewed_at as "reviewedAt", created_at as "createdAt",
            target_type_id as "targetTypeId", target_item_id as "targetItemId", payload
     FROM seller_master_data_requests
     WHERE seller_id = $1
     ORDER BY created_at DESC`,
    [sellerId]
  );
  return res.rows.map(r => {
    let parsedPayload = null;
    if (r.payload) {
      parsedPayload = typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload;
    }
    return { ...r, payload: parsedPayload };
  });
}

/**
 * Admin: List all requests (with seller info)
 */
async function getAllRequests(filter = 'all') {
  let query = `
    SELECT smdr.id, smdr.seller_id as "sellerId", smdr.request_type as "requestType", smdr.type_slug as "typeSlug",
           smdr.type_name as "typeName", smdr.item_name as "itemName",
           smdr.reason, smdr.status, smdr.admin_note as "adminNote",
           smdr.reviewed_at as "reviewedAt", smdr.created_at as "createdAt",
           smdr.target_type_id as "targetTypeId", smdr.target_item_id as "targetItemId", smdr.payload,
           s.business_name as "businessName", s.store_name as "storeName", s.email as "sellerEmail",
           mi.source as "targetItemSource", mi.created_by_seller_id as "targetItemCreatedBySellerId", s_mi.store_name as "targetItemSellerName",
           mt.source as "targetTypeSource", mt.created_by_seller_id as "targetTypeCreatedBySellerId", s_mt.store_name as "targetTypeSellerName"
    FROM seller_master_data_requests smdr
    JOIN sellers s ON smdr.seller_id = s.id
    LEFT JOIN master_items mi ON smdr.target_item_id = mi.id
    LEFT JOIN sellers s_mi ON mi.created_by_seller_id = s_mi.id
    LEFT JOIN master_types mt ON smdr.target_type_id = mt.id
    LEFT JOIN sellers s_mt ON mt.created_by_seller_id = s_mt.id
  `;
  if (filter !== 'all') {
    query += ` WHERE smdr.status = '${filter}'`;
  }
  query += ` ORDER BY smdr.created_at DESC`;
  const res = await db.query(query);
  return res.rows.map(r => {
    let parsedPayload = null;
    if (r.payload) {
      parsedPayload = typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload;
    }
    return { ...r, payload: parsedPayload };
  });
}

/**
 * Admin: Approve a request â€” applies the operation and notifies seller
 */
async function approveRequest(requestId, adminId) {
  const reqRes = await db.query(
    `SELECT * FROM seller_master_data_requests WHERE id = $1`,
    [requestId]
  );
  if (reqRes.rows.length === 0) throw new Error('Request not found.');
  const req = reqRes.rows[0];
  if (req.status !== 'pending') throw new Error('Request is already reviewed.');

  const requestType = req.request_type;
  const payload = typeof req.payload === 'string' ? JSON.parse(req.payload) : (req.payload || {});

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Branch on request type
    if (requestType === 'add_type') {
      await masterDataService.createType({
        name: req.type_name,
        showInFilters: payload.showInFilters ?? true,
        showInSpecifications: payload.showInSpecifications ?? true,
        createdBySellerId: req.seller_id
      }, client);
    } 
    else if (requestType === 'edit_type') {
      const typeId = req.target_type_id || req.type_slug;
      await masterDataService.updateType(typeId, payload, client);
    } 
    else if (requestType === 'delete_type') {
      const typeId = req.target_type_id || req.type_slug;
      await masterDataService.deleteType(typeId, client);
    } 
    else if (requestType === 'add_item') {
      const typeId = req.target_type_id || (await masterDataService.resolveTypeId(req.type_slug, client));
      if (!typeId) {
        throw new Error(`Master type "${req.type_slug || req.type_name}" not found.`);
      }
      await masterDataService.createItem(typeId, {
        name: req.item_name,
        description: payload.description || '',
        imageData: payload.imageData || '',
        isActive: payload.isActive ?? true,
        sortOrder: payload.sortOrder || null,
        colorHex: payload.colorHex || null,
        createdBySellerId: req.seller_id
      }, client);
    } 
    else if (requestType === 'edit_item') {
      const typeId = req.target_type_id;
      const itemId = req.target_item_id;
      await masterDataService.updateItem(typeId, itemId, payload, client);
    } 
    else if (requestType === 'delete_item') {
      const typeId = req.target_type_id;
      const itemId = req.target_item_id;
      await masterDataService.deleteItem(typeId, itemId, client);
    }

    // Mark request as approved
    await client.query(
      `UPDATE seller_master_data_requests
       SET status = 'approved', reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [requestId, adminId]
    );

    // Notify seller
    const displayName = req.item_name || req.type_name || `Attribute ID: ${req.target_item_id || req.target_type_id}`;
    const categoryName = req.type_name || 'Catalog';
    await client.query(
      `INSERT INTO seller_notifications (seller_id, type, title, message)
       VALUES ($1, 'system', $2, $3)`,
      [
        req.seller_id,
        'Catalog Change Request Approved',
        `Your request to ${requestType.replace('_', ' ')} "${displayName}" under "${categoryName}" has been approved.`
      ]
    );

    await client.query('COMMIT');

    // Fetch seller email and store name for transactional email (non-blocking)
    db.query('SELECT email, store_name FROM sellers WHERE id = $1', [req.seller_id])
      .then(sRes => {
        if (sRes.rows.length > 0) {
          const { email, store_name } = sRes.rows[0];
          const emailService = require('../emailService');
          emailService.sendMasterDataRequestEmail(email, store_name, categoryName, displayName, true).catch(console.error);
        }
      })
      .catch(console.error);

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

  const requestType = req.request_type;
  const displayName = req.item_name || req.type_name || `Attribute ID: ${req.target_item_id || req.target_type_id}`;
  const categoryName = req.type_name || 'Catalog';

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
      'Catalog Change Request Rejected',
      `Your request to ${requestType.replace('_', ' ')} "${displayName}" was not approved. Reason: ${adminNote || 'Does not meet catalog requirements.'}`
    ]
  );

  // Send email alert (non-blocking)
  db.query('SELECT email, store_name FROM sellers WHERE id = $1', [req.seller_id])
    .then(sRes => {
      if (sRes.rows.length > 0) {
        const { email, store_name } = sRes.rows[0];
        const emailService = require('../emailService');
        emailService.sendMasterDataRequestEmail(email, store_name, categoryName, displayName, false, adminNote).catch(console.error);
      }
    })
    .catch(console.error);

  return true;
}

module.exports = { submitRequest, getSellerRequests, getAllRequests, approveRequest, rejectRequest };

