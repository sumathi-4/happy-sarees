// ============================================================
//  dashboardService.js — Admin Dashboard Analytics
// ============================================================

const db = require('../../db');

class DashboardService {

  // ── Summary KPIs ───────────────────────────────────────────
  async getStats() {
    const [revenue, orders, customers, products, todaySales, monthRevenue, pendingOrders] = await Promise.all([
      db.query(`SELECT COALESCE(SUM(total_amount),0) as total FROM orders WHERE LOWER(order_status) NOT IN ('cancelled', 'refunded')`),
      db.query(`SELECT COUNT(*) as total FROM orders`),
      db.query(`SELECT COUNT(*) as total FROM users WHERE is_blocked IS NOT TRUE`),
      db.query(`SELECT COUNT(*) as total FROM products WHERE deleted_at IS NULL`),
      db.query(`SELECT COALESCE(SUM(total_amount),0) as total FROM orders WHERE DATE(created_at) = CURRENT_DATE AND LOWER(order_status) NOT IN ('cancelled', 'refunded')`),
      db.query(`SELECT COALESCE(SUM(total_amount),0) as total FROM orders WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) AND LOWER(order_status) NOT IN ('cancelled', 'refunded')`),
      db.query(`SELECT COUNT(*) as total FROM orders WHERE LOWER(order_status) IN ('processing', 'pending', 'pending payment', 'order_placed', 'confirmed', 'packed')`),
    ]);

    return {
      totalRevenue:    Number(revenue.rows[0].total),
      totalOrders:     Number(orders.rows[0].total),
      totalCustomers:  Number(customers.rows[0].total),
      totalProducts:   Number(products.rows[0].total),
      todaySales:      Number(todaySales.rows[0].total),
      monthRevenue:    Number(monthRevenue.rows[0].total),
      pendingOrders:   Number(pendingOrders.rows[0].total),
    };
  }

  // ── Sales Graph ────────────────────────────────
  async getSalesGraph() {
    const res = await db.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') as month,
        DATE_TRUNC('month', created_at) as month_date,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as orders
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '12 months'
        AND LOWER(order_status) NOT IN ('cancelled', 'refunded')
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month_date ASC
    `);

    return res.rows.map(r => ({
      month:   r.month,
      revenue: Number(r.revenue),
      orders:  Number(r.orders),
    }));
  }

  // ── Order Status Chart ─────────────────────────────────────
  async getOrderStatusChart() {
    const res = await db.query(`
      SELECT order_status as status, COUNT(*) as count
      FROM orders
      GROUP BY order_status
      ORDER BY count DESC
    `);

    return res.rows.map(r => ({
      status: r.status || 'Processing',
      count:  Number(r.count),
    }));
  }

  // ── Recent Orders ────────────────────────────────
  async getRecentOrders() {
    const res = await db.query(`
      SELECT o.id, o.order_number, o.total_amount, o.order_status,
             o.payment_status, o.created_at,
             u.full_name as customer_name, u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    return res.rows.map(r => ({
      id:            r.id,
      orderNumber:   r.order_number || `#ORD-${r.id}`,
      amount:        Number(r.total_amount || 0),
      status:        r.order_status || 'Processing',
      paymentStatus: r.payment_status || 'Pending',
      customer:      r.customer_name || r.customer_email || 'Customer',
      email:         r.customer_email,
      date:          r.created_at,
    }));
  }

  // ── Top Selling Products ─────────────────────────────────────
  async getTopSellingProducts() {
    const res = await db.query(`
      SELECT p.id, p.name, p.price,
             COALESCE(SUM(oi.quantity), 0) as total_sold,
             (SELECT COALESCE(pi.image_url, pi.image_data)
              FROM product_images pi
              WHERE pi.product_id = p.id
              ORDER BY pi.is_primary DESC, pi.display_order ASC
              LIMIT 1) as image
      FROM products p
      LEFT JOIN order_items oi ON (oi.product_id = p.id OR (CASE WHEN oi.product_id::text ~ '^[0-9]+$' THEN oi.product_id::integer ELSE 0 END = p.id))
      WHERE p.deleted_at IS NULL
      GROUP BY p.id, p.name, p.price
      ORDER BY total_sold DESC, p.id DESC
      LIMIT 5
    `);

    return res.rows.map(r => ({
      id:    r.id,
      name:  r.name,
      price: Number(r.price || 0),
      sold:  Number(r.total_sold || 0),
      image: r.image || null,
    }));
  }

  // ── Low Stock Products ─────────────────────────────────────
  async getLowStockProducts() {
    const res = await db.query(`
      SELECT p.id, p.name, p.sku, p.stock_count, p.status, p.price,
             (SELECT COALESCE(pi.image_url, pi.image_data)
              FROM product_images pi
              WHERE pi.product_id = p.id
              ORDER BY pi.is_primary DESC, pi.display_order ASC
              LIMIT 1) as image
      FROM products p
      WHERE p.stock_count < 10 AND p.deleted_at IS NULL
      ORDER BY p.stock_count ASC
      LIMIT 5
    `);

    return res.rows.map(r => ({
      id:         r.id,
      name:       r.name,
      sku:        r.sku,
      stockCount: Number(r.stock_count || 0),
      status:     r.status,
      price:      Number(r.price || 0),
      image:      r.image || null,
    }));
  }

  // ── Latest Customers ───────────────────────────────────────
  async getLatestCustomers() {
    const res = await db.query(`
      SELECT id, full_name, email, phone, created_at,
             (SELECT COUNT(*) FROM orders WHERE user_id = users.id) as order_count
      FROM users
      WHERE is_blocked IS NOT TRUE
      ORDER BY created_at DESC
      LIMIT 8
    `);

    return res.rows.map(r => ({
      id:         r.id,
      name:       r.full_name,
      email:      r.email,
      phone:      r.phone,
      joinedAt:   r.created_at,
      orderCount: Number(r.order_count),
    }));
  }

  // ── Recent Activities ──────────────────────────────────────
  async getRecentActivities() {
    const res = await db.query(`
      SELECT al.id, al.action, al.entity_type, al.entity_id, al.description, al.created_at,
             au.name as admin_name
      FROM admin_activity_log al
      LEFT JOIN admin_users au ON al.admin_user_id = au.id
      ORDER BY al.created_at DESC
      LIMIT 20
    `);

    return res.rows.map(r => ({
      id:          r.id,
      action:      r.action,
      entityType:  r.entity_type,
      entityId:    r.entity_id,
      description: r.description,
      admin:       r.admin_name || 'System',
      createdAt:   r.created_at,
    }));
  }
}

module.exports = new DashboardService();

