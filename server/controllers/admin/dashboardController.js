// controllers/admin/dashboardController.js
const dashboardService = require('../../services/admin/dashboardService');
const { success } = require('../../utils/response');

exports.getStats = async (req, res, next) => {
  try { return success(res, { stats: await dashboardService.getStats() }); } catch (e) { next(e); }
};
exports.getSalesGraph = async (req, res, next) => {
  try { return success(res, { data: await dashboardService.getSalesGraph() }); } catch (e) { next(e); }
};
exports.getOrderStatusChart = async (req, res, next) => {
  try { return success(res, { data: await dashboardService.getOrderStatusChart() }); } catch (e) { next(e); }
};
exports.getRecentOrders = async (req, res, next) => {
  try { return success(res, { orders: await dashboardService.getRecentOrders() }); } catch (e) { next(e); }
};
exports.getLowStock = async (req, res, next) => {
  try { return success(res, { products: await dashboardService.getLowStockProducts() }); } catch (e) { next(e); }
};
exports.getLatestCustomers = async (req, res, next) => {
  try { return success(res, { customers: await dashboardService.getLatestCustomers() }); } catch (e) { next(e); }
};
exports.getActivities = async (req, res, next) => {
  try { return success(res, { activities: await dashboardService.getRecentActivities() }); } catch (e) { next(e); }
};
