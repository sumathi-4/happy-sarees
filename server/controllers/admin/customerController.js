// controllers/admin/customerController.js
const customerService = require('../../services/admin/customerService');
const { success, error, paginated } = require('../../utils/response');

exports.getAll = async (req, res, next) => {
  try {
    const r = await customerService.getAll(req.query);
    return paginated(res, r.customers, r.total, r.page, r.limit);
  } catch (e) { next(e); }
};

exports.getById = async (req, res, next) => {
  try { return success(res, { customer: await customerService.getById(parseInt(req.params.id)) }); }
  catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.setStatus = async (req, res, next) => {
  try {
    const { action, reason } = req.body;
    if (!action) return error(res, 'Action is required (block, unblock, delete).', 400);
    const result = await customerService.setStatus(parseInt(req.params.id), action, reason);
    return success(res, { customer: result }, `Customer ${action}ed.`);
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.getAnalytics = async (req, res, next) => {
  try { return success(res, await customerService.getAnalytics(parseInt(req.params.id))); }
  catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};
