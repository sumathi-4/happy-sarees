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
      SELECT p.*, c.name as category_name, s.meta_title, s.meta_description,
             (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id = p.id) as total_sold
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_seo s ON s.product_id = p.id
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

    const products = data.rows.map(r => {
      let customData = {};
      if (r.custom_master_data) {
        if (typeof r.custom_master_data === 'string') {
          try { customData = JSON.parse(r.custom_master_data); } catch(e) { customData = {}; }
        } else if (typeof r.custom_master_data === 'object') {
          customData = r.custom_master_data;
        }
      }

      return {
        ...customData,
        id:           r.id,
        name:         r.name,
        slug:         r.slug,
        sku:          r.sku,
        shortDescription: r.short_description || '',
        fullDescription: r.description || '',
        description:  r.description || '',
        seoTitle:     r.meta_title || `${r.name} | Happy Sarees`,
        metaDescription: r.meta_description || r.short_description || r.description || '',
        washCare:     r.wash_care || 'Dry Clean Only',
        wash_care:    r.wash_care || 'Dry Clean Only',
        price:        Number(r.price),
        originalPrice: r.original_price ? Number(r.original_price) : null,
        mrp:          r.original_price ? Number(r.original_price) : Number(r.price),
        discountPercentage: (r.original_price && Number(r.original_price) > Number(r.price))
          ? Math.round(((Number(r.original_price) - Number(r.price)) / Number(r.original_price)) * 100)
          : (r.discount_percentage ? Number(r.discount_percentage) : 0),
        discount_percentage: (r.original_price && Number(r.original_price) > Number(r.price))
          ? Math.round(((Number(r.original_price) - Number(r.price)) / Number(r.original_price)) * 100)
          : (r.discount_percentage ? Number(r.discount_percentage) : 0),
        fabric:       r.fabric,
        color:        r.color,
        pattern:      r.pattern,
        weave:        r.weave,
        border:       r.border,
        occasion:     r.occasion,
        blouseIncluded: r.blouse_included,
        blouseSize:   r.blouse_size,
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
        rating:       r.rating !== null && r.rating !== undefined ? Number(r.rating) : 0,
        reviewCount:  r.review_count !== null && r.review_count !== undefined ? Number(r.review_count) : 0,
        totalSold:    Number(r.total_sold || 0),
        image:        (imagesMap[r.id] || [])[0] || null,
        images:       imagesMap[r.id] || [],
        galleryImages: imagesMap[r.id] || [],
        videoUrl:     r.video_url || null,
        videoData:    r.video_data || null,
        video_url:    r.video_url || null,
        video_data:   r.video_data || null,
        customMasterData: customData,
        custom_master_data: customData,
        createdAt:    r.created_at,
        updatedAt:    r.updated_at,
      };
    });

    return { products, total: Number(count.rows[0].count), page, limit };
  }

  // ── Get Single Product ─────────────────────────────────────
  async getById(id) {
    const [prod, images, seo, specs] = await Promise.all([
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
      db.query(
        `SELECT ps.master_type_id, ps.master_value_id, mt.name as master_type_name, mt.slug as master_type_slug, 
                mt.show_in_specifications, mi.name as master_value_name, ps.custom_value
         FROM product_specifications ps
         JOIN master_types mt ON ps.master_type_id = mt.id
         LEFT JOIN master_items mi ON ps.master_value_id = mi.id
         WHERE ps.product_id = $1 AND mt.is_active = true`,
        [id]
      )
    ]);

    if (prod.rows.length === 0) throw { status: 404, message: 'Product not found.' };

    const p = prod.rows[0];
    const imgUrls = images.rows.map(img => img.image_data || img.image_url).filter(Boolean);
    const primaryImgObj = images.rows.find(img => img.is_primary);
    const coverImage = primaryImgObj ? (primaryImgObj.image_data || primaryImgObj.image_url) : (imgUrls[0] || null);

    const seoData = seo.rows[0] || {};

    let customData = {};
    if (p.custom_master_data) {
      if (typeof p.custom_master_data === 'string') {
        try { customData = JSON.parse(p.custom_master_data); } catch(e) { customData = {}; }
      } else if (typeof p.custom_master_data === 'object') {
        customData = p.custom_master_data;
      }
    }

    const specificationsList = specs.rows.map(r => ({
      master_type_id: r.master_type_id,
      master_value_id: r.master_value_id,
      master_type_name: r.master_type_name,
      master_type_slug: r.master_type_slug,
      show_in_specifications: r.show_in_specifications,
      value: r.master_value_name || r.custom_value
    }));

    specs.rows.forEach(r => {
      const valName = r.master_value_name || r.custom_value;
      if (valName) {
        customData[r.master_type_id] = valName;
        customData[r.master_type_slug] = valName;
        customData[r.master_type_name] = valName;
        const singular = r.master_type_slug.endsWith('s') ? r.master_type_slug.slice(0, -1) : r.master_type_slug;
        customData[singular] = valName;
        customData[singular.replace(/-/g, '_')] = valName;
      }
    });

    return {
      ...customData,
      ...p,
      specifications: specificationsList,
      customMasterData: customData,
      custom_master_data: customData,
      mrp: p.original_price ? Number(p.original_price) : Number(p.price),
      stock: p.stock_count,
      shortDescription: p.short_description || '',
      fullDescription: p.description || '',
      description: p.description || '',
      seoTitle: seoData.meta_title || `${p.name} | Happy Sarees`,
      metaDescription: seoData.meta_description || p.short_description || p.description || '',
      washCare: p.wash_care || 'Dry Clean Only',
      wash_care: p.wash_care || 'Dry Clean Only',
      blouseIncluded: p.blouse_included ?? true,
      sareeLength: p.height || '5.5m',
      sareeWidth: p.width || '1.1m',
      isTrending: p.is_trending || false,
      trendingProduct: p.is_trending || false,
      bestSeller: p.is_best_seller,
      newArrival: p.is_new_arrival,
      showOnHomepage: p.featured_on_homepage,
      image: coverImage,
      images: imgUrls,
      galleryImages: imgUrls,
      videoUrl: p.video_url || null,
      videoData: p.video_data || null,
      video_url: p.video_url || null,
      video_data: p.video_data || null,
      seo: seoData,
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

    const autoSku = (data.sku && data.sku.trim() !== '') 
      ? data.sku 
      : `HS-${(data.name || 'SAREE').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'SAREE'}-${Math.floor(1000 + Math.random() * 9000)}`;

    const descToSave = (data.description && data.description.trim() !== '') 
      ? data.description 
      : ((data.fullDescription && data.fullDescription.trim() !== '') ? data.fullDescription : '');

    const shortDescToSave = (data.shortDescription && data.shortDescription.trim() !== '') 
      ? data.shortDescription 
      : (data.short_description || '');

    const washCareToSave = data.washCare || data.wash_care || 'Dry Clean Only';

    const customMasterData = { ...(data.customMasterData || data.custom_master_data || {}) };
    const standardKeys = [
      'id','name','slug','categoryId','category_id','description','shortDescription','short_description',
      'price','originalPrice','mrp','fabric','color','pattern','weave','border','pallu','occasion',
      'blouseIncluded','blouse_included','blouseSize','blouse_size','height','sareeLength','sareeWidth',
      'width','weight','washCare','wash_care','sku','inStock','in_stock','stockCount','stock','isBestSeller',
      'bestSeller','isNewArrival','newArrival','featuredOnHomepage','showOnHomepage','isTrending',
      'trendingProduct','status','rating','reviewCount','totalSold','videoUrl','videoData','video_url',
      'video_data','image','images','galleryImages','seo','seoTitle','metaDescription','customMasterData','custom_master_data'
    ];
    Object.keys(data || {}).forEach(k => {
      if (!standardKeys.includes(k) && data[k] !== undefined && data[k] !== null && String(data[k]).trim() !== '') {
        customMasterData[k] = data[k];
      }
    });

    const res = await db.query(
      `INSERT INTO products (
        name, slug, category_id, description, short_description, price, original_price,
        fabric, color, weave, border, pallu, occasion,
        blouse_included, blouse_size, height, width, weight, wash_care,
        sku, in_stock, stock_count, is_best_seller, is_new_arrival,
        featured_on_homepage, is_trending, status, rating, review_count,
        video_url, video_data, custom_master_data
       ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32
       ) RETURNING id`,
      [
        data.name, slug, data.categoryId || null,
        descToSave,
        shortDescToSave,
        data.price, data.originalPrice || data.mrp || null,
        data.fabric, data.color, data.weave, data.border, data.pallu, data.occasion,
        data.blouseIncluded ?? true, data.blouseSize, data.height || data.sareeLength, data.width || data.sareeWidth, data.weight, washCareToSave,
        autoSku, inStock, stockCount,
        data.isBestSeller ?? data.bestSeller ?? false, data.isNewArrival ?? data.newArrival ?? false,
        data.featuredOnHomepage ?? data.showOnHomepage ?? false,
        data.isTrending ?? data.trendingProduct ?? false,
        data.status || 'published',
        data.rating || 4.8, data.reviewCount || 0,
        data.videoUrl ?? data.video_url ?? null, data.videoData ?? data.video_data ?? null,
        JSON.stringify(customMasterData)
      ]
    );

    const { uploadToCloudinary } = require('../cloudinaryService');

    const productId = res.rows[0].id;

    // Insert images
    const imagesList = data.images || data.galleryImages || [];
    if (Array.isArray(imagesList)) {
      for (let i = 0; i < imagesList.length; i++) {
        const img = imagesList[i];
        const rawStr = typeof img === 'string' ? img : (img ? (img.url || img.image_url || img.data || img.image_data) : null);
        if (!rawStr) continue;
        const strVal = await uploadToCloudinary(rawStr);
        const isCover = data.image ? (rawStr === data.image || strVal === data.image) : (i === 0);
        await db.query(
          `INSERT INTO product_images (product_id, image_url, image_data, alt_text, display_order, is_primary)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [productId, strVal, null, data.name, i, isCover]
        );
      }
    }

    // Insert SEO
    if (data.seo || data.seoTitle || data.metaDescription) {
      const metaTitle = data.seoTitle || data.seo?.metaTitle || `${data.name} | Happy Sarees`;
      const metaDesc = data.metaDescription || data.seo?.metaDescription || data.shortDescription || descToSave;
      await db.query(
        `INSERT INTO product_seo (product_id, meta_title, meta_description)
         VALUES ($1,$2,$3) ON CONFLICT (product_id) DO UPDATE
         SET meta_title=$2, meta_description=$3`,
        [productId, metaTitle, metaDesc]
      );
    }

    // Sync product_specifications table (master_type_id & master_value_id)
    await this.syncProductSpecifications(productId, data);

    return this.getById(productId);
  }

  // ── Update Product ─────────────────────────────────────────
  async update(id, data) {
    const existing = await this.getById(id);

    const stockCount = Number(data.stockCount ?? data.stock ?? existing.stock_count);
    const inStock = stockCount > 0;

    const finalVideoUrl = data.videoUrl !== undefined ? data.videoUrl : (data.video_url !== undefined ? data.video_url : existing.video_url);
    const finalVideoData = data.videoData !== undefined ? data.videoData : (data.video_data !== undefined ? data.video_data : existing.video_data);

    const descToSave = data.description !== undefined && data.description !== null && data.description !== ''
      ? data.description 
      : (data.fullDescription !== undefined && data.fullDescription !== null && data.fullDescription !== '' ? data.fullDescription : existing.description);

    const shortDescToSave = data.shortDescription !== undefined && data.shortDescription !== null
      ? data.shortDescription 
      : (data.short_description !== undefined && data.short_description !== null ? data.short_description : existing.short_description);

    const washCareToSave = (data.washCare && data.washCare.trim() !== '')
      ? data.washCare
      : (data.wash_care || existing.wash_care || 'Dry Clean Only');

    const customMasterData = data.customMasterData !== undefined 
      ? { ...data.customMasterData }
      : (data.custom_master_data !== undefined ? { ...data.custom_master_data } : { ...(existing.custom_master_data || {}) });

    const standardKeysUpdate = [
      'id','name','slug','categoryId','category_id','description','shortDescription','short_description',
      'price','originalPrice','mrp','fabric','color','pattern','weave','border','pallu','occasion',
      'blouseIncluded','blouse_included','blouseSize','blouse_size','height','sareeLength','sareeWidth',
      'width','weight','washCare','wash_care','sku','inStock','in_stock','stockCount','stock','isBestSeller',
      'bestSeller','isNewArrival','newArrival','featuredOnHomepage','showOnHomepage','isTrending',
      'trendingProduct','status','rating','reviewCount','totalSold','videoUrl','videoData','video_url',
      'video_data','image','images','galleryImages','seo','seoTitle','metaDescription','customMasterData','custom_master_data'
    ];
    Object.keys(data || {}).forEach(k => {
      if (!standardKeysUpdate.includes(k) && data[k] !== undefined && data[k] !== null && String(data[k]).trim() !== '') {
        customMasterData[k] = data[k];
      }
    });

    const res = await db.query(
      `UPDATE products SET
        name=$1, category_id=$2, description=$3, short_description=$4, price=$5, original_price=$6,
        fabric=$7, color=$8, weave=$9, border=$10, pallu=$11, occasion=$12,
        blouse_included=$13, blouse_size=$14, height=$15, width=$16, weight=$17, wash_care=$18,
        sku=$19, in_stock=$20, stock_count=$21, is_best_seller=$22, is_new_arrival=$23,
        featured_on_homepage=$24, is_trending=$25, status=$26, video_url=$27, video_data=$28,
        custom_master_data=$29, updated_at=NOW()
       WHERE id=$30 AND deleted_at IS NULL
       RETURNING id`,
      [
        data.name ?? existing.name,
        data.categoryId ?? existing.category_id,
        descToSave,
        shortDescToSave,
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
        washCareToSave,
        data.sku ?? existing.sku,
        inStock,
        stockCount,
        data.isBestSeller ?? data.bestSeller ?? existing.is_best_seller,
        data.isNewArrival ?? data.newArrival ?? existing.is_new_arrival,
        data.featuredOnHomepage ?? data.showOnHomepage ?? existing.featured_on_homepage,
        data.isTrending ?? data.trendingProduct ?? existing.is_trending ?? false,
        data.status ?? existing.status,
        finalVideoUrl,
        finalVideoData,
        JSON.stringify(customMasterData),
        id,
      ]
    );

    if (res.rows.length === 0) throw { status: 404, message: 'Product not found.' };

    // Update images if cover image or gallery list provided
    const rawCover = data.image;
    let imagesList = [];
    if (Array.isArray(data.galleryImages) && data.galleryImages.length > 0) {
      imagesList = [...data.galleryImages];
    } else if (Array.isArray(data.images) && data.images.length > 0) {
      imagesList = [...data.images];
    }

    if (rawCover && !imagesList.includes(rawCover)) {
      imagesList.unshift(rawCover);
    }

    if (imagesList.length > 0) {
      await db.query(`DELETE FROM product_images WHERE product_id = $1`, [id]);
      const { uploadToCloudinary } = require('../cloudinaryService');
      for (let i = 0; i < imagesList.length; i++) {
        const img = imagesList[i];
        const rawStr = typeof img === 'string' ? img : (img ? (img.url || img.image_url || img.data || img.image_data) : null);
        if (!rawStr || typeof rawStr !== 'string' || rawStr.trim() === '') continue;

        let strVal = rawStr;
        try {
          strVal = await uploadToCloudinary(rawStr);
        } catch (cErr) {
          console.error('[productService.update] Cloudinary upload error:', cErr.message);
        }

        if (!strVal) continue;

        const isCover = (rawCover && (rawStr === rawCover || strVal === rawCover)) || (i === 0);
        await db.query(
          `INSERT INTO product_images (product_id, image_url, image_data, alt_text, display_order, is_primary)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [id, strVal, null, data.name || existing.name, i, isCover]
        );
      }
    }

    // Update SEO
    if (data.seo || data.seoTitle || data.metaDescription) {
      const metaTitle = data.seoTitle || data.seo?.metaTitle || existing.seoTitle || `${data.name || existing.name} | Happy Sarees`;
      const metaDesc = data.metaDescription || data.seo?.metaDescription || existing.metaDescription || data.shortDescription || data.fullDescription || '';
      await db.query(
        `INSERT INTO product_seo (product_id, meta_title, meta_description)
         VALUES ($1,$2,$3) ON CONFLICT (product_id) DO UPDATE
         SET meta_title=$2, meta_description=$3, updated_at=NOW()`,
        [id, metaTitle, metaDesc]
      );
    }

    // Sync product_specifications table (master_type_id & master_value_id)
    await this.syncProductSpecifications(id, data);

    return this.getById(id);
  }

  // ── Sync Product Specifications Table ─────────────────────────────
  async syncProductSpecifications(productId, data) {
    try {
      const allTypesRes = await db.query(`SELECT id, name, slug FROM master_types WHERE is_active = true`);
      const customMasterData = { ...(data.customMasterData || data.custom_master_data || {}) };

      for (const t of allTypesRes.rows) {
        const slug = (t.slug || '').toLowerCase().trim();
        const slugUnderscore = slug.replace(/-/g, '_');
        const singularSlug = slug.endsWith('s') ? slug.slice(0, -1) : slug;
        const singularUnderscore = singularSlug.replace(/-/g, '_');

        const val = 
          data[t.id] ??
          data[t.name] ??
          data[slug] ??
          data[slugUnderscore] ??
          data[singularSlug] ??
          data[singularUnderscore] ??
          customMasterData[t.id] ??
          customMasterData[t.name] ??
          customMasterData[slug] ??
          customMasterData[slugUnderscore] ??
          customMasterData[singularSlug] ??
          customMasterData[singularUnderscore];

        if (val !== undefined && val !== null && val !== '') {
          let masterValueId = null;
          let customValue = null;

          if (typeof val === 'number') {
            masterValueId = val;
            const itemRes = await db.query(`SELECT name FROM master_items WHERE id = $1`, [masterValueId]);
            if (itemRes.rows.length > 0) customValue = itemRes.rows[0].name;
          } else if (typeof val === 'string' && val.trim() !== '') {
            customValue = val.trim();
            const itemRes = await db.query(
              `SELECT id FROM master_items WHERE type_id = $1 AND (LOWER(name) = LOWER($2) OR slug = $3)`,
              [t.id, customValue, slugify(customValue)]
            );
            if (itemRes.rows.length > 0) masterValueId = itemRes.rows[0].id;
          }

          if (masterValueId || customValue) {
            await db.query(
              `INSERT INTO product_specifications (product_id, master_type_id, master_value_id, custom_value)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (product_id, master_type_id) DO UPDATE
               SET master_value_id = EXCLUDED.master_value_id, custom_value = EXCLUDED.custom_value, updated_at = NOW()`,
              [productId, t.id, masterValueId, customValue]
            );
          }
        }
      }
    } catch (err) {
      console.error('[productService.syncProductSpecifications] Error:', err.message);
    }
  }

  // ── Permanent Hard Delete ──────────────────────────────────
  async delete(id) {
    await db.query(`DELETE FROM product_images WHERE product_id = $1`, [id]);
    await db.query(`DELETE FROM product_seo WHERE product_id = $1`, [id]);
    const res = await db.query(
      `DELETE FROM products WHERE id = $1 RETURNING id`,
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
      await db.query(`DELETE FROM product_images WHERE product_id IN (${placeholders})`, ids);
      await db.query(`DELETE FROM product_seo WHERE product_id IN (${placeholders})`, ids);
      await db.query(`DELETE FROM products WHERE id IN (${placeholders})`, ids);
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
