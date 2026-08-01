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
    return res.rows.map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description || null,
      icon: r.icon || null,
      isActive: !!r.is_active,
      sortOrder: Number(r.sort_order || 0),
      showInFilters: r.show_in_filters ?? true,
      showInSpecifications: r.show_in_specifications ?? true,
      itemCount: Number(r.item_count || 0)
    }));
  }

  // ── List All Items ─────────────────────────────────────────
  async getAllItems() {
    const res = await db.query(
      `SELECT * FROM master_items ORDER BY sort_order ASC, name ASC`
    );
    return res.rows.map(r => ({
      id: r.id,
      typeId: r.type_id,
      name: r.name,
      slug: r.slug,
      description: r.description || null,
      imageData: r.image_data || null,
      colorHex: r.color_hex || null,
      sortOrder: Number(r.sort_order || 0),
      isActive: !!r.is_active
    }));
  }

  // ── List Items by Type ID ──────────────────────────────────
  async getItems(typeId, query = {}) {
    const typeRes = await db.query(`SELECT * FROM master_types WHERE id = $1`, [typeId]);
    if (typeRes.rows.length === 0) throw { status: 404, message: `Master type ID '${typeId}' not found.` };

    const type = typeRes.rows[0];
    const { page, limit, offset } = parsePagination(query, 200);
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
      type: {
        id: type.id,
        name: type.name,
        slug: type.slug,
        description: type.description,
        icon: type.icon,
        isActive: !!type.is_active,
        sortOrder: Number(type.sort_order || 0),
        showInFilters: type.show_in_filters ?? true,
        showInSpecifications: type.show_in_specifications ?? true
      },
      items: items.rows.map(item => ({
        id: item.id,
        typeId: item.type_id,
        name: item.name,
        slug: item.slug,
        description: item.description || null,
        imageData: item.image_data || null,
        colorHex: item.color_hex || null,
        sortOrder: Number(item.sort_order || 0),
        isActive: !!item.is_active
      })),
      total: Number(countRes.rows[0].count),
      page,
      limit,
    };
  }

  // ── Create Item ────────────────────────────────────────────
  async createItem(typeId, data) {
    const typeRes = await db.query(`SELECT id FROM master_types WHERE id = $1`, [typeId]);
    if (typeRes.rows.length === 0) throw { status: 404, message: `Type ID '${typeId}' not found.` };

    const slug = slugify(data.name);
    const isActiveBool = data.isActive ?? true;

    const res = await db.query(
      `INSERT INTO master_items (type_id, name, slug, description, image_data, color_hex, sort_order, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [typeId, data.name, slug, data.description || null, data.imageData || null, data.colorHex || null, data.sortOrder || 0, isActiveBool]
    );

    const r = res.rows[0];
    return {
      id: r.id,
      typeId: r.type_id,
      name: r.name,
      slug: r.slug,
      description: r.description || null,
      imageData: r.image_data || null,
      colorHex: r.color_hex || null,
      sortOrder: Number(r.sort_order || 0),
      isActive: !!r.is_active
    };
  }

  // ── Update Item ────────────────────────────────────────────
  async updateItem(typeId, id, data) {
    const existing = await db.query(
      `SELECT * FROM master_items WHERE id = $1 AND type_id = $2`,
      [id, typeId]
    );
    if (existing.rows.length === 0) throw { status: 404, message: 'Master item not found.' };

    const item = existing.rows[0];
    const name = data.name !== undefined ? data.name : item.name;
    const slug = data.name !== undefined ? slugify(data.name) : item.slug;
    const description = data.description !== undefined ? data.description : item.description;
    const imageData = data.imageData !== undefined ? data.imageData : item.image_data;
    const colorHex = data.colorHex !== undefined ? data.colorHex : item.color_hex;
    const sortOrder = data.sortOrder !== undefined ? data.sortOrder : item.sort_order;
    const isActiveBool = data.isActive !== undefined ? data.isActive : item.is_active;

    const res = await db.query(
      `UPDATE master_items SET
        name=$1, slug=$2, description=$3, image_data=$4, color_hex=$5,
        sort_order=$6, is_active=$7, updated_at=NOW()
       WHERE id=$8 AND type_id=$9 RETURNING *`,
      [
        name,
        slug,
        description,
        imageData,
        colorHex,
        sortOrder,
        isActiveBool,
        id,
        typeId
      ]
    );

    const r = res.rows[0];
    return {
      id: r.id,
      typeId: r.type_id,
      name: r.name,
      slug: r.slug,
      description: r.description || null,
      imageData: r.image_data || null,
      colorHex: r.color_hex || null,
      sortOrder: Number(r.sort_order || 0),
      isActive: !!r.is_active
    };
  }

  // ── Delete Item ────────────────────────────────────────────
  async deleteItem(typeId, id) {
    const res = await db.query(
      `DELETE FROM master_items WHERE id = $1 AND type_id = $2 RETURNING id`,
      [id, typeId]
    );
    if (res.rows.length === 0) throw { status: 404, message: 'Item not found.' };
    return true;
  }

  // ── Toggle Status ──────────────────────────────────────────
  async toggleItem(typeId, id) {
    const res = await db.query(
      `UPDATE master_items SET is_active = NOT is_active, updated_at = NOW()
       WHERE id = $1 AND type_id = $2
       RETURNING *`,
      [id, typeId]
    );
    if (res.rows.length === 0) throw { status: 404, message: 'Item not found.' };
    const r = res.rows[0];
    return {
      id: r.id,
      typeId: r.type_id,
      name: r.name,
      slug: r.slug,
      description: r.description || null,
      imageData: r.image_data || null,
      colorHex: r.color_hex || null,
      sortOrder: Number(r.sort_order || 0),
      isActive: !!r.is_active
    };
  }

  // ── Reorder Items ──────────────────────────────────────────
  async reorderItems(items) {
    for (const { id, sortOrder } of items) {
      await db.query(`UPDATE master_items SET sort_order = $1, updated_at = NOW() WHERE id = $2`, [sortOrder, id]);
    }
    return true;
  }

  // ── Master Type CRUD ───────────────────────────────────────
  async createType(data) {
    const name = data.name.trim();
    const slug = slugify(name);
    const description = data.description || `Manage ${name.toLowerCase()} options`;
    const icon = data.icon || null;
    const isActive = data.isActive ?? true;
    const sortOrder = data.sortOrder ?? 0;
    const showInFilters = data.showInFilters ?? true;
    const showInSpecifications = data.showInSpecifications ?? true;

    const res = await db.query(
      `INSERT INTO master_types (name, slug, description, icon, is_active, sort_order, show_in_filters, show_in_specifications)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (slug) DO UPDATE SET 
         name = EXCLUDED.name, 
         description = EXCLUDED.description,
         icon = EXCLUDED.icon,
         show_in_filters = EXCLUDED.show_in_filters,
         show_in_specifications = EXCLUDED.show_in_specifications
       RETURNING *`,
      [name, slug, description, icon, isActive, sortOrder, showInFilters, showInSpecifications]
    );
    const r = res.rows[0];
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      icon: r.icon,
      isActive: !!r.is_active,
      sortOrder: Number(r.sort_order || 0),
      showInFilters: r.show_in_filters,
      showInSpecifications: r.show_in_specifications,
      itemCount: 0
    };
  }

  async updateType(idOrSlug, data) {
    const existing = await db.query(
      `SELECT * FROM master_types WHERE slug = $1 OR REPLACE(slug, '-', '_') = REPLACE($1, '-', '_') OR id::text = $1`,
      [idOrSlug]
    );
    if (existing.rows.length === 0) throw { status: 404, message: 'Master type not found.' };

    const item = existing.rows[0];
    const name = data.name ? data.name.trim() : item.name;
    const slug = data.name ? slugify(data.name) : item.slug;
    const description = data.description !== undefined ? data.description : item.description;
    const icon = data.icon !== undefined ? data.icon : item.icon;
    const isActive = data.isActive !== undefined ? data.isActive : item.is_active;
    const sortOrder = data.sortOrder !== undefined ? data.sortOrder : item.sort_order;
    const showInFilters = data.showInFilters !== undefined ? data.showInFilters : (item.show_in_filters ?? true);
    const showInSpecifications = data.showInSpecifications !== undefined ? data.showInSpecifications : (item.show_in_specifications ?? true);

    const res = await db.query(
      `UPDATE master_types SET
        name = $1, slug = $2, description = $3, icon = $4, is_active = $5, sort_order = $6, show_in_filters = $7, show_in_specifications = $8
       WHERE id = $9 RETURNING *`,
      [name, slug, description, icon, isActive, sortOrder, showInFilters, showInSpecifications, item.id]
    );
    const r = res.rows[0];
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      icon: r.icon,
      isActive: !!r.is_active,
      sortOrder: Number(r.sort_order || 0),
      showInFilters: r.show_in_filters,
      showInSpecifications: r.show_in_specifications
    };
  }

  async deleteType(idOrSlug) {
    const typeRes = await db.query(
      `SELECT id FROM master_types WHERE slug = $1 OR REPLACE(slug, '-', '_') = REPLACE($1, '-', '_') OR id::text = $1`,
      [idOrSlug]
    );
    if (typeRes.rows.length === 0) throw { status: 404, message: 'Master type not found.' };
    
    const typeId = typeRes.rows[0].id;
    await db.query(`DELETE FROM master_items WHERE type_id = $1`, [typeId]);
    await db.query(`DELETE FROM master_types WHERE id = $1`, [typeId]);
    return true;
  }

  async toggleType(idOrSlug) {
    const res = await db.query(
      `UPDATE master_types SET is_active = NOT is_active
       WHERE slug = $1 OR REPLACE(slug, '-', '_') = REPLACE($1, '-', '_') OR id::text = $1 RETURNING *`,
      [idOrSlug]
    );
    if (res.rows.length === 0) throw { status: 404, message: 'Master type not found.' };
    const r = res.rows[0];
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      icon: r.icon,
      isActive: !!r.is_active,
      sortOrder: Number(r.sort_order || 0),
      showInFilters: r.show_in_filters,
      showInSpecifications: r.show_in_specifications
    };
  }
}

module.exports = new MasterDataService();
