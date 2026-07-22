// controllers/admin/settingsController.js
const settingsService = require('../../services/admin/settingsService');
const { success, error } = require('../../utils/response');

exports.getAll = async (req, res, next) => {
  try { return success(res, { settings: await settingsService.getAll() }); } catch (e) { next(e); }
};
exports.updateStore = async (req, res, next) => {
  try { return success(res, { settings: await settingsService.updateStore(req.body, req.adminUser.adminId) }, 'Store settings updated.'); } catch (e) { next(e); }
};
exports.updateSmtp = async (req, res, next) => {
  try { return success(res, {}, 'SMTP settings updated.'); } catch (e) { next(e); }
};
exports.updatePayment = async (req, res, next) => {
  try { await settingsService.updatePayment(req.body, req.adminUser.adminId); return success(res, {}, 'Payment settings updated.'); } catch (e) { next(e); }
};
exports.updateShipping = async (req, res, next) => {
  try { await settingsService.updateShipping(req.body, req.adminUser.adminId); return success(res, {}, 'Shipping settings updated.'); } catch (e) { next(e); }
};
exports.updateTax = async (req, res, next) => {
  try { await settingsService.updateTax(req.body, req.adminUser.adminId); return success(res, {}, 'Tax settings updated.'); } catch (e) { next(e); }
};
exports.updateSeo = async (req, res, next) => {
  try { await settingsService.updateSeo(req.body, req.adminUser.adminId); return success(res, {}, 'SEO settings updated.'); } catch (e) { next(e); }
};
exports.uploadLogo = async (req, res, next) => {
  try {
    const { imageData } = req.body;
    if (!imageData) return error(res, 'imageData is required.', 400);
    await settingsService.uploadLogo(imageData, req.adminUser.adminId);
    return success(res, {}, 'Logo uploaded.');
  } catch (e) { next(e); }
};
exports.uploadFavicon = async (req, res, next) => {
  try {
    const { imageData } = req.body;
    if (!imageData) return error(res, 'imageData is required.', 400);
    await settingsService.uploadFavicon(imageData, req.adminUser.adminId);
    return success(res, {}, 'Favicon uploaded.');
  } catch (e) { next(e); }
};

// Admin User Management
exports.getAdminUsers = async (req, res, next) => {
  try { return success(res, { admins: await settingsService.getAdminUsers() }); } catch (e) { next(e); }
};
exports.createAdminUser = async (req, res, next) => {
  try {
    const admin = await settingsService.createAdminUser(req.body, req.adminUser.adminId);
    return success(res, { admin }, 'Admin user created.', 201);
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};
exports.updateAdminUser = async (req, res, next) => {
  try {
    const admin = await settingsService.updateAdminUser(parseInt(req.params.id), req.body);
    return success(res, { admin }, 'Admin user updated.');
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};
exports.deleteAdminUser = async (req, res, next) => {
  try {
    await settingsService.deleteAdminUser(parseInt(req.params.id), req.adminUser.adminId);
    return success(res, {}, 'Admin user deleted.');
  } catch (e) { return e.status ? error(res, e.message, e.status) : next(e); }
};
exports.getRoles = async (req, res, next) => {
  try { return success(res, { roles: await settingsService.getRoles() }); } catch (e) { next(e); }
};
exports.getPermissions = async (req, res, next) => {
  try { return success(res, { permissions: await settingsService.getPermissionsForRole(req.params.roleId) }); } catch (e) { next(e); }
};
exports.updatePermissions = async (req, res, next) => {
  try {
    const perms = await settingsService.updatePermissions(req.params.roleId, req.body.permissions);
    return success(res, { permissions: perms }, 'Permissions updated.');
  } catch (e) { next(e); }
};
