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
        avatar: picture || 'https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg'
      }
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ success: false, message: 'Server error during Google authentication.' });
  }
});

const { uploadToCloudinary } = require('../services/cloudinaryService');

// 4. Get Current User Profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, full_name as name, email, phone, gender, dob, role, avatar, is_blocked, block_reason, created_at FROM users WHERE id = $1',
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

// 5. Update Profile / Upload Avatar to Cloudinary / Remove Avatar
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, gender, dob, avatar, removeAvatar } = req.body;
    let finalAvatarUrl = null;

    if (removeAvatar) {
      finalAvatarUrl = null;
    } else if (avatar) {
      if (avatar.startsWith('data:')) {
        // Upload Base64 image to Cloudinary and store ONLY the CDN URL in Neon DB
        finalAvatarUrl = await uploadToCloudinary(avatar, 'happy_sarees/avatars');
      } else {
        finalAvatarUrl = avatar;
      }
    } else {
      // Keep existing avatar if not explicitly removing or updating
      const existingUser = await db.query('SELECT avatar FROM users WHERE id = $1', [req.user.id]);
      finalAvatarUrl = existingUser.rows[0]?.avatar || null;
    }

    const result = await db.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name), 
           phone = COALESCE($2, phone), 
           gender = COALESCE($3, gender), 
           dob = COALESCE($4, dob), 
           avatar = $5, 
           updated_at = NOW() 
       WHERE id = $6 RETURNING id, full_name as name, email, phone, gender, dob, role, avatar`,
      [name || null, phone || null, gender || null, dob || null, finalAvatarUrl, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const updatedUser = result.rows[0];
    res.json({
      success: true,
      message: removeAvatar ? 'Profile image removed successfully.' : 'Profile updated successfully!',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
});

// 6. Change Password (Customer & Admin)
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const userRes = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, req.user.id]);

    res.json({ success: true, message: 'Password updated successfully! Please use your new password on next login.' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
});

module.exports = router;
