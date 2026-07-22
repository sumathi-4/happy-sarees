// controllers/admin/orderController.js
const orderService = require('../../services/admin/orderService');
const { success, error, paginated } = require('../../utils/response');

exports.getAll = async (req, res, next) => {
  try {
    const result = await orderService.getAll(req.query);
    return paginated(res, result.orders, result.total, result.page, result.limit);
  } catch (e) { next(e); }
};

exports.getById = async (req, res, next) => {
  try { return success(res, { order: await orderService.getById(parseInt(req.params.id)) }); }
  catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    if (!status) return error(res, 'Status is required.', 400);
    const order = await orderService.updateStatus(parseInt(req.params.id), status, note, req.adminUser.adminId);
    return success(res, { order }, `Order status updated to ${status}.`);
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.updateTracking = async (req, res, next) => {
  try {
    const { trackingNumber, carrier } = req.body;
    const order = await orderService.updateTracking(parseInt(req.params.id), trackingNumber, carrier);
    return success(res, { order }, 'Tracking updated.');
  } catch (e) { next(e); }
};

exports.processRefund = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount) return error(res, 'Refund amount is required.', 400);
    const order = await orderService.processRefund(parseInt(req.params.id), amount, req.adminUser.adminId);
    return success(res, { order }, 'Refund processed.');
  } catch (e) { next(e); }
};

exports.cancel = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await orderService.cancel(parseInt(req.params.id), reason, req.adminUser.adminId);
    return success(res, { order }, 'Order cancelled.');
  } catch (e) { next(e); }
};

exports.getInvoice = async (req, res, next) => {
  try { return success(res, { invoice: await orderService.getInvoiceData(parseInt(req.params.id)) }); }
  catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};
