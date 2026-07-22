// controllers/admin/couponController.js
const couponService = require('../../services/admin/couponService');
const { success, error, paginated } = require('../../utils/response');

exports.getAll = async (req, res, next) => {
  try {
    const r = await couponService.getAll(req.query);
    return paginated(res, r.coupons, r.total, r.page, r.limit);
  } catch (e) { next(e); }
};

exports.getById = async (req, res, next) => {
  try { return success(res, { coupon: await couponService.getById(parseInt(req.params.id)) }); }
  catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const coupon = await couponService.create(req.body, req.adminUser.adminId);
    return success(res, { coupon }, 'Coupon created.', 201);
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const coupon = await couponService.update(parseInt(req.params.id), req.body);
    return success(res, { coupon }, 'Coupon updated.');
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.delete = async (req, res, next) => {
  try {
    await couponService.delete(parseInt(req.params.id));
    return success(res, {}, 'Coupon deleted.');
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.toggle = async (req, res, next) => {
  try {
    const coupon = await couponService.toggle(parseInt(req.params.id));
    return success(res, { coupon }, `Coupon ${coupon.is_active ? 'enabled' : 'disabled'}.`);
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};

exports.validate = async (req, res, next) => {
  try {
    const { code, orderAmount, userId } = req.body;
    if (!code || !orderAmount) return error(res, 'code and orderAmount are required.', 400);
    return success(res, await couponService.validate(code, orderAmount, userId));
  } catch (e) { next(e); }
};
