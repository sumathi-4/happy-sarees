const express = require('express');
const router = express.Router();
const db = require('../db');
const cmsService = require('../services/admin/cmsService');
const jwt = require('jsonwebtoken');

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

// 3b. Get Public Shop by Occasion Data (Dynamically from Neon DB)
router.get('/occasions', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT mi.id, mi.name, mi.slug, mi.description, mi.image_data, mi.sort_order, mi.is_active
       FROM master_items mi
       JOIN master_types mt ON mi.type_id = mt.id
       WHERE (mt.slug = 'occasions' OR mt.slug = 'occasion') AND mi.is_active = true
       ORDER BY mi.sort_order ASC, mi.name ASC`
    );

    const occasions = result.rows.map(row => {
      const cleanSlug = row.slug || row.name.toLowerCase().trim().replace(/\s+/g, '-');
      return {
        id: row.id,
        name: row.name,
        slug: cleanSlug,
        description: row.description,
        image: row.image_data,
        sortOrder: row.sort_order,
        isActive: row.is_active,
        path: `/shop?occasion=${encodeURIComponent(cleanSlug)}`
      };
    });

    res.json({ success: true, occasions });
  } catch (err) {
    console.error('[cmsRoutes] Public Occasions fetch error:', err);
    res.status(500).json({ success: false, message: err.message });
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
      const slug = (row.type_slug || '').toLowerCase().trim();
      const pluralKey = slug.endsWith('s') ? slug : slug + 's';
      const singularKey = slug.endsWith('s') ? slug.slice(0, -1) : slug;

      if (!masterData[pluralKey]) masterData[pluralKey] = [];
      if (!masterData[singularKey]) masterData[singularKey] = masterData[pluralKey];

      if (pluralKey === 'colors') {
        const itemObj = { id: row.id, name: row.name, hex: row.color_hex || '#e0e0e0' };
        if (!masterData[pluralKey].some(c => c.name === row.name)) {
          masterData[pluralKey].push(itemObj);
        }
      } else {
        if (!masterData[pluralKey].includes(row.name)) {
          masterData[pluralKey].push(row.name);
        }
      }
    }

    res.json({ success: true, masterData });
  } catch (err) {
    console.error('[cmsRoutes] Master Data fetch error:', err);
    res.status(500).json({ success: false, message: err.message });
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
    console.warn('Fetch Available Coupons Notice:', error.message);
    res.json({ success: true, coupons: [], offers: [] });
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

    if (cleanCode === 'SAREECROWN') {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      let userId = null;

      if (token) {
        try {
          const verified = jwt.verify(token, process.env.JWT_SECRET || 'happysarees_secret_key_2026');
          userId = verified.id || verified.userId;
        } catch (err) {
          // Token decode failed
        }
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Please log in to apply this coupon.' });
      }

      // 1. Fetch active Saree Crown campaign
      const campaignRes = await db.query(
        `SELECT * FROM saree_crown_campaign WHERE enabled = true ORDER BY id DESC LIMIT 1`
      );
      const campaign = campaignRes.rows[0];
      if (!campaign || !campaign.winner_revealed || !campaign.winner_product_id) {
        return res.status(400).json({ success: false, message: 'No active Saree Crown reward is available.' });
      }

      // 2. Check if user voted in this campaign
      const voteCheck = await db.query(
        `SELECT 1 FROM saree_crown_votes WHERE campaign_id = $1 AND user_id = $2 LIMIT 1`,
        [campaign.id, userId]
      );
      if (voteCheck.rowCount === 0) {
        return res.status(403).json({ success: false, message: 'Only customers who voted in this Saree Crown campaign are eligible for the reward.' });
      }

      // 3. Check if already used
      const usageCheck = await db.query(
        `SELECT 1 FROM coupon_usage cu 
         JOIN coupons c ON c.id = cu.coupon_id 
         WHERE UPPER(c.code) = 'SAREECROWN' AND cu.user_id = $1 AND cu.campaign_id = $2 LIMIT 1`,
        [userId, campaign.id]
      );
      if (usageCheck.rowCount > 0) {
        return res.status(400).json({ success: false, message: 'You have already redeemed your Saree Crown reward.' });
      }

      // 4. Check if winning product is in user's cart as a Saree Crown reward claim
      const cartCheck = await db.query(
        `SELECT 1 FROM cart_items WHERE user_id = $1 AND product_id = $2 AND is_saree_crown = true LIMIT 1`,
        [userId, campaign.winner_product_id]
      );
      if (cartCheck.rowCount === 0) {
        const prodRes = await db.query(`SELECT name FROM products WHERE id = $1`, [campaign.winner_product_id]);
        const prodName = prodRes.rows[0]?.name || 'the winning saree';
        return res.status(400).json({ success: false, message: `The winning Saree Crown product ("${prodName}") must be claimed via "Claim Reward" to use this coupon.` });
      }

      // Fetch the winning product's price for calculation of FREE reward if needed
      const winnerRes = await db.query(`SELECT price FROM products WHERE id = $1`, [campaign.winner_product_id]);
      const winnerProduct = winnerRes.rows[0];
      const winningPrice = winnerProduct ? Number(winnerProduct.price) : 0;

      const rewardType = campaign.reward_type;
      const rewardValue = campaign.reward_value;

      let discountAmount = 0;
      if (rewardType === 'percentage') {
        discountAmount = (winningPrice * Number(rewardValue)) / 100;
      } else {
        discountAmount = winningPrice;
      }

      const couponDb = await db.query(`SELECT id FROM coupons WHERE UPPER(code) = 'SAREECROWN' LIMIT 1`);
      const couponId = couponDb.rows[0]?.id || 99999;

      return res.json({
        success: true,
        valid: true,
        code: 'SAREECROWN',
        discountAmount: Math.round(discountAmount),
        coupon: {
          id: couponId,
          code: 'SAREECROWN',
          discountType: 'Flat',
          discountValue: Math.round(discountAmount),
          discountAmount: Math.round(discountAmount)
        }
      });
    }

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

// 8. Public Shipping Methods & Free Shipping Rules for Customer Checkout
router.get('/shipping-methods', async (req, res) => {
  try {
    const [methodsRes, settingsRes] = await Promise.all([
      db.query(`SELECT * FROM shipping_methods WHERE is_enabled = true ORDER BY display_order ASC, id ASC`),
      db.query(`SELECT setting_key, setting_value FROM store_settings WHERE category = 'shipping' OR setting_key LIKE 'store_shipping%'`)
    ]);

    let shippingRules = {
      enable_free_shipping: true,
      enableFreeShipping: true,
      free_shipping_min_amount: 2999,
      minFreeShippingOrder: 2999
    };

    settingsRes.rows.forEach(r => {
      let val = r.setting_value;
      if (typeof val === 'string') {
        try { val = JSON.parse(val); } catch(e) {}
      }
      if (val && typeof val === 'object') {
        const enable = val.enable_free_shipping !== undefined ? val.enable_free_shipping : val.enableFreeShipping;
        if (enable !== undefined) {
          shippingRules.enable_free_shipping = !!enable;
          shippingRules.enableFreeShipping = !!enable;
        }

        const minAmt = val.free_shipping_min_amount !== undefined ? val.free_shipping_min_amount : val.minFreeShippingOrder;
        if (minAmt !== undefined) {
          const num = Number(minAmt) || 2999;
          shippingRules.free_shipping_min_amount = num;
          shippingRules.minFreeShippingOrder = num;
        }
      }
    });

    const formattedMethods = methodsRes.rows.map(row => ({
      ...row,
      price: Number(row.shipping_charge),
      shipping_charge: Number(row.shipping_charge),
      estimate: row.estimated_delivery_days,
      estimated_delivery_days: row.estimated_delivery_days
    }));

    res.json({
      success: true,
      shippingMethods: formattedMethods,
      options: formattedMethods,
      shippingRules
    });
  } catch (error) {
    console.warn('Fetch Public Shipping Methods Notice:', error.message);
    const defaultShipping = [
      { id: 1, name: 'Standard Shipping', title: 'Standard Delivery', description: 'Free Delivery across India on orders above ₹999', price: 0, shipping_charge: 0, estimate: '3-5 Business Days', estimated_delivery_days: '3-5 Business Days' },
      { id: 2, name: 'Express Shipping', title: 'Express Delivery', description: 'Priority dispatch and fast delivery via Air courier', price: 150, shipping_charge: 150, estimate: '1-2 Business Days', estimated_delivery_days: '1-2 Business Days' }
    ];
    res.json({ success: true, shippingMethods: defaultShipping, options: defaultShipping, shippingRules: { freeShippingThreshold: 999 } });
  }
});

// 9. Public Dynamic Payment Methods & Gateways for Customer Checkout
router.get('/payment-methods', async (req, res) => {
  try {
    const settingsRes = await db.query(
      `SELECT setting_key, setting_value FROM store_settings WHERE category IN ('integrations', 'payment') OR setting_key LIKE 'store_integrations%' OR setting_key LIKE 'store_payment%'`
    );

    let config = {
      razorpayEnabled: true,
      razorpayKey: 'rzp_live_XXXXXXXXXXXXXX',
      codEnabled: true,
      codMaxAmount: 5000,
      upiQrEnabled: true,
      upiId: '',
      upiPayeeName: 'Happy Sarees',
      qrCodeUrl: ''
    };

    settingsRes.rows.forEach(r => {
      let val = r.setting_value;
      if (typeof val === 'string') {
        try { val = JSON.parse(val); } catch(e) {}
      }
      if (val && typeof val === 'object') {
        const rzpEnable = val.razorpayEnabled !== undefined ? val.razorpayEnabled : val.razorpay_enabled;
        if (rzpEnable !== undefined) config.razorpayEnabled = !!rzpEnable;

        const rzpKey = val.razorpayKey || val.razorpay_key;
        if (rzpKey) config.razorpayKey = rzpKey;

        const codEnable = val.codEnabled !== undefined ? val.codEnabled : val.cod_enabled;
        if (codEnable !== undefined) config.codEnabled = !!codEnable;

        const codMax = val.codMaxAmount !== undefined ? val.codMaxAmount : val.cod_max_amount;
        if (codMax !== undefined) config.codMaxAmount = Number(codMax) || 5000;

        const upiQrEnable = val.upiQrEnabled !== undefined ? val.upiQrEnabled : val.upi_qr_enabled;
        if (upiQrEnable !== undefined) config.upiQrEnabled = !!upiQrEnable;

        const upiIdVal = val.upiId || val.upi_id;
        if (upiIdVal) config.upiId = upiIdVal;

        const payeeNameVal = val.upiPayeeName || val.upi_payee_name;
        if (payeeNameVal) config.upiPayeeName = payeeNameVal;

        const qrUrl = val.qrCodeUrl || val.qr_code_url;
        if (qrUrl) config.qrCodeUrl = qrUrl;
      }
    });

    const paymentSettings = {
      razorpayEnabled: config.razorpayEnabled,
      razorpay_enabled: config.razorpayEnabled,
      razorpayKey: config.razorpayKey,
      razorpay_key: config.razorpayKey,
      codEnabled: config.codEnabled,
      cod_enabled: config.codEnabled,
      codMaxAmount: config.codMaxAmount,
      cod_max_amount: config.codMaxAmount,
      upiQrEnabled: config.upiQrEnabled,
      upi_qr_enabled: config.upiQrEnabled,
      upiId: config.upiId,
      upi_id: config.upiId,
      upiPayeeName: config.upiPayeeName,
      upi_payee_name: config.upiPayeeName,
      qrCodeUrl: config.qrCodeUrl,
      qr_code_url: config.qrCodeUrl
    };

    const paymentMethods = [];

    if (config.razorpayEnabled) {
      paymentMethods.push({
        id: 'pay_online',
        key: 'pay_online',
        name: 'Pay Online',
        title: 'Pay Online',
        type: 'online',
        gateway: 'razorpay',
        description: 'Secure online payment powered by Razorpay. Supports UPI, Cards, Net Banking and Wallets.',
        desc: 'Secure online payment powered by Razorpay. Supports UPI, Cards, Net Banking and Wallets.',
        icons: ['UPI', 'Cards', 'Net Banking', 'Wallets'],
        is_enabled: true
      });
    }

    if (config.upiQrEnabled) {
      paymentMethods.push({
        id: 'pay_upi_qr',
        key: 'pay_upi_qr',
        name: 'UPI / QR Code Scanner',
        title: 'UPI / QR Code Scanner',
        type: 'upi_qr',
        gateway: 'upi_qr',
        upiId: config.upiId,
        upiPayeeName: config.upiPayeeName,
        qrCodeUrl: config.qrCodeUrl,
        description: 'Scan QR code using any UPI app (GPay, PhonePe, Paytm, BHIM) to pay instantly.',
        desc: 'Scan QR code using any UPI app (GPay, PhonePe, Paytm, BHIM) to pay instantly.',
        icons: ['GPay', 'PhonePe', 'Paytm', 'BHIM'],
        is_enabled: true
      });
    }

    if (config.codEnabled) {
      paymentMethods.push({
        id: 'pay_cod',
        key: 'pay_cod',
        name: 'Cash on Delivery (COD)',
        title: 'Cash on Delivery (COD)',
        type: 'cod',
        gateway: 'cod',
        description: 'Pay in cash or UPI when your saree arrives at your doorstep.',
        desc: 'Pay in cash or UPI when your saree arrives at your doorstep.',
        maxAmount: config.codMaxAmount,
        cod_max_amount: config.codMaxAmount,
        icons: ['COD'],
        is_enabled: true
      });
    }

    res.json({
      success: true,
      paymentSettings,
      paymentMethods,
      methods: paymentMethods
    });
  } catch (error) {
    console.warn('Fetch Public Payment Methods Notice:', error.message);
    const defaultMethods = [
      { id: 'pay_online', key: 'pay_online', name: 'Pay Online', title: 'Pay Online', type: 'online', gateway: 'razorpay', description: 'Secure online payment powered by Razorpay. Supports UPI, Cards, Net Banking and Wallets.', is_enabled: true },
      { id: 'pay_upi_qr', key: 'pay_upi_qr', name: 'UPI / QR Code Scanner', title: 'UPI / QR Code Scanner', type: 'upi_qr', gateway: 'upi_qr', upiId: '', qrCodeUrl: '', description: 'Scan QR code using any UPI app (GPay, PhonePe, Paytm, BHIM) to pay instantly.', is_enabled: true },
      { id: 'pay_cod', key: 'pay_cod', name: 'Cash on Delivery (COD)', title: 'Cash on Delivery (COD)', type: 'cod', gateway: 'cod', description: 'Pay in cash or UPI when your saree arrives at your doorstep.', is_enabled: true }
    ];
    res.json({ success: true, paymentSettings: { razorpayEnabled: true, codEnabled: true, codMaxAmount: 5000, upiQrEnabled: true, upiId: '', qrCodeUrl: '' }, paymentMethods: defaultMethods, methods: defaultMethods });
  }
});

module.exports = router;

