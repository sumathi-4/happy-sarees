const db = require('../../db');
const { slugify, uniqueSlug } = require('../../utils/slugify');
const productService = require('../admin/productService');

/**
 * List products belonging to a seller, with status count metadata
 */
async function getSellerProducts(sellerId, filters = {}) {
  const { status, search } = filters;
  let query = `
    SELECT p.*, c.name as category_name,
           (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1) as cover_image
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.seller_id = $1
  `;
  const params = [sellerId];

  if (status) {
    params.push(status);
    query += ` AND p.approval_status = $${params.length}`;
  }

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length})`;
  }

  query += ` ORDER BY p.created_at DESC`;

  const res = await db.query(query, params);

  // Return mapped products with correct keys for frontend compatibility
  return res.rows.map(r => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    sku: r.sku,
    price: Number(r.price),
    originalPrice: r.original_price ? Number(r.original_price) : null,
    stockCount: r.stock_count,
    inStock: r.in_stock,
    categoryName: r.category_name,
    categoryId: r.category_id,
    fabric: r.fabric,
    color: r.color,
    weave: r.weave,
    border: r.border,
    pallu: r.pallu,
    occasion: r.occasion,
    description: r.description,
    approvalStatus: r.approval_status,
    rejectionReason: r.rejection_reason,
    image: r.cover_image || 'https://via.placeholder.com/300x400?text=No+Image',
  }));
}

/**
 * Get single seller product with all images and specifications
 */
async function getSellerProductById(sellerId, productId) {
  const [prod, images, seo, specs] = await Promise.all([
    db.query(
      `SELECT p.*, c.name as category_name
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.seller_id = $1 AND p.id = $2`,
      [sellerId, productId]
    ),
    db.query(
      `SELECT image_url, display_order, is_primary FROM product_images WHERE product_id = $1 ORDER BY is_primary DESC, display_order ASC`,
      [productId]
    ),
    db.query(`SELECT * FROM product_seo WHERE product_id = $1`, [productId]),
    db.query(
      `SELECT ps.master_type_id, ps.master_value_id, mt.name as master_type_name, mt.slug as master_type_slug, 
              mt.show_in_specifications, mi.name as master_value_name, ps.custom_value
       FROM product_specifications ps
       JOIN master_types mt ON ps.master_type_id = mt.id
       LEFT JOIN master_items mi ON ps.master_value_id = mi.id
       WHERE ps.product_id = $1 AND mt.is_active = true`,
      [productId]
    )
  ]);

  if (prod.rows.length === 0) {
    throw new Error('Product not found or not owned by you.');
  }

  const product = prod.rows[0];
  const imgUrls = images.rows.map(img => img.image_url).filter(Boolean);
  const primaryImgObj = images.rows.find(img => img.is_primary);
  const coverImage = primaryImgObj ? primaryImgObj.image_url : (imgUrls[0] || null);

  const seoData = seo.rows[0] || {};

  const specificationsList = specs.rows.map(r => ({
    master_type_id: r.master_type_id,
    master_value_id: r.master_value_id,
    master_type_name: r.master_type_name,
    master_type_slug: r.master_type_slug,
    show_in_specifications: r.show_in_specifications,
    value: r.master_value_name || r.custom_value
  }));

  const customData = {};
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
    ...product,
    specifications: specificationsList,
    customMasterData: customData,
    custom_master_data: customData,
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    price: Number(product.price),
    originalPrice: product.original_price ? Number(product.original_price) : null,
    mrp: product.original_price ? Number(product.original_price) : Number(product.price),
    stockCount: product.stock_count,
    stock: product.stock_count,
    inStock: product.in_stock,
    categoryName: product.category_name,
    categoryId: product.category_id,
    fabric: product.fabric,
    color: product.color,
    weave: product.weave,
    border: product.border,
    pallu: product.pallu,
    occasion: product.occasion,
    description: product.description,
    fullDescription: product.description || '',
    shortDescription: product.short_description || '',
    short_description: product.short_description || '',
    approvalStatus: product.approval_status,
    rejectionReason: product.rejection_reason,
    blouseIncluded: product.blouse_included,
    blouseSize: product.blouse_size,
    height: product.height,
    width: product.width,
    weight: product.weight,
    images: imgUrls,
    coverImage: coverImage || 'https://via.placeholder.com/300x400?text=No+Image',
    videoUrl: product.video_url || '',
    video_url: product.video_url || '',
    videoData: product.video_data || '',
    video_data: product.video_data || '',
    newArrival: Boolean(product.is_new_arrival),
    isNewArrival: Boolean(product.is_new_arrival),
    is_new_arrival: Boolean(product.is_new_arrival),
    seoTitle: seoData.meta_title || `${product.name} | Happy Sarees`,
    metaDescription: seoData.meta_description || product.short_description || product.description || ''
  };
}

/**
 * Create a new product for a seller
 */
async function createSellerProduct(sellerId, data) {
  const base = slugify(data.name);
  const slug = await uniqueSlug(
    async s => (await db.query(`SELECT id FROM products WHERE slug = $1`, [s])).rows.length > 0,
    base
  );

  const stockCount = Number(data.stockCount ?? data.stock ?? 0);
  const inStock = stockCount > 0;
  const autoSku = data.sku || `HS-SEL-${Math.floor(100000 + Math.random() * 900000)}`;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const productQuery = `
      INSERT INTO products (
        name, slug, category_id, description, short_description, price, original_price,
        fabric, color, weave, border, pallu, occasion,
        blouse_included, blouse_size, height, width, weight,
        sku, in_stock, stock_count,
        seller_id, approval_status, status, submitted_at,
        video_url, is_new_arrival
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, 'pending', 'draft', CURRENT_TIMESTAMP, $23, $24)
      RETURNING id
    `;
    const productValues = [
      data.name, slug, data.categoryId || null, data.description, data.shortDescription || data.short_description || null, data.price, data.originalPrice || null,
      data.fabric, data.color, data.weave, data.border, data.pallu, data.occasion,
      data.blouseIncluded ?? true, data.blouseSize || null, data.height || '5.5m', data.width || '1.1m', data.weight || null,
      autoSku, inStock, stockCount,
      sellerId,
      data.videoUrl || data.video_url || null,
      data.isNewArrival ?? data.newArrival ?? data.is_new_arrival ?? true
    ];

    const productRes = await client.query(productQuery, productValues);
    const productId = productRes.rows[0].id;

    // Handle multiple images
    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        const isPrimary = i === 0;
        await client.query(
          `INSERT INTO product_images (product_id, image_url, display_order, is_primary) VALUES ($1, $2, $3, $4)`,
          [productId, data.images[i], i, isPrimary]
        );
      }
    }

    // Add seller notification
    await client.query(
      `INSERT INTO seller_notifications (seller_id, type, title, message)
       VALUES ($1, 'product_status', $2, $3)`,
      [
        sellerId,
        'Product Submitted for Approval',
        `Your product "${data.name}" is successfully submitted. It will appear on store after admin approval.`
      ]
    );

    // Add admin notification
    await client.query(
      `INSERT INTO admin_notifications (type, title, message, entity_type, entity_id)
       VALUES ('product_approval', 'Product Approval Needed', $1, 'product', $2)`,
      [`Product "${data.name}" submitted by seller ID ${sellerId} is pending approval`, productId]
    );

    // Sync product specifications
    await productService.syncProductSpecifications(productId, data);

    await client.query('COMMIT');
    return productId;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Update an existing product for a seller
 */
async function updateSellerProduct(sellerId, productId, data) {
  // Check ownership
  const checkRes = await db.query('SELECT id, name, stock_count, price, original_price FROM products WHERE id = $1 AND seller_id = $2', [productId, sellerId]);
  if (checkRes.rows.length === 0) {
    throw new Error('Product not found or not owned by you.');
  }

  const current = checkRes.rows[0];

  // Compare if any non-trivial attributes are changing
  // Trivial allow-list: stock_count, in_stock (we allow these without changing approval_status back to pending)
  const isTrivialOnly = 
    (data.stockCount !== undefined && Number(data.stockCount) !== current.stock_count) &&
    Object.keys(data).every(k => k === 'stockCount' || k === 'stock' || k === 'inStock' || k === 'images'); // Allow inventory and image edits separately or specify triggers

  // Wait, let's keep it safe. If they edit name, description, categoryId, price, fabric, color, weave etc, we reset approval to pending.
  const requiresReapproval = !isTrivialOnly;

  const stockCount = data.stockCount !== undefined ? Number(data.stockCount) : current.stock_count;
  const inStock = stockCount > 0;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Update query
    let updateQuery = `
      UPDATE products SET
        stock_count = $3,
        in_stock = $4,
        updated_at = CURRENT_TIMESTAMP
    `;
    const params = [productId, sellerId, stockCount, inStock];

    if (requiresReapproval) {
      params.push(
        data.name, data.categoryId || null, data.description, data.shortDescription || data.short_description || null, data.price, data.originalPrice || null,
        data.fabric, data.color, data.weave, data.border, data.pallu, data.occasion,
        data.blouseIncluded ?? true, data.blouseSize || null, data.height || '5.5m', data.width || '1.1m', data.weight || null,
        data.sku || current.sku,
        data.videoUrl || data.video_url || null,
        data.isNewArrival ?? data.newArrival ?? data.is_new_arrival ?? true
      );
      updateQuery += `,
        name = $5,
        category_id = $6,
        description = $7,
        short_description = $8,
        price = $9,
        original_price = $10,
        fabric = $11,
        color = $12,
        weave = $13,
        border = $14,
        pallu = $15,
        occasion = $16,
        blouse_included = $17,
        blouse_size = $18,
        height = $19,
        width = $20,
        weight = $21,
        sku = $22,
        video_url = $23,
        is_new_arrival = $24,
        approval_status = 'pending',
        rejection_reason = NULL,
        submitted_at = CURRENT_TIMESTAMP
      `;
    }

    updateQuery += ` WHERE id = $1 AND seller_id = $2`;
    await client.query(updateQuery, params);

    // Replace images if provided
    if (data.images && Array.isArray(data.images)) {
      await client.query('DELETE FROM product_images WHERE product_id = $1', [productId]);
      for (let i = 0; i < data.images.length; i++) {
        const isPrimary = i === 0;
        await client.query(
          `INSERT INTO product_images (product_id, image_url, display_order, is_primary) VALUES ($1, $2, $3, $4)`,
          [productId, data.images[i], i, isPrimary]
        );
      }
    }

    if (requiresReapproval) {
      // Notification
      await client.query(
        `INSERT INTO seller_notifications (seller_id, type, title, message)
         VALUES ($1, 'product_status', $2, $3)`,
        [
          sellerId,
          'Product Edited — Pending Approval',
          `Your edits to "${data.name || current.name}" require administrative review. It is temporarily pending approval.`
        ]
      );
    }

    // Sync product specifications
    await productService.syncProductSpecifications(productId, data);

    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Delete a seller's product
 */
async function deleteSellerProduct(sellerId, productId) {
  const check = await db.query('SELECT id FROM products WHERE id = $1 AND seller_id = $2', [productId, sellerId]);
  if (check.rows.length === 0) {
    throw new Error('Product not found or not owned by you.');
  }

  // Non-destructive check: does the system support soft delete or hard delete?
  // Let's do a hard delete or set seller_id = NULL / status = 'deleted' depending on foreign keys.
  // Wait, schema.sql product_images has INT REFERENCES products(id) ON DELETE CASCADE, wishlist is CASCADE, cart_items is CASCADE.
  // So we can safely execute DELETE FROM products.
  await db.query('DELETE FROM products WHERE id = $1 AND seller_id = $2', [productId, sellerId]);
  return true;
}

module.exports = {
  getSellerProducts,
  getSellerProductById,
  createSellerProduct,
  updateSellerProduct,
  deleteSellerProduct
};
