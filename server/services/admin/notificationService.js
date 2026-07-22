// ============================================================
//  notificationService.js — Admin Notifications
// ============================================================

const db = require('../../db');

class NotificationService {

  async getAll(query = {}) {
    const limit = Math.min(50, parseInt(query.limit) || 20);
    const onlyUnread = query.unread === 'true';

    let where = onlyUnread ? `WHERE is_read = false` : ``;

    const res = await db.query(
      `SELECT * FROM admin_notifications ${where} ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );

    const countRes = await db.query(`SELECT COUNT(*) FROM admin_notifications WHERE is_read = false`);

    return {
      notifications: res.rows,
      unreadCount: Number(countRes.rows[0].count),
    };
  }

  async markRead(id) {
    const res = await db.query(
      `UPDATE admin_notifications SET is_read = true WHERE id = $1 RETURNING *`,
      [id]
    );
    if (res.rows.length === 0) throw { status: 404, message: 'Notification not found.' };
    return res.rows[0];
  }

  async markAllRead() {
    await db.query(`UPDATE admin_notifications SET is_read = true WHERE is_read = false`);
    return { message: 'All notifications marked as read.' };
  }

  async delete(id) {
    await db.query(`DELETE FROM admin_notifications WHERE id = $1`, [id]);
    return true;
  }

  async create(type, title, message, entityType = null, entityId = null) {
    const res = await db.query(
      `INSERT INTO admin_notifications (type, title, message, entity_type, entity_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [type, title, message, entityType, entityId]
    );
    return res.rows[0];
  }

  // Check and generate low stock alerts
  async checkLowStockAlerts() {
    const res = await db.query(
      `SELECT id, name, stock_count FROM products
       WHERE stock_count < 10 AND deleted_at IS NULL AND status = 'published'`
    );

    for (const p of res.rows) {
      if (p.stock_count === 0) {
        await this.create('low_stock', 'Out of Stock', `"${p.name}" is out of stock.`, 'product', p.id);
      } else {
        await this.create('low_stock', 'Low Stock Alert', `"${p.name}" has only ${p.stock_count} units left.`, 'product', p.id);
      }
    }

    return { checked: res.rows.length };
  }
}

module.exports = new NotificationService();
