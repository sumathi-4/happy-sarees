const express = require('express');
const db = require('../../db');

const router = express.Router();

// GET /api/admin/email-logs — Fetch email delivery logs
router.get('/', async (req, res) => {
  try {
    const logsRes = await db.query(`
      SELECT el.*, o.order_number 
      FROM email_logs el 
      LEFT JOIN orders o ON el.order_id = o.id 
      ORDER BY el.sent_at DESC 
      LIMIT 200
    `);

    res.json({
      success: true,
      logs: logsRes.rows
    });
  } catch (err) {
    console.error('Fetch Email Logs Error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch email logs.' });
  }
});

module.exports = router;
