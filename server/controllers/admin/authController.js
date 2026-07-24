// controllers/admin/authController.js
const authService = require('../../services/admin/authService');
const { success, error } = require('../../utils/response');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return error(res, 'Email and password are required.', 400);
    const result = await authService.login(email, password);
    return success(res, result, 'Login successful.');
  } catch (err) { return err.status ? error(res, err.message, err.status) : next(err); }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    return success(res, {}, 'Logged out successfully.');
  } catch (err) { next(err); }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return error(res, 'Refresh token required.', 400);
    const result = await authService.refreshAccessToken(refreshToken);
    return success(res, result, 'Token refreshed.');
  } catch (err) { return err.status ? error(res, err.message, err.status) : next(err); }
};

exports.getMe = async (req, res, next) => {
  try {
    const admin = await authService.getMe(req.adminUser.adminId);
    return success(res, { admin }, 'Admin profile fetched.');
  } catch (err) { return err.status ? error(res, err.message, err.status) : next(err); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return error(res, 'Email is required.', 400);
    const result = await authService.forgotPassword(email);
    return success(res, result, result.message);
  } catch (err) { next(err); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return error(res, 'Token and new password are required.', 400);
    if (newPassword.length < 6) return error(res, 'Password must be at least 6 characters.', 400);
    const result = await authService.resetPassword(token, newPassword);
    return success(res, {}, result.message);
  } catch (err) { return err.status ? error(res, err.message, err.status) : next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return error(res, 'Current and new passwords are required.', 400);
    if (newPassword.length < 6) return error(res, 'New password must be at least 6 characters.', 400);
    const result = await authService.changePassword(req.adminUser.adminId, currentPassword, newPassword);
    return success(res, {}, result.message);
  } catch (err) { return err.status ? error(res, err.message, err.status) : next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updated = await authService.updateProfile(req.adminUser.adminId, req.body);
    return success(res, { admin: updated }, 'Profile updated successfully.');
  } catch (err) { return err.status ? error(res, err.message, err.status) : next(err); }
};
