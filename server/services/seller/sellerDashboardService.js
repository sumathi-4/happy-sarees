const db = require('../../db');

/**
 * Fetch seller dashboard KPIs and analytical charts
 */
async function getSellerDashboardSummary(sellerId) {
  // 1. Core metrics
  const statsRes = await db.query(
    `SELECT
      COALESCE(SUM(CASE WHEN o.created_at >= CURRENT_DATE AND oi.fulfillment_status != 'Cancelled' THEN oi.price_at_purchase * oi.quantity ELSE 0 END), 0) as today_revenue,
      COALESCE(COUNT(DISTINCT CASE WHEN o.created_at >= CURRENT_DATE THEN oi.order_id END), 0) as today_orders,
      COALESCE(SUM(CASE WHEN oi.fulfillment_status = 'Pending' THEN 1 ELSE 0 END), 0) as pending_orders,
      COALESCE(SUM(CASE WHEN oi.fulfillment_status = 'Delivered' THEN 1 ELSE 0 END), 0) as delivered_orders,
      COALESCE(SUM(CASE WHEN oi.fulfillment_status = 'Cancelled' THEN 1 ELSE 0 END), 0) as cancelled_orders,
      COALESCE(SUM(CASE WHEN oi.fulfillment_status != 'Cancelled' THEN oi.price_at_purchase * oi.quantity ELSE 0 END), 0) as total_revenue
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     WHERE oi.seller_id = $1`,
    [sellerId]
  );

  const stats = statsRes.rows[0];

  // 2. 14-Day Sales Trend (grouped by day)
  const trendRes = await db.query(
    `WITH date_series AS (
       SELECT GENERATE_SERIES(CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE, '1 day')::date as date_val
     )
     SELECT 
       d.date_val as date,
       COALESCE(SUM(oi.price_at_purchase * oi.quantity), 0) as revenue,
       COALESCE(COUNT(DISTINCT oi.order_id), 0) as order_count
     FROM date_series d
     LEFT JOIN orders o ON o.created_at::date = d.date_val
     LEFT JOIN order_items oi ON oi.order_id = o.id AND oi.seller_id = $1 AND oi.fulfillment_status != 'Cancelled'
     GROUP BY d.date_val
     ORDER BY d.date_val ASC`,
    [sellerId]
  );

  const trend = trendRes.rows.map(r => ({
    date: r.date.toISOString().split('T')[0],
    revenue: Number(r.revenue),
    orders: Number(r.order_count)
  }));

  // 3. Best Selling Saree
  const bestSellerRes = await db.query(
    `SELECT p.id, p.name, p.sku, 
            COALESCE(SUM(oi.quantity), 0) as units_sold,
            COALESCE(SUM(oi.price_at_purchase * oi.quantity), 0) as revenue_generated,
            (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1) as cover_image
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     WHERE oi.seller_id = $1 AND oi.fulfillment_status != 'Cancelled'
     GROUP BY p.id, p.name, p.sku
     ORDER BY units_sold DESC, revenue_generated DESC
     LIMIT 1`,
    [sellerId]
  );

  let bestProduct = null;
  if (bestSellerRes.rows.length > 0) {
    const bp = bestSellerRes.rows[0];
    bestProduct = {
      id: bp.id,
      name: bp.name,
      sku: bp.sku,
      unitsSold: Number(bp.units_sold),
      revenue: Number(bp.revenue_generated),
      image: bp.cover_image || 'https://via.placeholder.com/100x130?text=No+Image'
    };
  }

  // 4. Payouts summary list
  const payoutsRes = await db.query(
    `SELECT id, amount, status, period_start, period_end, paid_at, created_at
     FROM seller_payouts
     WHERE seller_id = $1
     ORDER BY created_at DESC
     LIMIT 5`,
    [sellerId]
  );

  const payouts = payoutsRes.rows.map(r => ({
    id: r.id,
    amount: Number(r.amount),
    status: r.status,
    periodStart: r.period_start,
    periodEnd: r.period_end,
    paidAt: r.paid_at,
    createdAt: r.created_at
  }));

  return {
    todayRevenue: Number(stats.today_revenue),
    todayOrders: Number(stats.today_orders),
    pendingOrders: Number(stats.pending_orders),
    deliveredOrders: Number(stats.delivered_orders),
    cancelledOrders: Number(stats.cancelled_orders),
    totalRevenue: Number(stats.total_revenue),
    trend,
    bestProduct,
    payouts
  };
}

module.exports = {
  getSellerDashboardSummary
};
