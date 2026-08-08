// ============================================================
//  masterDataService.js — Generic Master Data CRUD
// ============================================================

const db = require('../../db');
const { slugify } = require('../../utils/slugify');
const { parsePagination } = require('../../utils/pagination');

class MasterDataService {

  // Resolve typeId from either numeric ID or string slug
  async resolveTypeId(idOrSlug, client) {
    if (idOrSlug === null || idOrSlug === undefined) return null;
    const isNum = !isNaN(idOrSlug) && !isNaN(parseInt(idOrSlug));
    if (isNum) {
      return parseInt(idOrSlug);
    }
    const typeRes = await (client || db).query(
      `SELECT id FROM master_types 
       WHERE slug = $1 
          OR REPLACE(slug, '-', '_') = REPLACE($1, '-', '_') 
          OR id::text = $1 
       LIMIT 1`,
      [String(idOrSlug)]
    );
    if (typeRes.rows.length === 0) return null;
    return typeRes.rows[0].id;
  }

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
      itemCount: Number(r.item_count || 0),
      source: r.source || 'admin',
      createdBySellerId: r.created_by_seller_id || null
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
      isActive: !!r.is_active,
      source: r.source || 'admin',
      createdBySellerId: r.created_by_seller_id || null
    }));
  }

  // ── List Items by Type ID ──────────────────────────────────
  async getItems(typeIdParam, query = {}) {
    const typeId = await this.resolveTypeId(typeIdParam);
    const typeRes = await db.query(`SELECT * FROM master_types WHERE id = $1`, [typeId]);
    if (typeRes.rows.length === 0) throw { status: 404, message: `Master type ID/slug '${typeIdParam}' not found.` };

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
        showInSpecifications: type.show_in_specifications ?? true,
        source: type.source || 'admin',
        createdBySellerId: type.created_by_seller_id || null
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
        isActive: !!item.is_active,
        source: item.source || 'admin',
        createdBySellerId: item.created_by_seller_id || null
      })),
      total: Number(countRes.rows[0].count),
      page,
      limit,
    };
  }

  async createItem(typeIdParam, data, client) {
    const typeId = await this.resolveTypeId(typeIdParam, client);
    const typeRes = await (client || db).query(`SELECT id FROM master_types WHERE id = $1`, [typeId]);
    if (typeRes.rows.length === 0) throw { status: 404, message: `Type ID/slug '${typeIdParam}' not found.` };

    const slug = slugify(data.name);
    const isActiveBool = data.isActive ?? true;
    const createdBySellerId = data.createdBySellerId || null;
    const source = createdBySellerId ? 'seller' : 'admin';

    let res;
    try {
      res = await (client || db).query(
        `INSERT INTO master_items (type_id, name, slug, description, image_data, color_hex, sort_order, is_active, created_by_seller_id, source)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         RETURNING *`,
        [typeId, data.name, slug, data.description || null, data.imageData || null, data.colorHex || null, data.sortOrder || 0, isActiveBool, createdBySellerId, source]
      );
    } catch (err) {
      if (err.code === '23505') {
        throw { status: 409, message: 'An item with this name already exists under this category.' };
      }
      throw err;
    }

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
      isActive: !!r.is_active,
      source: r.source || 'admin',
      createdBySellerId: r.created_by_seller_id || null
    };
  }

  // ── Update Item ────────────────────────────────────────────
  async updateItem(typeIdParam, id, data, client) {
    const typeId = await this.resolveTypeId(typeIdParam, client);
    const existing = await (client || db).query(
      `SELECT mi.*, mt.slug as type_slug 
       FROM master_items mi 
       JOIN master_types mt ON mi.type_id = mt.id
       WHERE mi.id = $1 AND mi.type_id = $2`,
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

    let res;
    try {
      res = await (client || db).query(
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
    } catch (err) {
      if (err.code === '23505') {
        throw { status: 409, message: 'An item with this name already exists under this category.' };
      }
      throw err;
    }

    // If the name changed, propagate this to the products columns
    if (data.name !== undefined && data.name !== item.name) {
      const typeSlug = item.type_slug || '';
      const typeToColumn = {
        fabrics: 'fabric',
        occasions: 'occasion',
        colors: 'color',
        patterns: 'pattern',
        weaves: 'weave',
        borders: 'border',
        brands: 'brand',
        brand: 'brand',
        collections: 'collection'
      };
      const col = typeToColumn[typeSlug.toLowerCase()] || typeSlug.toLowerCase().replace(/-/g, '_');
      
      const colCheck = await (client || db).query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_name = $1`,
        [col]
      );
      if (colCheck.rows.length > 0) {
        await (client || db).query(
          `UPDATE products SET ${col} = $1 WHERE LOWER(${col}) = LOWER($2)`,
          [data.name, item.name]
        );
      }
    }

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
      isActive: !!r.is_active,
      source: r.source || 'admin',
      createdBySellerId: r.created_by_seller_id || null
    };
  }

  async deleteItem(typeIdParam, id, client) {
    const typeId = await this.resolveTypeId(typeIdParam, client);
    const itemQuery = await (client || db).query(
      `SELECT mi.name as item_name, mt.slug as type_slug
       FROM master_items mi
       JOIN master_types mt ON mi.type_id = mt.id
       WHERE mi.id = $1 AND mi.type_id = $2`,
      [id, typeId]
    );

    const res = await (client || db).query(
      `DELETE FROM master_items WHERE id = $1 AND type_id = $2 RETURNING id`,
      [id, typeId]
    );
    if (res.rows.length === 0) throw { status: 404, message: 'Item not found.' };

    if (itemQuery.rows.length > 0) {
      const itemName = itemQuery.rows[0].item_name;
      const typeSlug = itemQuery.rows[0].type_slug || '';
      const typeToColumn = {
        fabrics: 'fabric',
        occasions: 'occasion',
        colors: 'color',
        patterns: 'pattern',
        weaves: 'weave',
        borders: 'border',
        brands: 'brand',
        brand: 'brand',
        collections: 'collection'
      };
      const col = typeToColumn[typeSlug.toLowerCase()] || typeSlug.toLowerCase().replace(/-/g, '_');
      
      const colCheck = await (client || db).query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_name = $1`,
        [col]
      );
      if (colCheck.rows.length > 0) {
        await (client || db).query(`UPDATE products SET ${col} = NULL WHERE LOWER(${col}) = LOWER($1)`, [itemName]);
      }
    }

    return true;
  }

  // ── Toggle Status ──────────────────────────────────────────
  async toggleItem(typeIdParam, id) {
    const typeId = await this.resolveTypeId(typeIdParam);
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
    const createdBySellerId = data.createdBySellerId || null;
    const source = createdBySellerId ? 'seller' : 'admin';

    const res = await db.query(
      `INSERT INTO master_types (name, slug, description, icon, is_active, sort_order, show_in_filters, show_in_specifications, created_by_seller_id, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (slug) DO UPDATE SET 
         name = EXCLUDED.name, 
         description = EXCLUDED.description,
         icon = EXCLUDED.icon,
         show_in_filters = EXCLUDED.show_in_filters,
         show_in_specifications = EXCLUDED.show_in_specifications,
         created_by_seller_id = COALESCE(master_types.created_by_seller_id, EXCLUDED.created_by_seller_id),
         source = COALESCE(master_types.source, EXCLUDED.source)
       RETURNING *`,
      [name, slug, description, icon, isActive, sortOrder, showInFilters, showInSpecifications, createdBySellerId, source]
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
      itemCount: 0,
      source: r.source || 'admin',
      createdBySellerId: r.created_by_seller_id || null
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
      showInSpecifications: r.show_in_specifications,
      source: r.source || 'admin',
      createdBySellerId: r.created_by_seller_id || null
    };
  }

  async deleteType(idOrSlug, client) {
    const typeRes = await (client || db).query(
      `SELECT id, slug FROM master_types WHERE slug = $1 OR REPLACE(slug, '-', '_') = REPLACE($1, '-', '_') OR id::text = $1`,
      [idOrSlug]
    );
    if (typeRes.rows.length === 0) throw { status: 404, message: 'Master type not found.' };
    
    const typeId = typeRes.rows[0].id;
    const typeSlug = typeRes.rows[0].slug || '';

    await (client || db).query(`DELETE FROM master_items WHERE type_id = $1`, [typeId]);
    await (client || db).query(`DELETE FROM master_types WHERE id = $1`, [typeId]);

    const typeToColumn = {
      fabrics: 'fabric',
      occasions: 'occasion',
      colors: 'color',
      patterns: 'pattern',
      weaves: 'weave',
      borders: 'border',
      brands: 'brand',
      brand: 'brand',
      collections: 'collection'
    };
    const col = typeToColumn[typeSlug.toLowerCase()] || typeSlug.toLowerCase().replace(/-/g, '_');
    const colCheck = await (client || db).query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_name = $1`,
      [col]
    );
    if (colCheck.rows.length > 0) {
      await (client || db).query(`UPDATE products SET ${col} = NULL`);
    }

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
