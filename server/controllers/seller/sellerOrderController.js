const sellerOrderService = require('../../services/seller/sellerOrderService');

async function getOrders(req, res, next) {
  try {
    const filters = {
      status: req.query.status,
      search: req.query.search
    };
    const orders = await sellerOrderService.getSellerOrders(req.seller.id, filters);
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
}

async function getOrderById(req, res, next) {
  try {
    const order = await sellerOrderService.getSellerOrderDetails(req.seller.id, req.params.id);
    res.json({ success: true, order });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status, trackingNumber } = req.body;
    await sellerOrderService.updateOrderItemStatus(req.seller.id, req.params.itemId, status, trackingNumber);
    res.json({ success: true, message: 'Order item status updated successfully.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function updatePaymentStatus(req, res, next) {
  try {
    const { paymentStatus } = req.body;
    await sellerOrderService.updateOrderItemPaymentStatus(req.seller.id, req.params.itemId, paymentStatus);
    res.json({ success: true, message: 'Order item payment status updated successfully.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

module.exports = {
  getOrders,
  getOrderById,
  updateStatus,
  updatePaymentStatus
};
