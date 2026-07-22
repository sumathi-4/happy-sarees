// ============================================================
//  couponService.js — Admin Coupon Management
// ============================================================

const db = require('../../db');
const { parsePagination } = require('../../utils/pagination');

class CouponService {

  async getAll(query) {
    const { page, limit, offset } = parsePagination(query, 10);
    const { search, status, type } = query;

    let where = [`1=1`];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      where.push(`(code ILIKE $${params.length} OR name ILIKE $${params.length})`);
    }
    if (status === 'active')   where.push(`is_active = true AND (expires_at IS NULL OR expires_at > NOW())`);
    if (status === 'inactive') where.push(`is_active = false`);
    if (status === 'expired')  where.push(`expires_at IS NOT NULL AND expires_at <= NOW()`);
    if (type) { params.push(type); where.push(`type = $${params.length}`); }

    const whereClause = where.join(' AND ');
    params.push(limit, offset);

    const [data, countRes] = await Promise.all([
      db.query(
        `SELECT c.*, au.name as created_by_name,
                CASE WHEN c.expires_at IS NOT NULL AND c.expires_at <= NOW() THEN 'expired'
                     WHEN c.is_active = false THEN 'inactive'
                     ELSE 'active' END as computed_status
         FROM coupons c
         LEFT JOIN admin_users au ON c.created_by = au.id
         WHERE ${whereClause}
         ORDER BY c.created_at DESC
         LIMIT $${params.length-1} OFFSET $${params.length}`,
        params
      ),
      db.query(`SELECT COUNT(*) FROM coupons c WHERE ${whereClause}`, params.slice(0,-2)),
    ]);

    return { coupons: data.rows, total: Number(countRes.rows[0].count), page, limit };
  }

  async getById(id) {
    const res = await db.query(
      `SELECT c.*, au.name as created_by_name FROM coupons c
       LEFT JOIN admin_users au ON c.created_by = au.id
       WHERE c.id = $1`,
      [id]
    );
    if (res.rows.length === 0) throw { status: 404, message: 'Coupon not found.' };

    const usage = await db.query(
      `SELECT cu.*, u.full_name as user_name, u.email as user_email, o.order_number
       FROM coupon_usage cu
       LEFT JOIN users u ON cu.user_id = u.id
       LEFT JOIN orders o ON cu.order_id = o.id
       WHERE cu.coupon_id = $1
       ORDER BY cu.used_at DESC LIMIT 20`,
      [id]
    );

    return { ...res.rows[0], usageHistory: usage.rows };
  }

  async create(data, adminUserId) {
    if (!data.code || !data.name || !data.type || data.value === undefined) {
      throw { status: 400, message: 'code, name, type, and value are required.' };
    }
    if (!['percentage','flat'].includes(data.type)) {
      throw { status: 400, message: 'type must be percentage or flat.' };
    }

    const res = await db.query(
      `INSERT INTO coupons (code, name, description, type, value, min_order_amount, max_discount_amount,
        usage_limit, per_user_limit, is_active, starts_at, expires_at, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        data.code.toUpperCase(), data.name, data.description || null,
        data.type, data.value,
        data.minOrderAmount || 0, data.maxDiscountAmount || null,
        data.usageLimit || null, data.perUserLimit || 1,
        data.isActive ?? true,
        data.startsAt || new Date(),
        data.expiresAt || null,
        adminUserId,
      ]
    );

    return res.rows[0];
  }

  async update(id, data) {
    const existing = await this.getById(id);
    const c = existing;

    const res = await db.query(
      `UPDATE coupons SET
        code=$1, name=$2, description=$3, type=$4, value=$5,
        min_order_amount=$6, max_discount_amount=$7,
        usage_limit=$8, per_user_limit=$9, is_active=$10,
        starts_at=$11, expires_at=$12, updated_at=NOW()
       WHERE id=$13 RETURNING *`,
      [
        (data.code || c.code).toUpperCase(),
        data.name ?? c.name,
        data.description ?? c.description,
        data.type ?? c.type,
        data.value ?? c.value,
        data.minOrderAmount ?? c.min_order_amount,
        data.maxDiscountAmount ?? c.max_discount_amount,
        data.usageLimit ?? c.usage_limit,
        data.perUserLimit ?? c.per_user_limit,
        data.isActive ?? c.is_active,
        data.startsAt ?? c.starts_at,
        data.expiresAt ?? c.expires_at,
        id,
      ]
    );

    return res.rows[0];
  }

  async delete(id) {
    const res = await db.query(`DELETE FROM coupons WHERE id = $1 RETURNING id`, [id]);
    if (res.rows.length === 0) throw { status: 404, message: 'Coupon not found.' };
    return true;
  }

  async toggle(id) {
    const res = await db.query(
      `UPDATE coupons SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    if (res.rows.length === 0) throw { status: 404, message: 'Coupon not found.' };
    return res.rows[0];
  }

  async validate(code, orderAmount, userId) {
    const res = await db.query(
      `SELECT * FROM coupons WHERE code = $1 AND is_active = true AND (expires_at IS NULL OR expires_at > NOW())`,
      [code.toUpperCase()]
    );
    if (res.rows.length === 0) return { valid: false, message: 'Invalid or expired coupon code.' };

    const c = res.rows[0];

    if (c.usage_limit && c.usage_count >= c.usage_limit) return { valid: false, message: 'Coupon usage limit reached.' };
    if (orderAmount < c.min_order_amount) return { valid: false, message: `Minimum order amount is ₹${c.min_order_amount}` };

    if (userId && c.per_user_limit) {
      const userUsage = await db.query(`SELECT COUNT(*) FROM coupon_usage WHERE coupon_id = $1 AND user_id = $2`, [c.id, userId]);
      if (Number(userUsage.rows[0].count) >= c.per_user_limit) return { valid: false, message: 'You have already used this coupon.' };
    }

    let discount = c.type === 'percentage' ? (orderAmount * c.value / 100) : c.value;
    if (c.max_discount_amount) discount = Math.min(discount, c.max_discount_amount);

    return { valid: true, coupon: c, discount: Math.round(discount) };
  }
}

module.exports = new CouponService();
