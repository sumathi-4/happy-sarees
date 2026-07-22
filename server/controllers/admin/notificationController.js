// controllers/admin/notificationController.js
const notificationService = require('../../services/admin/notificationService');
const { success } = require('../../utils/response');

exports.getAll = async (req, res, next) => {
  try { return success(res, await notificationService.getAll(req.query)); } catch (e) { next(e); }
};
exports.markRead = async (req, res, next) => {
  try { return success(res, { notification: await notificationService.markRead(parseInt(req.params.id)) }, 'Marked as read.'); } catch (e) { next(e); }
};
exports.markAllRead = async (req, res, next) => {
  try { return success(res, {}, 'All notifications marked as read.'); } catch (e) { next(e); }
};
exports.delete = async (req, res, next) => {
  try { await notificationService.delete(parseInt(req.params.id)); return success(res, {}, 'Notification deleted.'); } catch (e) { next(e); }
};
exports.checkLowStock = async (req, res, next) => {
  try { return success(res, await notificationService.checkLowStockAlerts(), 'Low stock check complete.'); } catch (e) { next(e); }
};
