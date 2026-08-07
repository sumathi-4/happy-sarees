const db = require('../../db');

/**
 * Get all order items belonging to a seller, with filtering and live status counts
 */
async function getSellerOrders(sellerId, filters = {}) {
  const { status, search } = filters;
  
  let query = `
    SELECT oi.id as item_id, oi.order_id, oi.product_id, oi.quantity, oi.price_at_purchase,
           oi.fulfillment_status, oi.tracking_number, oi.shipped_at, oi.payment_status as item_payment_status,
           p.name as product_name, p.sku as product_sku,
           (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1) as product_image,
           o.order_number, o.created_at, o.shipping_address,
           u.full_name as customer_name, u.email as customer_email
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN products p ON oi.product_id = p.id
    LEFT JOIN users u ON o.user_id = u.id
    WHERE oi.seller_id = $1
  `;
  const params = [sellerId];

  if (status) {
    params.push(status);
    query += ` AND oi.fulfillment_status = $${params.length}`;
  }

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (o.order_number ILIKE $${params.length} OR u.full_name ILIKE $${params.length} OR p.name ILIKE $${params.length})`;
  }

  query += ` ORDER BY o.created_at DESC`;

  const res = await db.query(query, params);

  // Return mapped orders
  return res.rows.map(r => ({
    id: r.item_id, // item id is exposed as the primary id for status editing
    orderId: r.order_id,
    orderNumber: r.order_number,
    productId: r.product_id,
    productName: r.product_name,
    productSku: r.product_sku,
    productImage: r.product_image || 'https://via.placeholder.com/100x130?text=No+Image',
    quantity: r.quantity,
    price: Number(r.price_at_purchase),
    subtotal: Number(r.price_at_purchase) * r.quantity,
    fulfillmentStatus: r.fulfillment_status,
    paymentStatus: r.item_payment_status,
    trackingNumber: r.tracking_number,
    shippedAt: r.shipped_at,
    createdAt: r.created_at,
    shippingAddress: typeof r.shipping_address === 'string' ? JSON.parse(r.shipping_address) : r.shipping_address,
    customerName: r.customer_name || 'Guest Customer',
    customerEmail: r.customer_email || 'N/A'
  }));
}

/**
 * Get detailed stats and order items for a specific order, scoped to a seller
 */
async function getSellerOrderDetails(sellerId, orderId) {
  const query = `
    SELECT oi.id as item_id, oi.order_id, oi.product_id, oi.quantity, oi.price_at_purchase,
           oi.fulfillment_status, oi.tracking_number, oi.shipped_at, oi.payment_status as item_payment_status,
           p.name as product_name, p.sku as product_sku,
           (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1) as product_image,
           o.order_number, o.created_at, o.shipping_address,
           u.full_name as customer_name, u.email as customer_email
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN products p ON oi.product_id = p.id
    LEFT JOIN users u ON o.user_id = u.id
    WHERE oi.seller_id = $1 AND o.id = $2
  `;

  const res = await db.query(query, [sellerId, orderId]);
  if (res.rows.length === 0) {
    throw new Error('Order not found or does not contain your products.');
  }

  const items = res.rows.map(r => ({
    id: r.item_id,
    productId: r.product_id,
    productName: r.product_name,
    productSku: r.product_sku,
    productImage: r.product_image || 'https://via.placeholder.com/100x130?text=No+Image',
    quantity: r.quantity,
    price: Number(r.price_at_purchase),
    subtotal: Number(r.price_at_purchase) * r.quantity,
    fulfillmentStatus: r.fulfillment_status,
    paymentStatus: r.item_payment_status,
    trackingNumber: r.tracking_number,
    shippedAt: r.shipped_at
  }));

  const first = res.rows[0];
  return {
    orderId: first.order_id,
    orderNumber: first.order_number,
    createdAt: first.created_at,
    shippingAddress: typeof first.shipping_address === 'string' ? JSON.parse(first.shipping_address) : first.shipping_address,
    customerName: first.customer_name || 'Guest Customer',
    customerEmail: first.customer_email || 'N/A',
    items
  };
}

/**
 * Update order item fulfillment status (Pending -> Processing -> Shipped -> Delivered, or Cancelled)
 */
async function updateOrderItemStatus(sellerId, itemId, status, trackingNumber = null) {
  // Check ownership
  const check = await db.query(
    'SELECT oi.id, oi.product_id, oi.quantity, oi.price_at_purchase, p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.id = $1 AND oi.seller_id = $2',
    [itemId, sellerId]
  );
  if (check.rows.length === 0) {
    throw new Error('Order item not found or not owned by you.');
  }

  const item = check.rows[0];
  const shippedAt = status === 'Shipped' ? new Date() : null;

  let query = `
    UPDATE order_items SET
      fulfillment_status = $3
  `;
  const params = [itemId, sellerId, status];

  if (trackingNumber !== null) {
    params.push(trackingNumber);
    query += `, tracking_number = $4`;
  }
  if (shippedAt !== null) {
    params.push(shippedAt);
    query += `, shipped_at = $${params.length}`;
  }

  query += ` WHERE id = $1 AND seller_id = $2`;

  await db.query(query, params);

  // Notify seller
  await db.query(
    `INSERT INTO seller_notifications (seller_id, type, title, message)
     VALUES ($1, 'new_order', $2, $3)`,
    [
      sellerId,
      'Order Item Status Updated',
      `Fulfillment status for "${item.name}" (Qty: ${item.quantity}) updated to "${status}".`
    ]
  );

  return true;
}

/**
 * Update order item payment status
 */
async function updateOrderItemPaymentStatus(sellerId, itemId, paymentStatus) {
  // Check ownership
  const check = await db.query(
    'SELECT oi.id, oi.product_id, oi.quantity, p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.id = $1 AND oi.seller_id = $2',
    [itemId, sellerId]
  );
  if (check.rows.length === 0) {
    throw new Error('Order item not found or not owned by you.');
  }

  const item = check.rows[0];

  await db.query(
    'UPDATE order_items SET payment_status = $3 WHERE id = $1 AND seller_id = $2',
    [itemId, sellerId, paymentStatus]
  );

  // Notify seller
  await db.query(
    `INSERT INTO seller_notifications (seller_id, type, title, message)
     VALUES ($1, 'payout', $2, $3)`,
    [
      sellerId,
      'Payment Status Updated',
      `Payment status for "${item.name}" updated to "${paymentStatus}".`
    ]
  );

  return true;
}

module.exports = {
  getSellerOrders,
  getSellerOrderDetails,
  updateOrderItemStatus,
  updateOrderItemPaymentStatus
};
