// ============================================================
//  adminAuth.js — JWT middleware for Admin routes
//  Uses JWT_ADMIN_SECRET (separate from customer JWT_SECRET)
// ============================================================

const jwt = require('jsonwebtoken');

const ADMIN_SECRET = process.env.JWT_ADMIN_SECRET
  || (process.env.JWT_SECRET
    ? process.env.JWT_SECRET + '_admin'
    : 'happysarees_admin_secret_2026');

/**
 * Middleware: Verify admin JWT access token
 * Attaches decoded payload to req.adminUser
 */
function adminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Admin access denied. Authorization token missing.',
    });
  }

  try {
    const decoded = jwt.verify(token, ADMIN_SECRET);

    if (!decoded.adminId) {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin token payload.',
      });
    }

    req.adminUser = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Admin session expired. Please login again.',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid or malformed admin authorization token.',
    });
  }
}

/**
 * Generate a signed admin access token (15 min)
 */
function generateAccessToken(admin) {
  return jwt.sign(
    {
      adminId: admin.id,
      email:   admin.email,
      role:    admin.role_name,
      roleId:  admin.role_id,
    },
    ADMIN_SECRET,
    { expiresIn: '15m' }
  );
}

/**
 * Generate a signed admin refresh token (7 days)
 */
function generateRefreshToken(adminId) {
  return jwt.sign(
    { adminId, type: 'refresh' },
    ADMIN_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verify a refresh token (no express context)
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, ADMIN_SECRET);
}

module.exports = { adminAuth, generateAccessToken, generateRefreshToken, verifyRefreshToken };
