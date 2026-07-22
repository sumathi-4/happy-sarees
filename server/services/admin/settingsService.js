// ============================================================
//  settingsService.js — Store Settings Management
// ============================================================

const db = require('../../db');

class SettingsService {

  async getAll() {
    const res = await db.query(`SELECT setting_key, setting_value, category, updated_at FROM store_settings ORDER BY category, setting_key`);
    const result = {};
    res.rows.forEach(r => {
      result[r.setting_key] = r.setting_value;
    });
    return result;
  }

  async getByCategory(category) {
    const res = await db.query(
      `SELECT setting_key, setting_value FROM store_settings WHERE category = $1`,
      [category]
    );
    const result = {};
    res.rows.forEach(r => { result[r.setting_key] = r.setting_value; });
    return result;
  }

  async updateSetting(key, value, adminUserId, category = 'general') {
    const res = await db.query(
      `INSERT INTO store_settings (setting_key, setting_value, category, updated_at, updated_by)
       VALUES ($1, $2, $3, NOW(), $4)
       ON CONFLICT (setting_key) DO UPDATE
         SET setting_value = $2, updated_at = NOW(), updated_by = $4
       RETURNING *`,
      [key, JSON.stringify(value), category, adminUserId]
    );
    return res.rows[0];
  }

  async updateStore(data, adminUserId) {
    return this.updateSetting('store_general', data, adminUserId, 'general');
  }

  async updateSmtp(data, adminUserId) {
    return this.updateSetting('store_smtp', data, adminUserId, 'smtp');
  }

  async updatePayment(data, adminUserId) {
    return this.updateSetting('store_payment', data, adminUserId, 'payment');
  }

  async updateShipping(data, adminUserId) {
    return this.updateSetting('store_shipping', data, adminUserId, 'shipping');
  }

  async updateTax(data, adminUserId) {
    return this.updateSetting('store_tax', data, adminUserId, 'tax');
  }

  async updateSeo(data, adminUserId) {
    return this.updateSetting('store_seo', data, adminUserId, 'seo');
  }

  async uploadLogo(imageData, adminUserId) {
    const existing = await db.query(`SELECT setting_value FROM store_settings WHERE setting_key = 'store_general'`);
    const current = existing.rows[0]?.setting_value || {};
    current.logoData = imageData;
    return this.updateSetting('store_general', current, adminUserId, 'general');
  }

  async uploadFavicon(imageData, adminUserId) {
    const existing = await db.query(`SELECT setting_value FROM store_settings WHERE setting_key = 'store_general'`);
    const current = existing.rows[0]?.setting_value || {};
    current.faviconData = imageData;
    return this.updateSetting('store_general', current, adminUserId, 'general');
  }

  // Admin User Management
  async getAdminUsers() {
    const res = await db.query(
      `SELECT au.id, au.name, au.email, au.phone, au.status, au.last_login, au.created_at,
              ar.name as role_name, ar.id as role_id
       FROM admin_users au
       LEFT JOIN admin_roles ar ON au.role_id = ar.id
       ORDER BY au.created_at DESC`
    );
    return res.rows;
  }

  async createAdminUser(data, adminUserId) {
    const bcrypt = require('bcryptjs');
    if (!data.name || !data.email || !data.password) {
      throw { status: 400, message: 'name, email, and password are required.' };
    }

    const hash = await bcrypt.hash(data.password, 12);
    const res = await db.query(
      `INSERT INTO admin_users (name, email, password_hash, phone, role_id, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, phone, status, created_at`,
      [data.name, data.email.toLowerCase(), hash, data.phone || null, data.roleId, data.status || 'active']
    );
    return res.rows[0];
  }

  async updateAdminUser(id, data) {
    const res = await db.query(
      `UPDATE admin_users SET
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        role_id = COALESCE($3, role_id),
        status = COALESCE($4, status),
        updated_at = NOW()
       WHERE id = $5 RETURNING id, name, email, phone, status`,
      [data.name, data.phone, data.roleId, data.status, id]
    );
    if (res.rows.length === 0) throw { status: 404, message: 'Admin user not found.' };
    return res.rows[0];
  }

  async deleteAdminUser(id, requestingAdminId) {
    if (id == requestingAdminId) throw { status: 400, message: 'Cannot delete your own account.' };
    const res = await db.query(`DELETE FROM admin_users WHERE id = $1 RETURNING id`, [id]);
    if (res.rows.length === 0) throw { status: 404, message: 'Admin user not found.' };
    return true;
  }

  async getRoles() {
    const res = await db.query(
      `SELECT ar.*, (SELECT COUNT(*) FROM admin_users au WHERE au.role_id = ar.id) as user_count
       FROM admin_roles ar ORDER BY id ASC`
    );
    return res.rows;
  }

  async getPermissionsForRole(roleId) {
    const res = await db.query(
      `SELECT * FROM admin_permissions WHERE role_id = $1 ORDER BY module`,
      [roleId]
    );
    return res.rows;
  }

  async updatePermissions(roleId, permissions) {
    for (const perm of permissions) {
      await db.query(
        `INSERT INTO admin_permissions (role_id, module, can_view, can_create, can_edit, can_delete, can_manage)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (role_id, module) DO UPDATE
           SET can_view=$3, can_create=$4, can_edit=$5, can_delete=$6, can_manage=$7`,
        [roleId, perm.module, perm.canView, perm.canCreate, perm.canEdit, perm.canDelete, perm.canManage]
      );
    }
    const { invalidateCache } = require('../../middleware/rbac');
    invalidateCache(roleId);
    return this.getPermissionsForRole(roleId);
  }
}

module.exports = new SettingsService();
