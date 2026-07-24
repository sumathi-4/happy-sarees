// ============================================================
//  productService.js — Admin Product Management
// ============================================================

const db = require('../../db');
const { slugify, uniqueSlug } = require('../../utils/slugify');
const { parsePagination, buildOrderBy } = require('../../utils/pagination');

class ProductService {

  // ── List Products ──────────────────────────────────────────
  async getAll(query) {
    const { page, limit, offset } = parsePagination(query, 12);
    const { search, status, fabric, color, category, sort, stockAlert } = query;

    let where = [`p.deleted_at IS NULL`];
    const params = [];

    const p = () => { params.push(arguments[0]); return `$${params.length}`; };

    if (search) {
      params.push(`%${search}%`);
      where.push(`(p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length} OR p.fabric ILIKE $${params.length})`);
    }
    if (status) {
      params.push(status);
      where.push(`p.status = $${params.length}`);
    }
    if (fabric) {
      params.push(fabric);
      where.push(`LOWER(p.fabric) = LOWER($${params.length})`);
    }
    if (color) {
      params.push(color);
      where.push(`LOWER(p.color) = LOWER($${params.length})`);
    }
    if (category) {
      params.push(parseInt(category));
      where.push(`p.category_id = $${params.length}`);
    }
    if (stockAlert === 'low') {
      where.push(`p.stock_count < 10`);
    } else if (stockAlert === 'out') {
      where.push(`p.in_stock = false`);
    }

    const whereClause = where.join(' AND ');
    const orderBy = buildOrderBy(sort, ['name','price','stock_count','created_at','rating'], 'p.created_at DESC');

    params.push(limit, offset);
    const dataQ = `
      SELECT p.*, c.name as category_name,
             (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id = p.id) as total_sold
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const countQ = `SELECT COUNT(*) FROM products p WHERE ${whereClause}`;
    const countParams = params.slice(0, -2);

    const [data, count, images] = await Promise.all([
      db.query(dataQ, params),
      db.query(countQ, countParams),
      db.query(`SELECT product_id, image_url, image_data, is_primary FROM product_images ORDER BY is_primary DESC, display_order ASC`),
    ]);

    const imagesMap = {};
    images.rows.forEach(img => {
      if (!imagesMap[img.product_id]) imagesMap[img.product_id] = [];
      imagesMap[img.product_id].push(img.image_data || img.image_url);
    });

    const products = data.rows.map(r => ({
      id:           r.id,
      name:         r.name,
      slug:         r.slug,
      sku:          r.sku,
      price:        Number(r.price),
      originalPrice: r.original_price ? Number(r.original_price) : null,
      mrp:          r.original_price ? Number(r.original_price) : Number(r.price),
      fabric:       r.fabric,
      color:        r.color,
      pattern:      r.pattern,
      weave:        r.weave,
      border:       r.border,
      occasion:     r.occasion,
      brand:        r.brand || 'Happy Sarees',
      collection:   r.collection,
      category:     r.category_name,
      categoryId:   r.category_id,
      status:       r.status || 'published',
      inStock:      r.in_stock,
      stockCount:   r.stock_count,
      stock:        r.stock_count,
      lowStockAlert: r.low_stock_alert || 3,
      isBestSeller: r.is_best_seller,
      bestSeller:   r.is_best_seller,
      isNewArrival: r.is_new_arrival,
      newArrival:   r.is_new_arrival,
      isTrending:   r.is_trending || false,
      trendingProduct: r.is_trending || false,
      featuredOnHomepage: r.featured_on_homepage,
      showOnHomepage: r.featured_on_homepage,
      rating:       Number(r.rating || 4.8),
      reviewCount:  r.review_count,
      totalSold:    Number(r.total_sold || 0),
      image:        (imagesMap[r.id] || [])[0] || null,
      images:       imagesMap[r.id] || [],
      galleryImages: imagesMap[r.id] || [],
      createdAt:    r.created_at,
      updatedAt:    r.updated_at,
    }));

    return { products, total: Number(count.rows[0].count), page, limit };
  }

  // ── Get Single Product ─────────────────────────────────────
  async getById(id) {
    const [prod, images, seo] = await Promise.all([
      db.query(
        `SELECT p.*, c.name as category_name
         FROM products p LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.id = $1 AND p.deleted_at IS NULL`,
        [id]
      ),
      db.query(
        `SELECT id, image_url, image_data, alt_text, is_primary, display_order
         FROM product_images WHERE product_id = $1 ORDER BY is_primary DESC, display_order ASC`,
        [id]
      ),
      db.query(`SELECT * FROM product_seo WHERE product_id = $1`, [id]),
    ]);

    if (prod.rows.length === 0) throw { status: 404, message: 'Product not found.' };

    const p = prod.rows[0];
    return {
      ...p,
      mrp: p.original_price ? Number(p.original_price) : Number(p.price),
      stock: p.stock_count,
      isTrending: p.is_trending || false,
      trendingProduct: p.is_trending || false,
      bestSeller: p.is_best_seller,
      newArrival: p.is_new_arrival,
      showOnHomepage: p.featured_on_homepage,
      images: images.rows.map(img => ({
        id:       img.id,
        url:      img.image_data || img.image_url,
        altText:  img.alt_text,
        isPrimary: img.is_primary,
        order:    img.display_order,
      })),
      seo: seo.rows[0] || {},
    };
  }

  // ── Create Product ─────────────────────────────────────────
  async create(data) {
    const base = slugify(data.name);
    const slug = await uniqueSlug(
      async s => (await db.query(`SELECT id FROM products WHERE slug = $1`, [s])).rows.length > 0,
      base
    );

    const stockCount = Number(data.stockCount ?? data.stock ?? 0);
    const inStock = stockCount > 0;

    const res = await db.query(
      `INSERT INTO products (
        name, slug, category_id, description, price, original_price,
        fabric, color, weave, border, pallu, occasion,
        blouse_included, blouse_size, height, width, weight,
        sku, in_stock, stock_count, is_best_seller, is_new_arrival,
        featured_on_homepage, is_trending, status, rating, review_count,
        video_url, video_data
       ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29
       ) RETURNING id`,
      [
        data.name, slug, data.categoryId || null, data.description || data.longDescription || data.shortDescription,
        data.price, data.originalPrice || data.mrp || null,
        data.fabric, data.color, data.weave, data.border, data.pallu, data.occasion,
        data.blouseIncluded ?? true, data.blouseSize, data.height || data.sareeLength, data.width || data.sareeWidth, data.weight,
        data.sku, inStock, stockCount,
        data.isBestSeller ?? data.bestSeller ?? false, data.isNewArrival ?? data.newArrival ?? false,
        data.featuredOnHomepage ?? data.showOnHomepage ?? false,
        data.isTrending ?? data.trendingProduct ?? false,
        data.status || 'published',
        data.rating || 4.8, data.reviewCount || 0,
        data.videoUrl || null, data.videoData || null
      ]
    );

    const productId = res.rows[0].id;

    // Insert images
    const imagesList = data.images || data.galleryImages || [];
    if (Array.isArray(imagesList)) {
      for (let i = 0; i < imagesList.length; i++) {
        const img = imagesList[i];
        const urlStr = typeof img === 'string' ? img : img.url;
        const dataStr = typeof img === 'object' ? img.data : null;
        await db.query(
          `INSERT INTO product_images (product_id, image_url, image_data, alt_text, display_order, is_primary)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [productId, urlStr || null, dataStr || null, data.name, i, i === 0]
        );
      }
    }

    // Insert SEO
    if (data.seo || data.seoTitle || data.metaDescription) {
      const metaTitle = data.seoTitle || data.seo?.metaTitle || data.name;
      const metaDesc = data.metaDescription || data.seo?.metaDescription || data.shortDescription || data.description;
      await db.query(
        `INSERT INTO product_seo (product_id, meta_title, meta_description)
         VALUES ($1,$2,$3) ON CONFLICT (product_id) DO UPDATE
         SET meta_title=$2, meta_description=$3`,
        [productId, metaTitle, metaDesc]
      );
    }

    return this.getById(productId);
  }

  // ── Update Product ─────────────────────────────────────────
  async update(id, data) {
    const existing = await this.getById(id);

    const stockCount = Number(data.stockCount ?? data.stock ?? existing.stock_count);
    const inStock = stockCount > 0;

    const res = await db.query(
      `UPDATE products SET
        name=$1, category_id=$2, description=$3, price=$4, original_price=$5,
        fabric=$6, color=$7, weave=$8, border=$9, pallu=$10, occasion=$11,
        blouse_included=$12, blouse_size=$13, height=$14, width=$15, weight=$16,
        sku=$17, in_stock=$18, stock_count=$19, is_best_seller=$20, is_new_arrival=$21,
        featured_on_homepage=$22, is_trending=$23, status=$24, video_url=$25, video_data=$26, updated_at=NOW()
       WHERE id=$27 AND deleted_at IS NULL
       RETURNING id`,
      [
        data.name ?? existing.name,
        data.categoryId ?? existing.category_id,
        data.description ?? data.longDescription ?? existing.description,
        data.price ?? existing.price,
        data.originalPrice ?? data.mrp ?? existing.original_price,
        data.fabric ?? existing.fabric,
        data.color ?? existing.color,
        data.weave ?? existing.weave,
        data.border ?? existing.border,
        data.pallu ?? existing.pallu,
        data.occasion ?? existing.occasion,
        data.blouseIncluded ?? existing.blouse_included,
        data.blouseSize ?? existing.blouse_size,
        data.height ?? data.sareeLength ?? existing.height,
        data.width ?? data.sareeWidth ?? existing.width,
        data.weight ?? existing.weight,
        data.sku ?? existing.sku,
        inStock,
        stockCount,
        data.isBestSeller ?? data.bestSeller ?? existing.is_best_seller,
        data.isNewArrival ?? data.newArrival ?? existing.is_new_arrival,
        data.featuredOnHomepage ?? data.showOnHomepage ?? existing.featured_on_homepage,
        data.isTrending ?? data.trendingProduct ?? existing.is_trending ?? false,
        data.status ?? existing.status,
        data.videoUrl ?? existing.video_url ?? null,
        data.videoData ?? existing.video_data ?? null,
        id,
      ]
    );

    if (res.rows.length === 0) throw { status: 404, message: 'Product not found.' };

    // Update images if provided
    const imagesList = data.images || data.galleryImages;
    if (Array.isArray(imagesList) && imagesList.length > 0) {
      await db.query(`DELETE FROM product_images WHERE product_id = $1`, [id]);
      for (let i = 0; i < imagesList.length; i++) {
        const img = imagesList[i];
        const isCover = data.image ? (img === data.image || img.url === data.image) : (i === 0);
        const urlStr = typeof img === 'string' ? img : img.url;
        const dataStr = typeof img === 'object' ? img.data : null;
        await db.query(
          `INSERT INTO product_images (product_id, image_url, image_data, alt_text, display_order, is_primary)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [id, urlStr || null, dataStr || null, data.name || existing.name, i, isCover]
        );
      }
    }

    // Update SEO
    if (data.seo || data.seoTitle || data.metaDescription) {
      const metaTitle = data.seoTitle || data.seo?.metaTitle || data.name || existing.name;
      const metaDesc = data.metaDescription || data.seo?.metaDescription || data.shortDescription || data.description || existing.description;
      await db.query(
        `INSERT INTO product_seo (product_id, meta_title, meta_description)
         VALUES ($1,$2,$3) ON CONFLICT (product_id) DO UPDATE
         SET meta_title=$2, meta_description=$3, updated_at=NOW()`,
        [id, metaTitle, metaDesc]
      );
    }

    return this.getById(id);
  }

  // ── Soft Delete ────────────────────────────────────────────
  async delete(id) {
    const res = await db.query(
      `UPDATE products SET deleted_at = NOW(), status = 'archived' WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
      [id]
    );
    if (res.rows.length === 0) throw { status: 404, message: 'Product not found.' };
    return true;
  }

  // ── Bulk Actions ───────────────────────────────────────────
  async bulkAction(ids, action) {
    if (!Array.isArray(ids) || ids.length === 0) throw { status: 400, message: 'No product IDs provided.' };

    const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');

    if (action === 'delete') {
      await db.query(`UPDATE products SET deleted_at = NOW(), status = 'archived' WHERE id IN (${placeholders})`, ids);
    } else if (action === 'publish') {
      await db.query(`UPDATE products SET status = 'published', updated_at = NOW() WHERE id IN (${placeholders})`, ids);
    } else if (action === 'draft') {
      await db.query(`UPDATE products SET status = 'draft', updated_at = NOW() WHERE id IN (${placeholders})`, ids);
    } else if (action === 'archive') {
      await db.query(`UPDATE products SET status = 'archived', updated_at = NOW() WHERE id IN (${placeholders})`, ids);
    } else {
      throw { status: 400, message: `Unknown bulk action: ${action}` };
    }

    return { affected: ids.length };
  }

  // ── Add Image ──────────────────────────────────────────────
  async addImage(productId, imageData, altText, isPrimary) {
    const countRes = await db.query(`SELECT COUNT(*) FROM product_images WHERE product_id = $1`, [productId]);
    const order = Number(countRes.rows[0].count);

    if (isPrimary) {
      await db.query(`UPDATE product_images SET is_primary = false WHERE product_id = $1`, [productId]);
    }

    const res = await db.query(
      `INSERT INTO product_images (product_id, image_data, alt_text, display_order, is_primary)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [productId, imageData, altText || '', order, isPrimary ?? order === 0]
    );

    return { id: res.rows[0].id, imageData, altText, displayOrder: order };
  }

  // ── Remove Image ───────────────────────────────────────────
  async removeImage(productId, imageId) {
    await db.query(`DELETE FROM product_images WHERE id = $1 AND product_id = $2`, [imageId, productId]);
    return true;
  }
}

module.exports = new ProductService();
