// ============================================================
//  customerService.js — Admin Customer Management
// ============================================================

const db = require('../../db');
const { parsePagination } = require('../../utils/pagination');

class CustomerService {

  async getAll(query) {
    const { page, limit, offset } = parsePagination(query, 15);
    const { search, status, sort } = query;

    let where = [`1=1`];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      where.push(`(full_name ILIKE $${params.length} OR email ILIKE $${params.length} OR phone ILIKE $${params.length})`);
    }
    if (status === 'blocked')   where.push(`is_blocked = true`);
    if (status === 'active')    where.push(`(is_blocked IS NULL OR is_blocked = false)`);

    const whereClause = where.join(' AND ');
    params.push(limit, offset);

    const [data, countRes] = await Promise.all([
      db.query(
        `SELECT u.id, u.full_name, u.email, u.phone, u.role, u.is_blocked, u.block_reason, u.created_at,
                COUNT(DISTINCT o.id) as order_count,
                COALESCE(SUM(o.total_amount), 0) as total_spent
         FROM users u
         LEFT JOIN orders o ON o.user_id = u.id AND o.payment_status = 'Paid'
         WHERE ${whereClause}
         GROUP BY u.id
         ORDER BY u.created_at DESC
         LIMIT $${params.length-1} OFFSET $${params.length}`,
        params
      ),
      db.query(`SELECT COUNT(*) FROM users WHERE ${whereClause}`, params.slice(0,-2)),
    ]);

    return {
      customers: data.rows.map(r => ({
        id:          r.id,
        name:        r.full_name,
        email:       r.email,
        phone:       r.phone,
        isBlocked:   r.is_blocked,
        blockReason: r.block_reason,
        orderCount:  Number(r.order_count),
        totalSpent:  Number(r.total_spent),
        joinedAt:    r.created_at,
      })),
      total: Number(countRes.rows[0].count),
      page,
      limit,
    };
  }

  async getById(id) {
    const [user, orders, reviews, addresses] = await Promise.all([
      db.query(
        `SELECT id, full_name, email, phone, role, is_blocked, block_reason, created_at, updated_at FROM users WHERE id = $1`,
        [id]
      ),
      db.query(
        `SELECT o.*, COUNT(oi.id) as item_count
         FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id
         WHERE o.user_id = $1 GROUP BY o.id ORDER BY o.created_at DESC`,
        [id]
      ),
      db.query(
        `SELECT r.*, p.name as product_name FROM reviews r
         LEFT JOIN products p ON r.product_id = p.id
         WHERE r.user_id = $1 ORDER BY r.created_at DESC`,
        [id]
      ),
      db.query(`SELECT * FROM addresses WHERE user_id = $1`, [id]),
    ]);

    if (user.rows.length === 0) throw { status: 404, message: 'Customer not found.' };

    const u = user.rows[0];
    const totalSpent = orders.rows.reduce((s, o) => s + (o.payment_status === 'Paid' ? Number(o.total_amount) : 0), 0);

    return {
      id:          u.id,
      name:        u.full_name,
      email:       u.email,
      phone:       u.phone,
      isBlocked:   u.is_blocked,
      blockReason: u.block_reason,
      joinedAt:    u.created_at,
      totalOrders: orders.rows.length,
      totalSpent,
      orders:      orders.rows,
      reviews:     reviews.rows,
      addresses:   addresses.rows,
    };
  }

  async setStatus(id, action, reason) {
    if (action === 'block') {
      await db.query(
        `UPDATE users SET is_blocked = true, block_reason = $1, updated_at = NOW() WHERE id = $2`,
        [reason || 'Blocked by admin', id]
      );
    } else if (action === 'unblock') {
      await db.query(
        `UPDATE users SET is_blocked = false, block_reason = NULL, updated_at = NOW() WHERE id = $1`,
        [id]
      );
    } else if (action === 'delete') {
      await db.query(`DELETE FROM users WHERE id = $1`, [id]);
      return { deleted: true };
    } else {
      throw { status: 400, message: 'Invalid action. Use: block, unblock, or delete.' };
    }
    return this.getById(id);
  }

  async getAnalytics(id) {
    const [monthlySpend, productCategories] = await Promise.all([
      db.query(
        `SELECT TO_CHAR(DATE_TRUNC('month', o.created_at), 'Mon YY') as month,
                COALESCE(SUM(o.total_amount), 0) as spend
         FROM orders o WHERE o.user_id = $1 AND o.payment_status = 'Paid'
         GROUP BY DATE_TRUNC('month', o.created_at)
         ORDER BY DATE_TRUNC('month', o.created_at) ASC`,
        [id]
      ),
      db.query(
        `SELECT c.name as category, COUNT(oi.id) as count
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         JOIN products p ON oi.product_id = p.id
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE o.user_id = $1
         GROUP BY c.name ORDER BY count DESC LIMIT 5`,
        [id]
      ),
    ]);

    return {
      monthlySpend: monthlySpend.rows,
      topCategories: productCategories.rows,
    };
  }
}

module.exports = new CustomerService();
