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

exports.deleteOrder = async (req, res, next) => {
  try {
    const result = await orderService.delete(parseInt(req.params.id));
    return success(res, result, 'Order deleted successfully.');
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.updateNotes = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const order = await orderService.updateNotes(parseInt(req.params.id), notes || '');
    return success(res, { order }, 'Internal staff notes updated successfully.');
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;
    if (!paymentStatus) return error(res, 'Payment status is required.', 400);
    const order = await orderService.updatePaymentStatus(parseInt(req.params.id), paymentStatus, req.adminUser?.adminId);
    return success(res, { order }, `Payment status updated to ${paymentStatus}.`);
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.approveReturn = async (req, res, next) => {
  try {
    const order = await orderService.approveReturn(parseInt(req.params.id), req.adminUser?.adminId);
    return success(res, { order }, 'Return request approved & refund processed automatically.');
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.rejectReturn = async (req, res, next) => {
  try {
    const order = await orderService.rejectReturn(parseInt(req.params.id), req.adminUser?.adminId);
    return success(res, { order }, 'Return request rejected.');
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};
