const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// 1. User Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide full name, email, and password.' });
    }

    // Check if user exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await db.query(
      `INSERT INTO users (full_name, email, password_hash, phone) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, phone, role, created_at`,
      [name, email.toLowerCase(), passwordHash, phone || '']
    );

    const user = result.rows[0];

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'happysarees_secret_key_2026',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// 2. User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    // Find user
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    // Check if user is blocked by admin
    if (user.is_blocked) {
      return res.status(403).json({
        success: false,
        message: user.block_reason || 'Your account has been suspended by administration. Please contact support.'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'happysarees_secret_key_2026',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Welcome back to Happy Sarees!',
      token,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// 3. Google Sign-In / OAuth Endpoint
router.post('/google', async (req, res) => {
  try {
    const { email, name, picture } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google email address is required.' });
    }

    const lowerEmail = email.toLowerCase();

    // Check if user already exists
    let result = await db.query('SELECT * FROM users WHERE email = $1', [lowerEmail]);
    let user;

    if (result.rows.length > 0) {
      user = result.rows[0];

      // Check if blocked by admin
      if (user.is_blocked) {
        return res.status(403).json({
          success: false,
          message: user.block_reason || 'Your account has been suspended by administration. Please contact support.'
        });
      }
    } else {
      // Create new user from Google profile
      const passwordHash = await bcrypt.hash('GOOGLE_AUTH_' + Date.now(), 10);
      const userName = name || lowerEmail.split('@')[0];

      const insertRes = await db.query(
        `INSERT INTO users (full_name, email, password_hash, phone, role) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, full_name, email, phone, role, created_at`,
        [userName, lowerEmail, passwordHash, '', 'customer']
      );

      user = insertRes.rows[0];
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'happysarees_secret_key_2026',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Signed in with Google successfully!',
      token,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        avatar: picture || '/src/assets/hero_saree_model.png'
      }
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ success: false, message: 'Server error during Google authentication.' });
  }
});

// 4. Get Current User Profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, full_name as name, email, phone, role, is_blocked, block_reason, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = result.rows[0];
    if (user.is_blocked) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended.' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching profile.' });
  }
});

module.exports = router;
