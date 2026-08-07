const payoutService = require('../../services/seller/payoutService');

async function getAllPayouts(req, res, next) {
  try {
    const { status = 'all' } = req.query;
    const payouts = await payoutService.getAllPayouts(status);
    res.json({ success: true, payouts });
  } catch (err) {
    next(err);
  }
}

async function generatePayout(req, res, next) {
  try {
    const { sellerId, periodStart, periodEnd } = req.body;
    const result = await payoutService.generatePayout(parseInt(sellerId), periodStart, periodEnd);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function markPayoutPaid(req, res, next) {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;
    await payoutService.markPayoutPaid(parseInt(id), adminNote);
    res.json({ success: true, message: 'Payout marked as paid.' });
  } catch (err) {
    next(err);
  }
}

async function createAdjustment(req, res, next) {
  try {
    const { sellerId, amount, reason } = req.body;
    const id = await payoutService.createAdjustment(parseInt(sellerId), amount, reason);
    res.json({ success: true, adjustmentId: id });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllPayouts, generatePayout, markPayoutPaid, createAdjustment };
