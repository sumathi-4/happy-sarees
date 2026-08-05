// ============================================================
//  server/routes/sareeCrownRoutes.js
//  Customer-facing Saree Crown API routes
// ============================================================
const express = require('express');
const router  = express.Router();
const service = require('../services/sareeCrownPublicService');
const authenticateToken = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// ── GET /api/saree-crown ────────────────────────────────────
// Public — returns campaign status + products (no reward data unless user voted)
router.get('/', async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let userId = null;

    if (token) {
      try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'happysarees_secret_key_2026');
        userId = verified.id || verified.userId;
      } catch (err) {
        // Ignore token errors, treat as anonymous
      }
    }

    const data = await service.getCampaign(userId);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/saree-crown/my-vote ────────────────────────────
// Authenticated — returns this user's existing vote (if any)
router.get('/my-vote', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User identity not found in token.' });
    }
    const result = await service.getMyVote(userId);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/saree-crown/vote ──────────────────────────────
// Authenticated — casts a vote for a product
router.post('/vote', authenticateToken, async (req, res, next) => {
  try {
    const userId    = req.user.id || req.user.userId;
    const productId = parseInt(req.body.productId);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User identity not found in token.' });
    }
    if (!productId || isNaN(productId)) {
      return res.status(400).json({ success: false, message: 'A valid productId is required.' });
    }

    const result = await service.castVote(userId, productId);
    res.status(201).json({ success: true, message: 'Your vote has been cast!', ...result });
  } catch (err) {
    // Handle structured service errors
    if (err.status) {
      return res.status(err.status).json({ success: false, message: err.message });
    }
    // Handle PostgreSQL unique constraint violation (race condition fallback)
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'You have already voted in this campaign.' });
    }
    next(err);
  }
});

module.exports = router;
