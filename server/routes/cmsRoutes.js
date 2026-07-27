const express = require('express');
const router = express.Router();
const db = require('../db');
const cmsService = require('../services/admin/cmsService');

// 1. Get Live Public Announcement Bar
router.get('/announcement-bar', async (req, res) => {
  try {
    const data = await cmsService.getPublicAnnouncementBar();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Public Announcement Bar Error:', error);
    res.json({
      success: true,
      data: {
        enabled: true,
        text: 'FREE SHIPPING ON PREMIUM SILK COLLECTION',
        link: '/shop',
        backgroundColor: '#2b2b2b',
        textColor: '#ffffff'
      }
    });
  }
});

// 2. Get All Public CMS Sections
router.get('/sections', async (req, res) => {
  try {
    const sections = await cmsService.getAllSections();
    res.json({ success: true, sections });
  } catch (error) {
    console.error('Public Sections Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching CMS sections.' });
  }
});

// 3. Get Navigation Menu Data (Occasions & Fabrics dynamically from Neon DB)
router.get('/navigation', async (req, res) => {
  try {
    const [occasionsRes, fabricsRes] = await Promise.all([
      db.query(
        `SELECT mi.name, mi.slug 
         FROM master_items mi 
         JOIN master_types mt ON mi.type_id = mt.id 
         WHERE mt.slug = 'occasions' AND mi.is_active = true 
         ORDER BY mi.sort_order ASC, mi.name ASC`
      ),
      db.query(
        `SELECT mi.name, mi.slug 
         FROM master_items mi 
         JOIN master_types mt ON mi.type_id = mt.id 
         WHERE mt.slug = 'fabrics' AND mi.is_active = true 
         ORDER BY mi.sort_order ASC, mi.name ASC`
      )
    ]);

    const occasions = occasionsRes.rows.map(row => ({
      name: row.name,
      slug: row.slug || row.name.toLowerCase().replace(/\s+/g, '-'),
      path: `/shop?occasion=${encodeURIComponent(row.slug || row.name.toLowerCase().replace(/\s+/g, '-'))}`
    }));

    const fabrics = fabricsRes.rows.map(row => ({
      name: row.name,
      slug: row.slug || row.name.toLowerCase().replace(/\s+/g, '-'),
      path: `/shop?fabric=${encodeURIComponent(row.slug || row.name.toLowerCase().replace(/\s+/g, '-'))}`
    }));

    res.json({
      success: true,
      occasions: occasions.length > 0 ? occasions : [
        { name: 'Wedding', path: '/shop?occasion=wedding' },
        { name: 'Reception', path: '/shop?occasion=reception' },
        { name: 'Party', path: '/shop?occasion=party' },
        { name: 'Office', path: '/shop?occasion=office' },
        { name: 'Daily Wear', path: '/shop?occasion=daily-wear' },
        { name: 'Festive', path: '/shop?occasion=festive' }
      ],
      fabrics: fabrics.length > 0 ? fabrics : [
        { name: 'Silk', path: '/shop?fabric=silk' },
        { name: 'Cotton', path: '/shop?fabric=cotton' },
        { name: 'Linen', path: '/shop?fabric=linen' },
        { name: 'Organza', path: '/shop?fabric=organza' },
        { name: 'Georgette', path: '/shop?fabric=georgette' },
        { name: 'Tissue', path: '/shop?fabric=tissue' },
        { name: 'Banarasi', path: '/shop?fabric=banarasi' },
        { name: 'Kanchipuram', path: '/shop?fabric=kanchipuram' }
      ]
    });
  } catch (err) {
    console.warn('[cmsRoutes] Navigation fetch warning:', err.message);
    res.json({
      success: true,
      occasions: [
        { name: 'Wedding', path: '/shop?occasion=wedding' },
        { name: 'Reception', path: '/shop?occasion=reception' },
        { name: 'Party', path: '/shop?occasion=party' },
        { name: 'Office', path: '/shop?occasion=office' },
        { name: 'Daily Wear', path: '/shop?occasion=daily-wear' },
        { name: 'Festive', path: '/shop?occasion=festive' }
      ],
      fabrics: [
        { name: 'Silk', path: '/shop?fabric=silk' },
        { name: 'Cotton', path: '/shop?fabric=cotton' },
        { name: 'Linen', path: '/shop?fabric=linen' },
        { name: 'Organza', path: '/shop?fabric=organza' },
        { name: 'Georgette', path: '/shop?fabric=georgette' },
        { name: 'Tissue', path: '/shop?fabric=tissue' },
        { name: 'Banarasi', path: '/shop?fabric=banarasi' },
        { name: 'Kanchipuram', path: '/shop?fabric=kanchipuram' }
      ]
    });
  }
});

// 4. Get All Public Master Data (For Website Filters - Respects show_in_filters)
router.get('/master-data', async (req, res) => {
  try {
    const dbRes = await db.query(
      `SELECT mt.slug as type_slug, mi.id, mi.name, mi.color_hex
       FROM master_items mi
       JOIN master_types mt ON mi.type_id = mt.id
       WHERE mi.is_active = true AND mt.is_active = true AND (mt.show_in_filters IS NULL OR mt.show_in_filters = true)
       ORDER BY mi.sort_order ASC, mi.name ASC`
    );

    const masterData = {};
    for (const row of dbRes.rows) {
      const type = row.type_slug;
      if (!masterData[type]) masterData[type] = [];
      if (type === 'colors') {
        masterData[type].push({ name: row.name, hex: row.color_hex || '#e0e0e0' });
      } else {
        masterData[type].push(row.name);
      }
    }

    res.json({ success: true, masterData });
  } catch (err) {
    console.error('[cmsRoutes] Master Data fetch error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// 5. Get Master Types Configured for Saree Details (Product Specifications)
router.get('/spec-types', async (req, res) => {
  try {
    const dbRes = await db.query(
      `SELECT id, name, slug, show_in_specifications, show_in_filters 
       FROM master_types 
       WHERE is_active = true
       ORDER BY sort_order ASC, name ASC`
    );
    const types = dbRes.rows.map(r => ({
      ...r,
      showInSpecs: r.show_in_specifications ?? true,
      showInFilters: r.show_in_filters ?? true,
      show_in_specifications: r.show_in_specifications ?? true,
      show_in_filters: r.show_in_filters ?? true
    }));
    res.json({ success: true, types });
  } catch (err) {
    console.error('[cmsRoutes] Spec types fetch error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});


// 6. Get Available Active Coupons for Customer Website
router.get('/available-coupons', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, code, name, type, value, 
              COALESCE(min_order, min_order_amount, 0) as min_order, 
              COALESCE(max_discount, max_discount_amount) as max_discount, 
              expires_at, usage_limit, usage_count
       FROM coupons
       WHERE is_active = true 
         AND (expires_at IS NULL OR expires_at > NOW())
         AND (usage_limit IS NULL OR usage_limit = 0 OR usage_count < usage_limit)
       ORDER BY id DESC`
    );

    const formatted = result.rows.map(c => {
      const isPercent = (c.type || '').toLowerCase().includes('percent');
      const discountText = isPercent ? `${Number(c.value)}% OFF` : `₹${Number(c.value)} OFF`;
      return {
        id: c.id,
        code: c.code,
        title: c.name || `${discountText} on Orders above ₹${Number(c.min_order)}`,
        codeText: c.code,
        description: `Get ${discountText} on orders above ₹${Number(c.min_order)}.`,
        discount: discountText,
        discountType: isPercent ? 'Percentage' : 'Flat',
        discountValue: Number(c.value),
        minOrder: Number(c.min_order || 0),
        maxDiscount: c.max_discount ? Number(c.max_discount) : null,
        expiresAt: c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Limited Time'
      };
    });

    res.json({ success: true, coupons: formatted, offers: formatted });
  } catch (error) {
    console.error('Fetch Available Coupons Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch active coupons' });
  }
});

// 7. Validate Customer Coupon Endpoint
router.post('/validate-coupon', async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code || !orderAmount) {
      return res.status(400).json({ success: false, message: 'Coupon code and order amount are required.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const amount = Number(orderAmount);

    const result = await db.query(
      `SELECT *, COALESCE(min_order, min_order_amount, 0) as min_order, COALESCE(max_discount, max_discount_amount) as max_discount 
       FROM coupons 
       WHERE UPPER(code) = $1 AND is_active = true`,
      [cleanCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code.' });
    }

    const c = result.rows[0];

    // Check expiration
    if (c.expires_at && new Date(c.expires_at) <= new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon code has expired.' });
    }

    // Check usage limit
    if (c.usage_limit > 0 && c.usage_count >= c.usage_limit) {
      return res.status(400).json({ success: false, message: 'This coupon code usage limit has been reached.' });
    }

    // Check min order
    if (amount < Number(c.min_order)) {
      return res.status(400).json({ success: false, message: `Minimum order amount of ₹${c.min_order} required for this coupon.` });
    }

    const isPercent = (c.type || '').toLowerCase().includes('percent');
    let discountAmount = 0;

    if (isPercent) {
      discountAmount = (amount * Number(c.value)) / 100;
      if (c.max_discount && Number(c.max_discount) > 0) {
        discountAmount = Math.min(discountAmount, Number(c.max_discount));
      }
    } else {
      discountAmount = Number(c.value);
    }

    res.json({
      success: true,
      valid: true,
      code: c.code,
      discountAmount: Math.round(discountAmount),
      coupon: {
        id: c.id,
        code: c.code,
        discountType: isPercent ? 'Percentage' : 'Flat',
        discountValue: Number(c.value),
        discountAmount: Math.round(discountAmount)
      }
    });
  } catch (error) {
    console.error('Validate Coupon Error:', error);
    res.status(500).json({ success: false, message: 'Coupon validation failed.' });
  }
});

module.exports = router;

