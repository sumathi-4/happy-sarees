const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. Authorization token missing.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'happysarees_secret_key_2026');
    req.user = verified;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired authorization token.' });
  }
}

module.exports = authenticateToken;
