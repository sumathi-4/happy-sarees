const sellerDashboardService = require('../../services/seller/sellerDashboardService');
const db = require('../../db');

async function getSummary(req, res, next) {
  try {
    const summary = await sellerDashboardService.getSellerDashboardSummary(req.seller.id);
    res.json({ success: true, summary });
  } catch (err) {
    next(err);
  }
}

async function getSalesAnalytics(req, res, next) {
  try {
    const summary = await sellerDashboardService.getSellerDashboardSummary(req.seller.id);
    res.json({ 
      success: true, 
      trend: summary.trend, 
      bestProduct: summary.bestProduct 
    });
  } catch (err) {
    next(err);
  }
}

async function getPayoutsAnalytics(req, res, next) {
  try {
    const payoutsRes = await db.query(
      `SELECT id, amount, status, period_start as "periodStart", period_end as "periodEnd", paid_at as "paidAt", created_at as "createdAt"
       FROM seller_payouts 
       WHERE seller_id = $1 
       ORDER BY created_at DESC`,
      [req.seller.id]
    );
    res.json({ success: true, payouts: payoutsRes.rows });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSummary,
  getSalesAnalytics,
  getPayoutsAnalytics
};
