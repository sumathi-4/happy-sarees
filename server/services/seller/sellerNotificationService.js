const db = require('../../db');

async function getSellerNotifications(sellerId) {
  const res = await db.query(
    `SELECT id, type, title, message, is_read, created_at
     FROM seller_notifications
     WHERE seller_id = $1
     ORDER BY created_at DESC`,
    [sellerId]
  );
  return res.rows.map(r => ({
    id: r.id,
    type: r.type,
    title: r.title,
    message: r.message,
    isRead: r.is_read,
    createdAt: r.created_at
  }));
}

async function markNotificationRead(sellerId, notifId) {
  const check = await db.query('SELECT id FROM seller_notifications WHERE id = $1 AND seller_id = $2', [notifId, sellerId]);
  if (check.rows.length === 0) {
    throw new Error('Notification not found or not owned by you.');
  }

  await db.query('UPDATE seller_notifications SET is_read = true WHERE id = $1', [notifId]);
  return true;
}

async function markAllNotificationsRead(sellerId) {
  await db.query('UPDATE seller_notifications SET is_read = true WHERE seller_id = $1', [sellerId]);
  return true;
}

module.exports = {
  getSellerNotifications,
  markNotificationRead,
  markAllNotificationsRead
};
