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
    const razorpayEnabled = data.razorpayEnabled !== undefined ? !!data.razorpayEnabled : (data.razorpay_enabled !== undefined ? !!data.razorpay_enabled : true);
    const razorpayKey = data.razorpayKey || data.razorpay_key || '';
    const razorpaySecret = data.razorpaySecret || data.razorpay_secret || '';
    const codEnabled = data.codEnabled !== undefined ? !!data.codEnabled : (data.cod_enabled !== undefined ? !!data.cod_enabled : true);
    const codMaxAmount = Number(data.codMaxAmount !== undefined ? data.codMaxAmount : (data.cod_max_amount !== undefined ? data.cod_max_amount : 5000)) || 5000;
    const upiQrEnabled = data.upiQrEnabled !== undefined ? !!data.upiQrEnabled : (data.upi_qr_enabled !== undefined ? !!data.upi_qr_enabled : true);
    const upiId = data.upiId || data.upi_id || '';
    const upiPayeeName = data.upiPayeeName || data.upi_payee_name || 'Happy Sarees';
    const qrCodeUrl = data.qrCodeUrl || data.qr_code_url || '';

    const standardized = {
      ...data,
      razorpayEnabled,
      razorpay_enabled: razorpayEnabled,
      razorpayKey,
      razorpay_key: razorpayKey,
      razorpaySecret,
      razorpay_secret: razorpaySecret,
      codEnabled,
      cod_enabled: codEnabled,
      codMaxAmount,
      cod_max_amount: codMaxAmount,
      upiQrEnabled,
      upi_qr_enabled: upiQrEnabled,
      upiId,
      upi_id: upiId,
      upiPayeeName,
      upi_payee_name: upiPayeeName,
      qrCodeUrl,
      qr_code_url: qrCodeUrl
    };
    return this.updateSetting('store_payment', standardized, adminUserId, 'payment');
  }

  async updateShipping(data, adminUserId) {
    const enableFreeShipping = data.enableFreeShipping !== undefined ? !!data.enableFreeShipping : (data.enable_free_shipping !== undefined ? !!data.enable_free_shipping : true);
    const minFreeShippingOrder = Number(data.minFreeShippingOrder !== undefined ? data.minFreeShippingOrder : (data.free_shipping_min_amount !== undefined ? data.free_shipping_min_amount : 2999)) || 2999;
    
    const standardized = {
      enable_free_shipping: enableFreeShipping,
      enableFreeShipping: enableFreeShipping,
      free_shipping_min_amount: minFreeShippingOrder,
      minFreeShippingOrder: minFreeShippingOrder,
      standardShippingRate: Number(data.standardShippingRate) || 99,
      expressShippingRate: Number(data.expressShippingRate) || 199,
      deliveryDays: data.deliveryDays || '3-5 Business Days'
    };
    return this.updateSetting('store_shipping', standardized, adminUserId, 'shipping');
  }

  async updateTax(data, adminUserId) {
    return this.updateSetting('store_tax', data, adminUserId, 'tax');
  }

  async updateSeo(data, adminUserId) {
    return this.updateSetting('store_seo', data, adminUserId, 'seo');
  }

  async updateContact(data, adminUserId) {
    return this.updateSetting('store_contact', data, adminUserId, 'contact');
  }

  async updatePolicies(data, adminUserId) {
    return this.updateSetting('store_policies', data, adminUserId, 'policies');
  }

  async updateSocial(data, adminUserId) {
    return this.updateSetting('store_social', data, adminUserId, 'social');
  }

  async updateIntegrations(data, adminUserId) {
    const razorpayEnabled = data.razorpayEnabled !== undefined ? !!data.razorpayEnabled : (data.razorpay_enabled !== undefined ? !!data.razorpay_enabled : true);
    const razorpayKey = data.razorpayKey || data.razorpay_key || '';
    const razorpaySecret = data.razorpaySecret || data.razorpay_secret || '';
    const codEnabled = data.codEnabled !== undefined ? !!data.codEnabled : (data.cod_enabled !== undefined ? !!data.cod_enabled : true);
    const codMaxAmount = Number(data.codMaxAmount !== undefined ? data.codMaxAmount : (data.cod_max_amount !== undefined ? data.cod_max_amount : 5000)) || 5000;
    const upiQrEnabled = data.upiQrEnabled !== undefined ? !!data.upiQrEnabled : (data.upi_qr_enabled !== undefined ? !!data.upi_qr_enabled : true);
    const upiId = data.upiId || data.upi_id || '';
    const qrCodeUrl = data.qrCodeUrl || data.qr_code_url || '';

    const standardized = {
      ...data,
      razorpayEnabled,
      razorpay_enabled: razorpayEnabled,
      razorpayKey,
      razorpay_key: razorpayKey,
      razorpaySecret,
      razorpay_secret: razorpaySecret,
      codEnabled,
      cod_enabled: codEnabled,
      codMaxAmount,
      cod_max_amount: codMaxAmount,
      upiQrEnabled,
      upi_qr_enabled: upiQrEnabled,
      upiId,
      upi_id: upiId,
      qrCodeUrl,
      qr_code_url: qrCodeUrl
    };
    return this.updateSetting('store_integrations', standardized, adminUserId, 'integrations');
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

  // ── Dynamic Shipping Methods CRUD ────────────────────────────
  async getShippingMethods() {
    const res = await db.query(
      `SELECT * FROM shipping_methods ORDER BY display_order ASC, id ASC`
    );
    return res.rows.map(row => ({
      ...row,
      price: Number(row.shipping_charge),
      shipping_charge: Number(row.shipping_charge),
      estimate: row.estimated_delivery_days,
      estimated_delivery_days: row.estimated_delivery_days
    }));
  }

  async createShippingMethod(data) {
    const { name, description, shipping_charge, price, estimated_delivery_days, estimate, free_shipping_eligible, is_enabled, display_order } = data;
    const charge = shipping_charge !== undefined ? shipping_charge : (price !== undefined ? price : 0);
    const deliveryDays = estimated_delivery_days || estimate || '3-5 Business Days';
    
    const res = await db.query(
      `INSERT INTO shipping_methods 
        (name, description, shipping_charge, estimated_delivery_days, free_shipping_eligible, is_enabled, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        name,
        description || '',
        Number(charge) || 0,
        deliveryDays,
        free_shipping_eligible !== false,
        is_enabled !== false,
        Number(display_order) || 1
      ]
    );
    const row = res.rows[0];
    return {
      ...row,
      price: Number(row.shipping_charge),
      shipping_charge: Number(row.shipping_charge),
      estimate: row.estimated_delivery_days,
      estimated_delivery_days: row.estimated_delivery_days
    };
  }

  async updateShippingMethod(id, data) {
    const { name, description, shipping_charge, price, estimated_delivery_days, estimate, free_shipping_eligible, is_enabled, display_order } = data;
    const charge = shipping_charge !== undefined ? shipping_charge : (price !== undefined ? price : 0);
    const deliveryDays = estimated_delivery_days || estimate || '3-5 Business Days';

    const res = await db.query(
      `UPDATE shipping_methods
       SET name = $1,
           description = $2,
           shipping_charge = $3,
           estimated_delivery_days = $4,
           free_shipping_eligible = $5,
           is_enabled = $6,
           display_order = $7,
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        name,
        description || '',
        Number(charge) || 0,
        deliveryDays,
        free_shipping_eligible !== false,
        is_enabled !== false,
        Number(display_order) || 1,
        id
      ]
    );
    if (res.rows.length === 0) throw { status: 404, message: 'Shipping method not found.' };
    const row = res.rows[0];
    return {
      ...row,
      price: Number(row.shipping_charge),
      shipping_charge: Number(row.shipping_charge),
      estimate: row.estimated_delivery_days,
      estimated_delivery_days: row.estimated_delivery_days
    };
  }

  async deleteShippingMethod(id) {
    const res = await db.query(`DELETE FROM shipping_methods WHERE id = $1 RETURNING id`, [id]);
    if (res.rows.length === 0) throw { status: 404, message: 'Shipping method not found.' };
    return { success: true };
  }

  async toggleShippingMethod(id) {
    const res = await db.query(
      `UPDATE shipping_methods SET is_enabled = NOT is_enabled, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    if (res.rows.length === 0) throw { status: 404, message: 'Shipping method not found.' };
    const row = res.rows[0];
    return {
      ...row,
      price: Number(row.shipping_charge),
      shipping_charge: Number(row.shipping_charge),
      estimate: row.estimated_delivery_days,
      estimated_delivery_days: row.estimated_delivery_days
    };
  }
}

module.exports = new SettingsService();
