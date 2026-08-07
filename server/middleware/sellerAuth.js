// ============================================================
//  sellerAuth.js — JWT middleware for Seller routes
//  Uses JWT_SELLER_SECRET (separate from customer JWT_SECRET)
// ============================================================

const jwt = require('jsonwebtoken');
const db = require('../db');

const SELLER_SECRET = process.env.JWT_SELLER_SECRET
  || (process.env.JWT_SECRET
    ? process.env.JWT_SECRET + '_seller'
    : 'happysarees_seller_secret_2026');

/**
 * Middleware: Verify seller JWT access token and load status
 */
async function sellerAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Seller access denied. Authorization token missing.',
    });
  }

  try {
    const decoded = jwt.verify(token, SELLER_SECRET);
    if (!decoded.sellerId) {
      return res.status(401).json({
        success: false,
        message: 'Seller access denied. Invalid token payload.',
      });
    }

    // Fetch the latest status dynamically from DB
    const resSeller = await db.query(
      `SELECT id, business_name, store_name, owner_name, email, phone, status, rejection_reason 
       FROM sellers WHERE id = $1`,
      [decoded.sellerId]
    );

    if (resSeller.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Seller account not found.',
      });
    }

    req.seller = resSeller.rows[0];
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Token is invalid or expired.',
    });
  }
}

/**
 * Guard: Require approved status for operational dashboard actions
 */
function requireApprovedSeller(req, res, next) {
  if (!req.seller) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (req.seller.status !== 'approved') {
    return res.status(403).json({
      success: false,
      status: req.seller.status,
      rejection_reason: req.seller.rejection_reason,
      message: `Access denied. Seller account is currently ${req.seller.status}.`,
    });
  }

  return next();
}

/**
 * Generate a signed seller access token
 */
function generateAccessToken(seller) {
  return jwt.sign(
    {
      sellerId: seller.id,
      email:    seller.email,
      status:   seller.status,
    },
    SELLER_SECRET,
    { expiresIn: '7d' } // Long-lived seller sessions
  );
}

module.exports = {
  sellerAuth,
  requireApprovedSeller,
  generateAccessToken,
};
