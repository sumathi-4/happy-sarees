const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// 1. Get Logged-In Customer Notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    const unreadCount = result.rows.filter(n => !n.is_read).length;

    const formatted = result.rows.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type || 'system',
      unread: !n.is_read,
      time: new Date(n.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }));

    res.json({
      success: true,
      unreadCount,
      notifications: formatted
    });
  } catch (error) {
    console.error('Fetch Notifications Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
});

// 2. Mark All Notifications as Read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    await db.query(`UPDATE notifications SET is_read = true WHERE user_id = $1`, [userId]);
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Mark Read Notifications Error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notifications as read.' });
  }
});

// 3. Mark Single Notification as Read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const notifId = req.params.id;
    await db.query(`UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`, [notifId, userId]);
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
});

module.exports = router;
