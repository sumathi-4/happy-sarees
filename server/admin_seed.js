// ============================================================
//  admin_seed.js — Seed default admin data
//  Run: node admin_seed.js
// ============================================================

const fs   = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db   = require('./db');

async function seedAdmin() {
  try {
    console.log('\n🚀 Starting Happy Sarees Admin Database Seeding...\n');

    // ── 1. Apply Admin Schema ────────────────────────────────
    const schema = fs.readFileSync(path.join(__dirname, 'admin_schema.sql'), 'utf-8');
    await db.query(schema);
    console.log('✅ Admin schema applied (all tables created/updated).');

    // ── 2. Admin Roles ───────────────────────────────────────
    const roles = [
      { name: 'Super Admin',      description: 'Full unrestricted access to all features',     is_system: true },
      { name: 'Admin',            description: 'Access to most admin features',                 is_system: true },
      { name: 'Manager',          description: 'Manage products, orders, and customers',        is_system: false },
      { name: 'Editor',           description: 'Manage products and homepage content only',     is_system: false },
      { name: 'Customer Support', description: 'View orders and respond to customer queries',   is_system: false },
    ];

    const roleIds = {};
    for (const r of roles) {
      const res = await db.query(
        `INSERT INTO admin_roles (name, description, is_system)
         VALUES ($1, $2, $3)
         ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
         RETURNING id, name`,
        [r.name, r.description, r.is_system]
      );
      roleIds[r.name] = res.rows[0].id;
    }
    console.log('✅ Admin roles seeded.');

    // ── 3. Permissions ────────────────────────────────────────
    const modules = ['dashboard','products','homepage_cms','orders','customers','coupons','reports','settings','master_data','notifications'];

    // Super Admin — all true
    for (const mod of modules) {
      await db.query(
        `INSERT INTO admin_permissions (role_id, module, can_view, can_create, can_edit, can_delete, can_manage)
         VALUES ($1, $2, true, true, true, true, true)
         ON CONFLICT (role_id, module) DO UPDATE
           SET can_view=true, can_create=true, can_edit=true, can_delete=true, can_manage=true`,
        [roleIds['Super Admin'], mod]
      );
    }

    // Admin — all true
    for (const mod of modules) {
      await db.query(
        `INSERT INTO admin_permissions (role_id, module, can_view, can_create, can_edit, can_delete, can_manage)
         VALUES ($1, $2, true, true, true, true, true)
         ON CONFLICT (role_id, module) DO UPDATE
           SET can_view=true, can_create=true, can_edit=true, can_delete=true, can_manage=true`,
        [roleIds['Admin'], mod]
      );
    }

    // Manager — no settings, no delete on most
    const managerPerms = {
      dashboard: [true, false, false, false, false],
      products:  [true, true, true, false, false],
      homepage_cms: [true, true, true, false, false],
      orders:    [true, false, true, false, true],
      customers: [true, false, true, false, false],
      coupons:   [true, true, true, false, false],
      reports:   [true, false, false, false, false],
      settings:  [false, false, false, false, false],
      master_data: [true, true, true, false, false],
      notifications: [true, false, false, true, false],
    };
    for (const [mod, perms] of Object.entries(managerPerms)) {
      await db.query(
        `INSERT INTO admin_permissions (role_id, module, can_view, can_create, can_edit, can_delete, can_manage)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (role_id, module) DO UPDATE
           SET can_view=$3, can_create=$4, can_edit=$5, can_delete=$6, can_manage=$7`,
        [roleIds['Manager'], mod, ...perms]
      );
    }

    // Editor — only products and CMS
    const editorPerms = {
      dashboard: [true, false, false, false, false],
      products:  [true, true, true, false, false],
      homepage_cms: [true, true, true, false, false],
      orders:    [true, false, false, false, false],
      customers: [false, false, false, false, false],
      coupons:   [false, false, false, false, false],
      reports:   [false, false, false, false, false],
      settings:  [false, false, false, false, false],
      master_data: [true, true, true, false, false],
      notifications: [true, false, false, false, false],
    };
    for (const [mod, perms] of Object.entries(editorPerms)) {
      await db.query(
        `INSERT INTO admin_permissions (role_id, module, can_view, can_create, can_edit, can_delete, can_manage)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (role_id, module) DO UPDATE
           SET can_view=$3, can_create=$4, can_edit=$5, can_delete=$6, can_manage=$7`,
        [roleIds['Editor'], mod, ...perms]
      );
    }

    // Customer Support — only view orders, customers
    const supportPerms = {
      dashboard:  [true, false, false, false, false],
      products:   [true, false, false, false, false],
      homepage_cms:[false, false, false, false, false],
      orders:     [true, false, true, false, false],
      customers:  [true, false, false, false, false],
      coupons:    [true, false, false, false, false],
      reports:    [true, false, false, false, false],
      settings:   [false, false, false, false, false],
      master_data:[false, false, false, false, false],
      notifications:[true, false, false, false, false],
    };
    for (const [mod, perms] of Object.entries(supportPerms)) {
      await db.query(
        `INSERT INTO admin_permissions (role_id, module, can_view, can_create, can_edit, can_delete, can_manage)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (role_id, module) DO UPDATE
           SET can_view=$3, can_create=$4, can_edit=$5, can_delete=$6, can_manage=$7`,
        [roleIds['Customer Support'], mod, ...perms]
      );
    }
    console.log('✅ Role permissions seeded.');

    // ── 4. Default Super Admin User ──────────────────────────
    const passwordHash = await bcrypt.hash('Admin@2026', 12);
    await db.query(
      `INSERT INTO admin_users (name, email, password_hash, phone, role_id, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       ON CONFLICT (email) DO NOTHING`,
      ['Super Admin', 'admin@happysarees.com', passwordHash, '+91 98765 43210', roleIds['Super Admin']]
    );
    console.log('✅ Default Super Admin created (admin@happysarees.com / Admin@2026).');

    // ── 5. Master Types ───────────────────────────────────────
    const masterTypes = [
      { name: 'Fabrics',      slug: 'fabrics',      icon: '🧵', sort: 1 },
      { name: 'Occasions',    slug: 'occasions',    icon: '🎉', sort: 2 },
      { name: 'Colors',       slug: 'colors',       icon: '🎨', sort: 3 },
      { name: 'Patterns',     slug: 'patterns',     icon: '🔷', sort: 4 },
      { name: 'Weaves',       slug: 'weaves',       icon: '🕸', sort: 5 },
      { name: 'Borders',      slug: 'borders',      icon: '📏', sort: 6 },
      { name: 'Brands',       slug: 'brands',       icon: '🏷️',  sort: 7 },
      { name: 'Collections',  slug: 'collections',  icon: '📦', sort: 8 },
    ];

    const typeIds = {};
    for (const t of masterTypes) {
      const res = await db.query(
        `INSERT INTO master_types (name, slug, icon, sort_order)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
         RETURNING id, slug`,
        [t.name, t.slug, t.icon, t.sort]
      );
      typeIds[t.slug] = res.rows[0].id;
    }
    console.log('✅ Master types seeded.');

    // ── 6. Master Items ───────────────────────────────────────
    const masterItems = {
      fabrics: ['Silk','Organza','Cotton','Chiffon','Georgette','Crepe','Linen','Chanderi','Tussar','Banarasi'],
      occasions: ['Bridal','Wedding','Festive','Party','Casual','Daily Wear','Office','Puja','Reception','Anniversary'],
      colors: [
        { name: 'Red',      hex: '#DC2626' },
        { name: 'Magenta',  hex: '#C026D3' },
        { name: 'Pink',     hex: '#EC4899' },
        { name: 'Green',    hex: '#16A34A' },
        { name: 'Blue',     hex: '#2563EB' },
        { name: 'Yellow',   hex: '#EAB308' },
        { name: 'Orange',   hex: '#EA580C' },
        { name: 'Purple',   hex: '#7C3AED' },
        { name: 'White',    hex: '#FFFFFF' },
        { name: 'Black',    hex: '#000000' },
        { name: 'Gold',     hex: '#D97706' },
        { name: 'Lavender', hex: '#A78BFA' },
      ],
      patterns: ['Floral','Geometric','Paisley','Stripes','Checks','Plain','Ikat','Brocade','Printed','Embroidered'],
      weaves: ['Handloom','Kanchipuram','Banarasi','Pochampally','Patola','Jamdani','Khadi','Power Loom','Machine Made'],
      borders: ['Zari Border','Gold Zari','Silver Zari','Contrast Border','Plain Border','Embroidered Border','Thread Work','Broad Border'],
      brands: ['Happy Sarees Exclusive','Kanchipuram Originals','Banarasi Heritage','Organza Collection','Silk India'],
      collections: ['Bridal Collection','Wedding Season 2026','Festive Picks','New Arrivals','Best Sellers','Summer Collection','Premium Silk'],
    };

    for (const [typeSlug, items] of Object.entries(masterItems)) {
      const typeId = typeIds[typeSlug];
      if (!typeId) continue;
      for (let i = 0; i < items.length; i++) {
        const item = typeof items[i] === 'string' ? { name: items[i] } : items[i];
        const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
        await db.query(
          `INSERT INTO master_items (type_id, name, slug, color_hex, sort_order)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (type_id, slug) DO NOTHING`,
          [typeId, item.name, slug, item.hex || null, i]
        );
      }
    }
    console.log('✅ Master items seeded.');

    // ── 7. CMS Sections ──────────────────────────────────────
    const cmsSections = [
      { key: 'announcement_bar',   title: 'Announcement Bar',    sort: 1 },
      { key: 'hero_banner',        title: 'Hero Banner',         sort: 2 },
      { key: 'shop_by_occasion',   title: 'Shop by Occasion',    sort: 3 },
      { key: 'new_arrivals',       title: 'New Arrivals',        sort: 4 },
      { key: 'featured_collection',title: 'Featured Collection', sort: 5 },
      { key: 'best_sellers',       title: 'Best Sellers',        sort: 6 },
      { key: 'shop_by_fabric',     title: 'Shop by Fabric',      sort: 7 },
      { key: 'why_happy_sarees',   title: 'Why Happy Sarees',    sort: 8 },
      { key: 'customer_reviews',   title: 'Customer Reviews',    sort: 9 },
      { key: 'watch_and_buy',      title: 'Watch & Buy',         sort: 10 },
      { key: 'newsletter',         title: 'Newsletter',          sort: 11 },
    ];

    for (const s of cmsSections) {
      await db.query(
        `INSERT INTO cms_sections (section_key, title, sort_order)
         VALUES ($1, $2, $3)
         ON CONFLICT (section_key) DO NOTHING`,
        [s.key, s.title, s.sort]
      );
    }
    console.log('✅ CMS sections seeded.');

    // ── 8. Default Store Settings ─────────────────────────────
    const settings = [
      { key: 'store_general', val: { storeName: 'Happy Sarees', tagline: 'Celebrate Every Tradition', email: 'support@happysarees.com', phone: '+91 98765 43210', address: '123, Silk Street, Anna Nagar, Chennai - 600040', gst: '33ABCDE1234F1Z5', currency: 'INR', timezone: 'Asia/Kolkata', language: 'English' }, cat: 'general' },
      { key: 'store_smtp',    val: { host: 'smtp.gmail.com', port: 587, username: '', password: '', fromName: 'Happy Sarees', fromEmail: 'noreply@happysarees.com', encryption: 'TLS' }, cat: 'smtp' },
      { key: 'store_payment', val: { razorpay: { keyId: '', keySecret: '', mode: 'test', enabled: true }, cod: { enabled: true, charge: 0 }, upi: { id: '', enabled: true } }, cat: 'payment' },
      { key: 'store_shipping',val: { standardCharge: 99, expressCharge: 199, freeThreshold: 999, estimatedDays: '3-5 Business Days' }, cat: 'shipping' },
      { key: 'store_tax',     val: { gst: { rate: 18, enabled: true }, displayPricesWithTax: true }, cat: 'tax' },
      { key: 'store_seo',     val: { metaTitle: 'Happy Sarees – Handloom Luxury', metaDescription: 'Shop premium sarees handcrafted with tradition.', metaKeywords: 'sarees, silk, organza, kanchipuram', ga: '', fbPixel: '' }, cat: 'seo' },
    ];

    for (const s of settings) {
      await db.query(
        `INSERT INTO store_settings (setting_key, setting_value, category)
         VALUES ($1, $2, $3)
         ON CONFLICT (setting_key) DO NOTHING`,
        [s.key, JSON.stringify(s.val), s.cat]
      );
    }
    console.log('✅ Default store settings seeded.');

    // ── 9. Sample Coupons ────────────────────────────────────
    const adminId = (await db.query(`SELECT id FROM admin_users WHERE email = 'admin@happysarees.com'`)).rows[0]?.id;
    if (adminId) {
      const coupons = [
        { code: 'WELCOME10', name: 'Welcome 10% Off', type: 'percentage', value: 10, min: 500, max: 200, limit: 100 },
        { code: 'FLAT500',   name: 'Flat ₹500 Off',   type: 'flat',       value: 500, min: 2000, max: null, limit: 50 },
        { code: 'FESTIVAL20',name: 'Festival 20% Off', type: 'percentage', value: 20, min: 1000, max: 500, limit: 200 },
      ];
      for (const c of coupons) {
        await db.query(
          `INSERT INTO coupons (code, name, type, value, min_order_amount, max_discount_amount, usage_limit, created_by)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
           ON CONFLICT (code) DO NOTHING`,
          [c.code, c.name, c.type, c.value, c.min, c.max, c.limit, adminId]
        );
      }
      console.log('✅ Sample coupons seeded.');
    }

    // ── 10. Sample Notifications ──────────────────────────────
    await db.query(`
      INSERT INTO admin_notifications (type, title, message, entity_type)
      VALUES
        ('system',       'Welcome to Happy Sarees Admin!', 'Admin panel is fully configured and ready to use.', null),
        ('new_order',    'New Order Received',             'A new order has been placed. Check the Orders section.', 'order'),
        ('low_stock',    'Low Stock Alert',                'Some products are running low on stock. Review inventory.', 'product')
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Sample notifications seeded.');

    console.log('\n🎉 Admin Database Seeding Complete!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Admin Login Credentials:');
    console.log('  Email    : admin@happysarees.com');
    console.log('  Password : Admin@2026');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Admin Seed Error:', err.message || err);
    process.exit(1);
  }
}

seedAdmin();
