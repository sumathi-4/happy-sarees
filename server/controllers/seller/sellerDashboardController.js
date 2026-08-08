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

async function getPublicStats(req, res, next) {
  try {
    const sellersRes = await db.query(
      `SELECT COUNT(*)::int as count FROM sellers WHERE status = 'approved'`
    );
    const productsRes = await db.query(
      `SELECT COUNT(*)::int as count FROM products WHERE is_active = true`
    );
    const payoutsRes = await db.query(
      `SELECT COALESCE(SUM(amount), 0)::numeric as total FROM seller_payouts WHERE status = 'paid'`
    );

    const activeSellersCount = sellersRes.rows[0]?.count || 0;
    const sareesListedCount = productsRes.rows[0]?.count || 0;
    const payoutsDisbursedTotal = Number(payoutsRes.rows[0]?.total || 0);

    res.json({
      success: true,
      stats: {
        activeSellers: activeSellersCount > 0 ? activeSellersCount : 150,
        sareesListed: sareesListedCount > 0 ? sareesListedCount : 5000,
        payoutsDisbursed: payoutsDisbursedTotal > 0 ? payoutsDisbursedTotal : 2500000,
        rawSellersCount: activeSellersCount,
        rawProductsCount: sareesListedCount,
        rawPayoutsTotal: payoutsDisbursedTotal
      }
    });
  } catch (err) {
    res.json({
      success: true,
      stats: {
        activeSellers: 150,
        sareesListed: 5000,
        payoutsDisbursed: 2500000,
        isFallback: true
      }
    });
  }
}

module.exports = {
  getSummary,
  getSalesAnalytics,
  getPayoutsAnalytics,
  getPublicStats
};
