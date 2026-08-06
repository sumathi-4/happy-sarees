const db = require('../db');

/**
 * Helper to fetch and parse store settings
 */
async function getStoreSetting(key) {
  try {
    const res = await db.query(`SELECT setting_value FROM store_settings WHERE setting_key = $1`, [key]);
    let val = res.rows[0]?.setting_value;
    if (typeof val === 'string') {
      try { val = JSON.parse(val); } catch (e) {}
    }
    return val || {};
  } catch (err) {
    console.error(`[orderCalculator] Error fetching setting ${key}:`, err.message);
    return {};
  }
}

/**
 * Calculates dynamic order totals authoritatively
 * 
 * @param {Object} params
 * @param {Array} params.items - Cart items [{ id/productId, quantity, is_saree_crown }]
 * @param {number|string} params.shippingMethodId - Selected delivery method ID
 * @param {string} params.couponCode - Coupon code to apply
 * @param {number} params.userId - User ID for Saree Crown verification
 */
async function calculateOrderTotals({ items, shippingMethodId, couponCode, userId }) {
  if (!items || items.length === 0) {
    throw new Error('Items list cannot be empty.');
  }

  // 1. Fetch Tax and Shipping Settings
  const taxSettings = await getStoreSetting('store_tax');
  const shippingSettings = await getStoreSetting('store_shipping');

  const enableGst = taxSettings.enableGst !== undefined ? !!taxSettings.enableGst : true;
  const gstPercent = Number(taxSettings.gstPercent !== undefined ? taxSettings.gstPercent : 5);
  const taxInclusive = taxSettings.taxInclusive || 'Tax Inclusive';

  const enableFreeShipping = shippingSettings.enableFreeShipping !== undefined ? !!shippingSettings.enableFreeShipping : (shippingSettings.enable_free_shipping !== undefined ? !!shippingSettings.enable_free_shipping : true);
  const minFreeShippingOrder = Number(shippingSettings.minFreeShippingOrder !== undefined ? shippingSettings.minFreeShippingOrder : (shippingSettings.free_shipping_min_amount !== undefined ? shippingSettings.free_shipping_min_amount : 2999));

  const isInclusive = taxInclusive.toLowerCase().includes('inclusive');

  // 2. Fetch Selected Shipping Method
  let shippingMethod = null;
  if (shippingMethodId) {
    const methodRes = await db.query(`SELECT * FROM shipping_methods WHERE id = $1`, [shippingMethodId]);
    shippingMethod = methodRes.rows[0];
  }
  if (!shippingMethod) {
    // Default to the first enabled delivery method in sorted display order
    const methodRes = await db.query(`SELECT * FROM shipping_methods WHERE is_enabled = true ORDER BY display_order ASC, id ASC LIMIT 1`);
    shippingMethod = methodRes.rows[0];
  }

  // 3. Fetch Products and calculate basic Subtotals
  let cartSubtotal = 0; // sum of (originalPrice || price) * qty
  let sellingTotal = 0; // sum of price * qty
  let productDiscount = 0; // sum of (originalPrice - price) * qty

  const productIds = items.map(item => Number(item.productId || item.id));
  const productsMap = {};
  if (productIds.length > 0) {
    const productsRes = await db.query(`SELECT * FROM products WHERE id = ANY($1)`, [productIds]);
    productsRes.rows.forEach(p => {
      productsMap[p.id] = p;
    });
  }

  for (const item of items) {
    const productId = Number(item.productId || item.id);
    const dbProduct = productsMap[productId];

    let price = dbProduct ? Number(dbProduct.price) : Number(item.price || 0);
    let originalPrice = dbProduct ? Number(dbProduct.original_price || dbProduct.price) : Number(item.originalPrice || item.price || 0);
    let quantity = Number(item.quantity || 1);

    cartSubtotal += originalPrice * quantity;
    sellingTotal += price * quantity;
    productDiscount += (originalPrice - price) * quantity;
  }

  // 4. Calculate Coupon/Reward Discount
  let couponDiscount = 0;
  let sareeCrownApplied = false;

  if (couponCode) {
    const cleanCode = couponCode.trim().toUpperCase();
    if (cleanCode === 'SAREECROWN') {
      if (!userId) {
        throw new Error('Please log in to apply the Saree Crown reward.');
      }

      // Fetch active Saree Crown campaign
      const campaignRes = await db.query(
        `SELECT * FROM saree_crown_campaign WHERE enabled = true ORDER BY id DESC LIMIT 1`
      );
      const campaign = campaignRes.rows[0];
      if (!campaign || !campaign.winner_revealed || !campaign.winner_product_id) {
        throw new Error('No active Saree Crown reward is available.');
      }

      // Check if user voted in this campaign
      const voteCheck = await db.query(
        `SELECT 1 FROM saree_crown_votes WHERE campaign_id = $1 AND user_id = $2 LIMIT 1`,
        [campaign.id, userId]
      );
      if (voteCheck.rowCount === 0) {
        throw new Error('Only customers who voted in this Saree Crown campaign are eligible for the reward.');
      }

      // Check if already used
      const usageCheck = await db.query(
        `SELECT 1 FROM coupon_usage cu 
         JOIN coupons c ON c.id = cu.coupon_id 
         WHERE UPPER(c.code) = 'SAREECROWN' AND cu.user_id = $1 AND cu.campaign_id = $2 LIMIT 1`,
        [userId, campaign.id]
      );
      if (usageCheck.rowCount > 0) {
        throw new Error('You have already redeemed your Saree Crown reward.');
      }

      // Check if winning product is in items and is a Saree Crown reward claim
      const crownItem = items.find(item => Number(item.productId || item.id) === campaign.winner_product_id);
      if (!crownItem) {
        throw new Error('The winning Saree Crown product must be in your checkout list to redeem this reward.');
      }
      if (!crownItem.is_saree_crown) {
        throw new Error('The winning product must be claimed using the Saree Crown reward claim flow.');
      }

      // Calculate reward: applied to exactly 1 unit of winning product price
      const dbProduct = productsMap[campaign.winner_product_id];
      const winningPrice = dbProduct ? Number(dbProduct.price) : Number(crownItem.price || 0);
      
      if (campaign.reward_type === 'percentage') {
        couponDiscount = (winningPrice * Number(campaign.reward_value)) / 100;
      } else {
        couponDiscount = winningPrice;
      }
      sareeCrownApplied = true;
    } else {
      // Standard Coupon
      const couponRes = await db.query(
        `SELECT *, COALESCE(min_order, min_order_amount, 0) as min_order, COALESCE(max_discount, max_discount_amount) as max_discount 
         FROM coupons 
         WHERE UPPER(code) = $1 AND is_active = true`,
        [cleanCode]
      );
      if (couponRes.rows.length === 0) {
        throw new Error('Invalid or inactive coupon code.');
      }

      const c = couponRes.rows[0];

      // Check expiration
      if (c.expires_at && new Date(c.expires_at) <= new Date()) {
        throw new Error('This coupon code has expired.');
      }

      // Check usage limit
      if (c.usage_limit > 0 && c.usage_count >= c.usage_limit) {
        throw new Error('This coupon code usage limit has been reached.');
      }

      // Check min order
      if (sellingTotal < Number(c.min_order)) {
        throw new Error(`Minimum order amount of ₹${c.min_order} required for this coupon.`);
      }

      const isPercent = (c.type || '').toLowerCase().includes('percent');
      if (isPercent) {
        couponDiscount = (sellingTotal * Number(c.value)) / 100;
        if (c.max_discount && Number(c.max_discount) > 0) {
          couponDiscount = Math.min(couponDiscount, Number(c.max_discount));
        }
      } else {
        couponDiscount = Number(c.value);
      }
    }
  }

  // Ensure coupon discount does not exceed sellingTotal
  couponDiscount = Math.min(couponDiscount, sellingTotal);
  const totalDiscount = productDiscount + couponDiscount;

  // 5. Calculate GST
  let gstAmount = 0;
  let rate = 0;
  if (enableGst) {
    rate = gstPercent;
    const taxableBase = sellingTotal - couponDiscount;
    if (isInclusive) {
      gstAmount = taxableBase - (taxableBase / (1 + rate / 100));
    } else {
      gstAmount = taxableBase * (rate / 100);
    }
  }

  // 6. Calculate Shipping
  let shippingAmount = 0;
  let isFreeShipping = false;
  if (shippingMethod) {
    const rawCharge = Number(shippingMethod.shipping_charge);
    const qualifiesForFreeShipping = enableFreeShipping && sellingTotal >= minFreeShippingOrder;
    if (qualifiesForFreeShipping && shippingMethod.free_shipping_eligible) {
      shippingAmount = 0;
      isFreeShipping = true;
    } else {
      shippingAmount = rawCharge;
      isFreeShipping = false;
    }
  }

  // 7. Calculate Final Grand Total
  let finalTotal = 0;
  if (enableGst && !isInclusive) {
    finalTotal = (sellingTotal - couponDiscount) + gstAmount + shippingAmount;
  } else {
    finalTotal = (sellingTotal - couponDiscount) + shippingAmount;
  }

  return {
    subtotal: Math.round(cartSubtotal),
    discount: Math.round(totalDiscount),
    gstRate: rate,
    gstAmount: Math.round(gstAmount),
    taxInclusivityMode: taxInclusive,
    shippingAmount: Math.round(shippingAmount),
    freeShippingStatus: isFreeShipping ? 'FREE' : 'PAID',
    finalTotal: Math.round(finalTotal),
    couponDiscount: Math.round(couponDiscount),
    productDiscount: Math.round(productDiscount)
  };
}

module.exports = {
  calculateOrderTotals
};
