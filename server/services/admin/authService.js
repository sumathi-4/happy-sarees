// ============================================================
//  authService.js — Admin Authentication Business Logic
// ============================================================

const bcrypt  = require('bcryptjs');
const crypto  = require('crypto');
const db      = require('../../db');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../../middleware/adminAuth');

class AuthService {

  /** Find admin with role info */
  async _findAdminByEmail(email) {
    const res = await db.query(
      `SELECT au.id, au.name, au.email, au.phone, au.password_hash, au.role_id,
              au.status, au.last_login, au.created_at, au.updated_at,
              au.avatar_url, ar.name as role_name
       FROM admin_users au
       LEFT JOIN admin_roles ar ON au.role_id = ar.id
       WHERE au.email = $1`,
      [email.toLowerCase()]
    );
    return res.rows[0] || null;
  }

  async _findAdminById(id) {
    const res = await db.query(
      `SELECT au.id, au.name, au.email, au.phone, au.role_id,
              au.status, au.last_login, au.created_at, au.updated_at,
              au.avatar_url, ar.name as role_name
       FROM admin_users au
       LEFT JOIN admin_roles ar ON au.role_id = ar.id
       WHERE au.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  // ── Login ──────────────────────────────────────────────────
  async login(email, password) {
    const admin = await this._findAdminByEmail(email);
    if (!admin) {
      throw { status: 401, message: 'Invalid email or password.' };
    }

    if (admin.status !== 'active') {
      throw { status: 403, message: 'This admin account has been suspended or deactivated.' };
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      throw { status: 401, message: 'Invalid email or password.' };
    }

    const accessToken  = generateAccessToken(admin);
    const refreshToken = generateRefreshToken(admin.id);

    // Store refresh token (expires 7 days)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.query(
      `INSERT INTO admin_refresh_tokens (admin_user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [admin.id, refreshToken, expiresAt]
    );

    // Update last_login
    await db.query(
      `UPDATE admin_users SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [admin.id]
    );

    return {
      accessToken,
      refreshToken,
      admin: {
        id:        admin.id,
        name:      admin.name,
        email:     admin.email,
        phone:     admin.phone,
        role:      admin.role_name,
        roleId:    admin.role_id,
        status:    admin.status,
        lastLogin: admin.last_login,
        avatar:    admin.avatar_url || null,
      },
    };
  }

  // ── Logout ─────────────────────────────────────────────────
  async logout(refreshToken) {
    if (refreshToken) {
      await db.query(
        `DELETE FROM admin_refresh_tokens WHERE token = $1`,
        [refreshToken]
      );
    }
    return true;
  }

  // ── Refresh Access Token ───────────────────────────────────
  async refreshAccessToken(refreshToken) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw { status: 401, message: 'Invalid or expired refresh token.' };
    }

    const stored = await db.query(
      `SELECT * FROM admin_refresh_tokens WHERE token = $1 AND expires_at > NOW()`,
      [refreshToken]
    );
    if (stored.rows.length === 0) {
      throw { status: 401, message: 'Refresh token not found or expired. Please login again.' };
    }

    const admin = await this._findAdminById(payload.adminId);
    if (!admin || admin.status !== 'active') {
      throw { status: 403, message: 'Admin account is not active.' };
    }

    const newAccessToken = generateAccessToken(admin);
    return { accessToken: newAccessToken };
  }

  // ── Get Current Admin ──────────────────────────────────────
  async getMe(adminId) {
    const admin = await this._findAdminById(adminId);
    if (!admin) throw { status: 404, message: 'Admin user not found.' };

    // Load permissions
    const permsRes = await db.query(
      `SELECT module, can_view, can_create, can_edit, can_delete, can_manage
       FROM admin_permissions WHERE role_id = $1`,
      [admin.role_id]
    );
    const permissions = {};
    permsRes.rows.forEach(p => {
      permissions[p.module] = {
        view: p.can_view, create: p.can_create,
        edit: p.can_edit, delete: p.can_delete, manage: p.can_manage,
      };
    });

    return {
      id:          admin.id,
      name:        admin.name,
      email:       admin.email,
      phone:       admin.phone,
      role:        admin.role_name,
      roleId:      admin.role_id,
      status:      admin.status,
      lastLogin:   admin.last_login,
      avatar:      admin.avatar_url || null,
      permissions,
    };
  }

  // ── Forgot Password ────────────────────────────────────────
  async forgotPassword(email) {
    const admin = await this._findAdminByEmail(email);
    if (!admin) {
      // Don't reveal whether email exists
      return { message: 'If this email is registered, a reset token has been generated.' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.query(
      `INSERT INTO admin_password_resets (admin_user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [admin.id, token, expiresAt]
    );

    // In production: send email. In dev: return token.
    return {
      message: 'Password reset token generated.',
      ...(process.env.NODE_ENV !== 'production' ? { resetToken: token } : {}),
    };
  }

  // ── Reset Password ─────────────────────────────────────────
  async resetPassword(token, newPassword) {
    const res = await db.query(
      `SELECT * FROM admin_password_resets
       WHERE token = $1 AND expires_at > NOW() AND used = false`,
      [token]
    );
    if (res.rows.length === 0) {
      throw { status: 400, message: 'Invalid or expired password reset token.' };
    }

    const record   = res.rows[0];
    const hash     = await bcrypt.hash(newPassword, 12);

    await db.query(
      `UPDATE admin_users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
      [hash, record.admin_user_id]
    );
    await db.query(
      `UPDATE admin_password_resets SET used = true WHERE id = $1`,
      [record.id]
    );
    // Invalidate all refresh tokens
    await db.query(`DELETE FROM admin_refresh_tokens WHERE admin_user_id = $1`, [record.admin_user_id]);

    return { message: 'Password has been reset successfully. Please login with your new password.' };
  }

  // ── Change Password ────────────────────────────────────────
  async changePassword(adminId, currentPassword, newPassword) {
    const admin = await this._findAdminById(adminId);
    if (!admin) throw { status: 404, message: 'Admin not found.' };

    const isMatch = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isMatch) throw { status: 400, message: 'Current password is incorrect.' };

    const hash = await bcrypt.hash(newPassword, 12);
    await db.query(
      `UPDATE admin_users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
      [hash, adminId]
    );
    return { message: 'Password changed successfully.' };
  }

  async updateProfile(adminId, data) {
    const res = await db.query(
      `UPDATE admin_users SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        updated_at = NOW()
       WHERE id = $4 RETURNING id, name, email, phone, status, avatar_url`,
      [data.name, data.email ? data.email.toLowerCase() : null, data.phone, adminId]
    );
    if (res.rows.length === 0) throw { status: 404, message: 'Admin user not found.' };
    return res.rows[0];
  }

  async updateAvatar(adminId, avatarUrl) {
    const res = await db.query(
      `UPDATE admin_users SET avatar_url = $1, updated_at = NOW()
       WHERE id = $2 RETURNING id, name, email, phone, status, avatar_url`,
      [avatarUrl, adminId]
    );
    if (res.rows.length === 0) throw { status: 404, message: 'Admin user not found.' };
    return res.rows[0];
  }
}

module.exports = new AuthService();
