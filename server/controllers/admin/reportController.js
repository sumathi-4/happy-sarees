// controllers/admin/reportController.js
const reportService = require('../../services/admin/reportService');
const { success } = require('../../utils/response');

exports.getRevenue = async (req, res, next) => {
  try { return success(res, await reportService.getRevenue(req.query)); } catch (e) { next(e); }
};
exports.getSales = async (req, res, next) => {
  try { return success(res, await reportService.getSalesReport(req.query)); } catch (e) { next(e); }
};
exports.getCustomers = async (req, res, next) => {
  try { return success(res, await reportService.getCustomerReport(req.query)); } catch (e) { next(e); }
};
exports.getOrders = async (req, res, next) => {
  try { return success(res, await reportService.getOrderReport(req.query)); } catch (e) { next(e); }
};
exports.getCoupons = async (req, res, next) => {
  try { return success(res, await reportService.getCouponReport(req.query)); } catch (e) { next(e); }
};
exports.exportReport = async (req, res, next) => {
  try {
    const { type } = req.params;
    const data = await reportService.exportCsv(type, req.query);

    // Convert to CSV format
    if (req.query.format === 'csv') {
      const rows = data.data || data.topProducts || data.coupons || data.newCustomers || [];
      if (rows.length === 0) return res.json({ success: true, data: [] });

      const headers = Object.keys(rows[0]).join(',');
      const csvRows = rows.map(row => Object.values(row).map(v => `"${v}"`).join(','));
      const csv = [headers, ...csvRows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-report.csv"`);
      return res.send(csv);
    }

    return success(res, data);
  } catch (e) { next(e); }
};
