const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/auth');

const jwt = require('jsonwebtoken');

const router = express.Router();

// Optional Auth Middleware
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET || 'happysarees_secret_key_2026');
      req.user = verified;
    } catch (e) {}
  }
  next();
}

// 1. Get User Addresses
router.get('/', optionalAuth, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.json({ success: true, addresses: [] });
    }
    const result = await db.query(
      `SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, addresses: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch addresses.' });
  }
});

// 2. Add New Address
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { fullName, phone, streetAddress, city, state, pincode, isDefault } = req.body;

    if (!fullName || !phone || !streetAddress || !city || !state || !pincode) {
      return res.status(400).json({ success: false, message: 'All address fields are required.' });
    }

    if (!req.user?.id) {
      return res.status(201).json({
        success: true,
        message: 'Guest address accepted.',
        address: { id: `addr_${Date.now()}`, full_name: fullName, phone, street_address: streetAddress, city, state, pincode }
      });
    }

    if (isDefault) {
      await db.query(`UPDATE addresses SET is_default = false WHERE user_id = $1`, [req.user.id]);
    }

    const result = await db.query(
      `INSERT INTO addresses (user_id, full_name, phone, street_address, city, state, pincode, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.user.id, fullName, phone, streetAddress, city, state, pincode, isDefault || false]
    );

    res.status(201).json({ success: true, message: 'Address saved successfully!', address: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save address.' });
  }
});

// 3. Delete Address
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM addresses WHERE id = $1 AND user_id = $2`, [id, req.user.id]);
    res.json({ success: true, message: 'Address deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete address.' });
  }
});

module.exports = router;
