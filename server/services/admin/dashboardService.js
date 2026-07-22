// ============================================================
//  dashboardService.js — Admin Dashboard Analytics
// ============================================================

const db = require('../../db');

class DashboardService {

  // ── Summary KPIs ───────────────────────────────────────────
  async getStats() {
    const [revenue, orders, customers, products, todaySales, monthRevenue, pendingOrders] = await Promise.all([
      db.query(`SELECT COALESCE(SUM(total_amount),0) as total FROM orders WHERE payment_status = 'Paid' AND cancelled_at IS NULL`),
      db.query(`SELECT COUNT(*) as total FROM orders`),
      db.query(`SELECT COUNT(*) as total FROM users WHERE is_blocked IS NOT TRUE`),
      db.query(`SELECT COUNT(*) as total FROM products WHERE deleted_at IS NULL`),
      db.query(`SELECT COALESCE(SUM(total_amount),0) as total FROM orders WHERE DATE(created_at) = CURRENT_DATE AND payment_status = 'Paid'`),
      db.query(`SELECT COALESCE(SUM(total_amount),0) as total FROM orders WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) AND payment_status = 'Paid'`),
      db.query(`SELECT COUNT(*) as total FROM orders WHERE order_status = 'Processing'`),
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

  // ── Sales Graph (12 months) ────────────────────────────────
  async getSalesGraph() {
    const res = await db.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') as month,
        DATE_TRUNC('month', created_at) as month_date,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as orders
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '12 months'
        AND payment_status = 'Paid'
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
      status: r.status,
      count:  Number(r.count),
    }));
  }

  // ── Recent Orders (last 10) ────────────────────────────────
  async getRecentOrders() {
    const res = await db.query(`
      SELECT o.id, o.order_number, o.total_amount, o.order_status,
             o.payment_status, o.created_at,
             u.full_name as customer_name, u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    return res.rows.map(r => ({
      id:            r.id,
      orderNumber:   r.order_number,
      amount:        Number(r.total_amount),
      status:        r.order_status,
      paymentStatus: r.payment_status,
      customer:      r.customer_name || 'Guest',
      email:         r.customer_email,
      date:          r.created_at,
    }));
  }

  // ── Low Stock Products ─────────────────────────────────────
  async getLowStockProducts() {
    const res = await db.query(`
      SELECT p.id, p.name, p.sku, p.stock_count, p.status,
             pi.image_url, pi.image_data
      FROM products p
      LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
      WHERE p.stock_count < 10 AND p.deleted_at IS NULL
      ORDER BY p.stock_count ASC
      LIMIT 10
    `);

    return res.rows.map(r => ({
      id:         r.id,
      name:       r.name,
      sku:        r.sku,
      stockCount: r.stock_count,
      status:     r.status,
      image:      r.image_data || r.image_url,
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
