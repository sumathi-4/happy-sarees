const productApprovalService = require('../../services/admin/productApprovalService');

async function getProductApprovals(req, res, next) {
  try {
    const filters = {
      status: req.query.status
    };
    const products = await productApprovalService.getProductApprovals(filters);
    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
}

async function approve(req, res, next) {
  try {
    const productId = req.params.id;
    await productApprovalService.approveProduct(productId);
    res.json({ success: true, message: 'Product approved successfully.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function reject(req, res, next) {
  try {
    const productId = req.params.id;
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
    }

    await productApprovalService.rejectProduct(productId, reason);
    res.json({ success: true, message: 'Product application rejected.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

module.exports = {
  getProductApprovals,
  approve,
  reject
};
