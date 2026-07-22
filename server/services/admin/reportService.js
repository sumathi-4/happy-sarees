// ============================================================
//  reportService.js — Reports & Analytics
// ============================================================

const db = require('../../db');

class ReportService {

  async getRevenue({ dateFrom, dateTo, groupBy = 'day' }) {
    const from = dateFrom || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const to   = dateTo   || new Date().toISOString().split('T')[0];

    const trunc = groupBy === 'month' ? 'month' : groupBy === 'week' ? 'week' : 'day';

    const res = await db.query(
      `SELECT
         DATE_TRUNC($1, created_at) as period,
         COUNT(*) as order_count,
         COALESCE(SUM(total_amount), 0) as revenue
       FROM orders
       WHERE DATE(created_at) BETWEEN $2 AND $3
         AND payment_status = 'Paid'
       GROUP BY DATE_TRUNC($1, created_at)
       ORDER BY period ASC`,
      [trunc, from, to]
    );

    const summary = await db.query(
      `SELECT
         COUNT(*) as total_orders,
         COALESCE(SUM(total_amount), 0) as total_revenue,
         COALESCE(AVG(total_amount), 0) as avg_order_value
       FROM orders
       WHERE DATE(created_at) BETWEEN $1 AND $2 AND payment_status = 'Paid'`,
      [from, to]
    );

    return {
      period: { from, to },
      data: res.rows.map(r => ({ period: r.period, orders: Number(r.order_count), revenue: Number(r.revenue) })),
      summary: {
        totalOrders:   Number(summary.rows[0].total_orders),
        totalRevenue:  Number(summary.rows[0].total_revenue),
        avgOrderValue: Number(summary.rows[0].avg_order_value).toFixed(2),
      },
    };
  }

  async getSalesReport({ dateFrom, dateTo }) {
    const from = dateFrom || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const to   = dateTo   || new Date().toISOString().split('T')[0];

    const [byProduct, byCategory, byFabric] = await Promise.all([
      db.query(
        `SELECT p.id, p.name, p.sku, p.fabric, p.color,
                SUM(oi.quantity) as units_sold,
                SUM(oi.quantity * oi.price_at_purchase) as revenue
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         JOIN orders o ON oi.order_id = o.id
         WHERE DATE(o.created_at) BETWEEN $1 AND $2 AND o.payment_status = 'Paid'
         GROUP BY p.id ORDER BY revenue DESC LIMIT 20`,
        [from, to]
      ),
      db.query(
        `SELECT c.name as category, SUM(oi.quantity) as units, SUM(oi.quantity * oi.price_at_purchase) as revenue
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         LEFT JOIN categories c ON p.category_id = c.id
         JOIN orders o ON oi.order_id = o.id
         WHERE DATE(o.created_at) BETWEEN $1 AND $2 AND o.payment_status = 'Paid'
         GROUP BY c.name ORDER BY revenue DESC`,
        [from, to]
      ),
      db.query(
        `SELECT p.fabric, SUM(oi.quantity) as units, SUM(oi.quantity * oi.price_at_purchase) as revenue
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         JOIN orders o ON oi.order_id = o.id
         WHERE DATE(o.created_at) BETWEEN $1 AND $2 AND o.payment_status = 'Paid'
         GROUP BY p.fabric ORDER BY revenue DESC`,
        [from, to]
      ),
    ]);

    return {
      period: { from, to },
      topProducts: byProduct.rows.map(r => ({ ...r, revenue: Number(r.revenue) })),
      byCategory:  byCategory.rows.map(r => ({ ...r, revenue: Number(r.revenue) })),
      byFabric:    byFabric.rows.map(r => ({ ...r, revenue: Number(r.revenue) })),
    };
  }

  async getCustomerReport({ dateFrom, dateTo }) {
    const from = dateFrom || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const to   = dateTo   || new Date().toISOString().split('T')[0];

    const [newCustomers, topCustomers, retention] = await Promise.all([
      db.query(
        `SELECT DATE(created_at) as date, COUNT(*) as count
         FROM users WHERE DATE(created_at) BETWEEN $1 AND $2
         GROUP BY DATE(created_at) ORDER BY date ASC`,
        [from, to]
      ),
      db.query(
        `SELECT u.id, u.full_name, u.email,
                COUNT(o.id) as order_count, SUM(o.total_amount) as total_spent
         FROM users u
         JOIN orders o ON o.user_id = u.id AND o.payment_status = 'Paid'
         GROUP BY u.id ORDER BY total_spent DESC LIMIT 10`,
        []
      ),
      db.query(
        `SELECT COUNT(DISTINCT user_id) as repeat_customers
         FROM orders WHERE user_id IN (SELECT user_id FROM orders GROUP BY user_id HAVING COUNT(*) > 1)`
      ),
    ]);

    return {
      period: { from, to },
      newCustomers: newCustomers.rows,
      topCustomers: topCustomers.rows.map(r => ({ ...r, totalSpent: Number(r.total_spent) })),
      repeatCustomers: Number(retention.rows[0].repeat_customers),
    };
  }

  async getOrderReport({ dateFrom, dateTo }) {
    const from = dateFrom || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const to   = dateTo   || new Date().toISOString().split('T')[0];

    const [statusBreakdown, paymentBreakdown] = await Promise.all([
      db.query(
        `SELECT order_status, COUNT(*) as count, SUM(total_amount) as total
         FROM orders WHERE DATE(created_at) BETWEEN $1 AND $2
         GROUP BY order_status ORDER BY count DESC`,
        [from, to]
      ),
      db.query(
        `SELECT payment_method, COUNT(*) as count, SUM(total_amount) as total
         FROM orders WHERE DATE(created_at) BETWEEN $1 AND $2
         GROUP BY payment_method ORDER BY count DESC`,
        [from, to]
      ),
    ]);

    return {
      period: { from, to },
      byStatus:  statusBreakdown.rows.map(r => ({ ...r, total: Number(r.total) })),
      byPayment: paymentBreakdown.rows.map(r => ({ ...r, total: Number(r.total) })),
    };
  }

  async getCouponReport({ dateFrom, dateTo }) {
    const from = dateFrom || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const to   = dateTo   || new Date().toISOString().split('T')[0];

    const res = await db.query(
      `SELECT c.code, c.name, c.type, c.value,
              COUNT(cu.id) as usage_count,
              COALESCE(SUM(cu.discount_amount), 0) as total_discount
       FROM coupons c
       LEFT JOIN coupon_usage cu ON cu.coupon_id = c.id
         AND DATE(cu.used_at) BETWEEN $1 AND $2
       GROUP BY c.id ORDER BY usage_count DESC`,
      [from, to]
    );

    return {
      period: { from, to },
      coupons: res.rows.map(r => ({ ...r, totalDiscount: Number(r.total_discount) })),
    };
  }

  async exportCsv(reportType, params) {
    let data;
    if (reportType === 'revenue')  data = await this.getRevenue(params);
    if (reportType === 'sales')    data = await this.getSalesReport(params);
    if (reportType === 'orders')   data = await this.getOrderReport(params);
    if (reportType === 'customers')data = await this.getCustomerReport(params);
    if (reportType === 'coupons')  data = await this.getCouponReport(params);

    return data;
  }
}

module.exports = new ReportService();
