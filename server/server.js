const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const addressRoutes = require('./routes/addressRoutes');
const cartRoutes = require('./routes/cartRoutes');
const cmsRoutes = require('./routes/cmsRoutes');
const recentlyViewedRoutes = require('./routes/recentlyViewedRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// ── Admin Routes ──────────────────────────────────────────
const adminAuthRoutes         = require('./routes/admin/adminAuthRoutes');
const adminDashboardRoutes    = require('./routes/admin/adminDashboardRoutes');
const adminProductRoutes      = require('./routes/admin/adminProductRoutes');
const adminMasterDataRoutes   = require('./routes/admin/adminMasterDataRoutes');
const adminCmsRoutes          = require('./routes/admin/adminCmsRoutes');
const adminOrderRoutes        = require('./routes/admin/adminOrderRoutes');
const adminCustomerRoutes     = require('./routes/admin/adminCustomerRoutes');
const adminCouponRoutes       = require('./routes/admin/adminCouponRoutes');
const adminReportRoutes       = require('./routes/admin/adminReportRoutes');
const adminSettingsRoutes     = require('./routes/admin/adminSettingsRoutes');
const adminNotificationRoutes = require('./routes/admin/adminNotificationRoutes');
const adminUploadRoutes       = require('./routes/admin/adminUploadRoutes');
const adminEmailLogsRoutes    = require('./routes/admin/adminEmailLogsRoutes');
const adminReviewRoutes       = require('./routes/admin/adminReviewRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// 1. Security HTTP Headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. Secure & Dynamic CORS Configuration (Supports all local & production origins)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// 3. Request Body Size Limits & Parsers
// Increased to 50mb to support base64-encoded images stored in Neon PostgreSQL
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 4. Rate Limiting for Auth Endpoints (100 requests per 15 mins)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

// Health Check Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '✨ Happy Sarees Backend API is Running! (Customer + Admin)',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    apis: {
      customer: '/api/*',
      admin:    '/api/admin/*',
    }
  });
});

// ── Customer API Routes (UNCHANGED) ────────────────────────
app.use('/api/auth',      authLimiter, authRoutes);
app.use('/api/products',  productRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/wishlist',  wishlistRoutes);
app.use('/api/reviews',   reviewRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/cart',      cartRoutes);
app.use('/api/cms',       cmsRoutes);
app.use('/api/recently-viewed', recentlyViewedRoutes);
app.use('/api/payment',   paymentRoutes);

// Public Store Settings Route (for Customer Website & Footer/Header)
app.get('/api/settings', async (req, res, next) => {
  try {
    const settingsService = require('./services/admin/settingsService');
    const settings = await settingsService.getAll();
    res.json({ success: true, settings });
  } catch (e) {
    next(e);
  }
});

// ── Admin API Routes (NEW — all under /api/admin/*) ─────────
// Admin auth has its own rate limiter
const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many admin login attempts. Please try again after 15 minutes.' }
});

app.use('/api/admin/auth',          adminAuthLimiter, adminAuthRoutes);
app.use('/api/admin/dashboard',     adminDashboardRoutes);
app.use('/api/admin/products',      adminProductRoutes);
app.use('/api/admin/master',        adminMasterDataRoutes);
app.use('/api/admin/master-data',   adminMasterDataRoutes);
app.use('/api/admin/cms',           adminCmsRoutes);
app.use('/api/admin/orders',        adminOrderRoutes);
app.use('/api/admin/customers',     adminCustomerRoutes);
app.use('/api/admin/coupons',       adminCouponRoutes);
app.use('/api/admin/reports',       adminReportRoutes);
app.use('/api/admin/settings',      adminSettingsRoutes);
app.use('/api/admin/notifications', adminNotificationRoutes);
app.use('/api/admin/upload',        adminUploadRoutes);
app.use('/api/admin/email-logs',    adminEmailLogsRoutes);
app.use('/api/admin/reviews',       adminReviewRoutes);

// Global Production Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `API Route '${req.originalUrl}' Not Found` });
});

// Start Server with EADDRINUSE Port Conflict Handler
const server = app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🌸 Happy Sarees Backend API Running on Port ${PORT}`);
  console.log(`🔗 Customer API: http://localhost:${PORT}/api/*`);
  console.log(`🔐 Admin API:    http://localhost:${PORT}/api/admin/*`);
  console.log(`🛡 Security: Helmet, Rate Limiter, and CORS Enabled`);
  console.log(`===================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ [EADDRINUSE] Port ${PORT} is already in use by another running Node process.`);
    console.error(`👉 Solution: Stop any existing running server instance or change PORT in server/.env.\n`);
    process.exit(1);
  } else {
    console.error('Server Listener Error:', err);
  }
});
