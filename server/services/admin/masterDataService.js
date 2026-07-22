// ============================================================
//  masterDataService.js — Generic Master Data CRUD
// ============================================================

const db = require('../../db');
const { slugify } = require('../../utils/slugify');
const { parsePagination } = require('../../utils/pagination');

class MasterDataService {

  // ── List All Types ─────────────────────────────────────────
  async getAllTypes() {
    const res = await db.query(
      `SELECT mt.*, (SELECT COUNT(*) FROM master_items mi WHERE mi.type_id = mt.id AND mi.is_active = true) as item_count
       FROM master_types mt ORDER BY sort_order ASC, name ASC`
    );
    return res.rows;
  }

  // ── List Items by Type Slug ────────────────────────────────
  async getItems(typeSlug, query = {}) {
    const typeRes = await db.query(`SELECT * FROM master_types WHERE slug = $1`, [typeSlug]);
    if (typeRes.rows.length === 0) throw { status: 404, message: `Master type '${typeSlug}' not found.` };

    const type = typeRes.rows[0];
    const { page, limit, offset } = parsePagination(query, 20);
    const { search, status } = query;

    let where = [`type_id = $1`];
    const params = [type.id];

    if (search) {
      params.push(`%${search}%`);
      where.push(`name ILIKE $${params.length}`);
    }
    if (status === 'active')   where.push(`is_active = true`);
    if (status === 'inactive') where.push(`is_active = false`);

    const whereClause = where.join(' AND ');

    params.push(limit, offset);
    const [items, countRes] = await Promise.all([
      db.query(
        `SELECT * FROM master_items WHERE ${whereClause} ORDER BY sort_order ASC, name ASC LIMIT $${params.length-1} OFFSET $${params.length}`,
        params
      ),
      db.query(`SELECT COUNT(*) FROM master_items WHERE ${where.join(' AND ')}`, params.slice(0, -2)),
    ]);

    return {
      type,
      items:  items.rows,
      total:  Number(countRes.rows[0].count),
      page,
      limit,
    };
  }

  // ── Create Item ────────────────────────────────────────────
  async createItem(typeSlug, data) {
    const typeRes = await db.query(`SELECT id FROM master_types WHERE slug = $1`, [typeSlug]);
    if (typeRes.rows.length === 0) throw { status: 404, message: `Type '${typeSlug}' not found.` };

    const typeId = typeRes.rows[0].id;
    const slug = slugify(data.name);

    const res = await db.query(
      `INSERT INTO master_items (type_id, name, slug, description, image_data, color_hex, sort_order, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (type_id, slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING *`,
      [typeId, data.name, slug, data.description || null, data.imageData || null, data.colorHex || null, data.sortOrder || 0, data.isActive ?? true]
    );

    return res.rows[0];
  }

  // ── Update Item ────────────────────────────────────────────
  async updateItem(typeSlug, id, data) {
    const existing = await db.query(
      `SELECT mi.* FROM master_items mi
       JOIN master_types mt ON mi.type_id = mt.id
       WHERE mi.id = $1 AND mt.slug = $2`,
      [id, typeSlug]
    );
    if (existing.rows.length === 0) throw { status: 404, message: 'Master item not found.' };

    const item = existing.rows[0];
    const slug = data.name ? slugify(data.name) : item.slug;

    const res = await db.query(
      `UPDATE master_items SET
        name=$1, slug=$2, description=$3, image_data=$4, color_hex=$5,
        sort_order=$6, is_active=$7, updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [
        data.name ?? item.name,
        slug,
        data.description ?? item.description,
        data.imageData ?? item.image_data,
        data.colorHex ?? item.color_hex,
        data.sortOrder ?? item.sort_order,
        data.isActive ?? item.is_active,
        id,
      ]
    );

    return res.rows[0];
  }

  // ── Delete Item ────────────────────────────────────────────
  async deleteItem(typeSlug, id) {
    const res = await db.query(
      `DELETE FROM master_items mi
       USING master_types mt
       WHERE mi.type_id = mt.id AND mi.id = $1 AND mt.slug = $2
       RETURNING mi.id`,
      [id, typeSlug]
    );
    if (res.rows.length === 0) throw { status: 404, message: 'Item not found.' };
    return true;
  }

  // ── Toggle Status ──────────────────────────────────────────
  async toggleItem(typeSlug, id) {
    const res = await db.query(
      `UPDATE master_items SET is_active = NOT is_active, updated_at = NOW()
       WHERE id = $1
         AND type_id = (SELECT id FROM master_types WHERE slug = $2)
       RETURNING *`,
      [id, typeSlug]
    );
    if (res.rows.length === 0) throw { status: 404, message: 'Item not found.' };
    return res.rows[0];
  }

  // ── Reorder Items ──────────────────────────────────────────
  async reorderItems(items) {
    for (const { id, sortOrder } of items) {
      await db.query(`UPDATE master_items SET sort_order = $1, updated_at = NOW() WHERE id = $2`, [sortOrder, id]);
    }
    return true;
  }
}

module.exports = new MasterDataService();
