const payoutService = require('../../services/seller/payoutService');

async function getMyPayouts(req, res, next) {
  try {
    const payouts = await payoutService.getSellerPayouts(req.seller.id);
    res.json({ success: true, payouts });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyPayouts };
