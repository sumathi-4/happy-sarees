const db = require('./db');
const { calculateOrderTotals } = require('./utils/orderCalculator');
const orderService = require('./services/admin/orderService');

// Assert helper
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: Expected ${expected}, got ${actual}`);
  }
}

async function runTests() {
  console.log('🧪 Starting dynamic order totals, GST, shipping, and Saree Crown validation test suite...');

  // Backup existing settings
  let originalTaxSettings = null;
  let originalShippingSettings = null;

  try {
    const taxRes = await db.query(`SELECT setting_value FROM store_settings WHERE setting_key = 'store_tax'`);
    originalTaxSettings = taxRes.rows[0]?.setting_value || null;

    const shipRes = await db.query(`SELECT setting_value FROM store_settings WHERE setting_key = 'store_shipping'`);
    originalShippingSettings = shipRes.rows[0]?.setting_value || null;
  } catch (err) {
    console.warn('⚠️ Could not back up original settings, using fallback restoration.');
  }

  try {
    // 1. Fetch/Create test user and product
    const userRes = await db.query(`SELECT id FROM users LIMIT 1`);
    const user = userRes.rows[0];
    if (!user) throw new Error('Setup failed: No users found in Neon DB.');

    // We fetch a product with known price for testing.
    const prodRes = await db.query(`SELECT id, price, original_price FROM products LIMIT 2`);
    if (prodRes.rows.length === 0) throw new Error('Setup failed: No products found in Neon DB.');
    const product1 = prodRes.rows[0];
    const product2 = prodRes.rows[1] || prodRes.rows[0];

    // Ensure we have a dynamic shipping method configured in db
    const shipMethodsRes = await db.query(`SELECT id, shipping_charge FROM shipping_methods WHERE is_enabled = true ORDER BY display_order ASC LIMIT 1`);
    const firstShipMethod = shipMethodsRes.rows[0];
    if (!firstShipMethod) throw new Error('Setup failed: No active shipping methods found in Neon DB.');
    const shippingChargeVal = Number(firstShipMethod.shipping_charge);
    console.log(`🚛 Test Shipping Method: Charge = ₹${shippingChargeVal}`);

    const items = [
      { id: product1.id, quantity: 1, price: Number(product1.price), originalPrice: Number(product1.original_price || product1.price) }
    ];
    const sellingPrice = Number(product1.price);
    const originalPrice = Number(product1.original_price || product1.price);
    const productDiscount = originalPrice - sellingPrice;

    console.log(`🛍️ Test Product: ID = ${product1.id}, Price = ₹${sellingPrice}, Original Price = ₹${originalPrice}`);

    // ==========================================
    // CASE A: GST Disabled
    // ==========================================
    console.log('\n--- Case A: GST Disabled ---');
    await db.query(
      `INSERT INTO store_settings (setting_key, setting_value, category)
       VALUES ('store_tax', '{"enableGst": false, "gstPercent": 5, "taxInclusive": "Tax Inclusive"}', 'tax')
       ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value`
    );
    await db.query(
      `INSERT INTO store_settings (setting_key, setting_value, category)
       VALUES ('store_shipping', '{"enableFreeShipping": false, "minFreeShippingOrder": 2000}', 'shipping')
       ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value`
    );

    let totals = await calculateOrderTotals({
      items,
      shippingMethodId: firstShipMethod.id,
      couponCode: null,
      userId: user.id
    });
    assertEqual(totals.gstAmount, 0, 'GST amount must be 0 when GST is disabled');
    assertEqual(totals.finalTotal, sellingPrice + shippingChargeVal, 'Final Total calculation wrong for GST disabled');
    console.log('✅ Case A Passed!');

    // ==========================================
    // CASE B: GST 5%, Tax Exclusive
    // ==========================================
    console.log('\n--- Case B: GST 5%, Tax Exclusive ---');
    await db.query(
      `INSERT INTO store_settings (setting_key, setting_value, category)
       VALUES ('store_tax', '{"enableGst": true, "gstPercent": 5, "taxInclusive": "Tax Exclusive"}', 'tax')
       ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value`
    );

    totals = await calculateOrderTotals({
      items,
      shippingMethodId: firstShipMethod.id,
      couponCode: null,
      userId: user.id
    });
    const expectedGstB = Math.round(sellingPrice * 0.05);
    const expectedTotalB = Math.round(sellingPrice + expectedGstB + shippingChargeVal);
    assertEqual(totals.gstAmount, expectedGstB, 'Exclusive GST calculation wrong');
    assertEqual(totals.finalTotal, expectedTotalB, 'Exclusive GST Final Total wrong');
    console.log('✅ Case B Passed!');

    // ==========================================
    // CASE C: GST 5%, Tax Inclusive
    // ==========================================
    console.log('\n--- Case C: GST 5%, Tax Inclusive ---');
    await db.query(
      `INSERT INTO store_settings (setting_key, setting_value, category)
       VALUES ('store_tax', '{"enableGst": true, "gstPercent": 5, "taxInclusive": "Tax Inclusive"}', 'tax')
       ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value`
    );

    totals = await calculateOrderTotals({
      items,
      shippingMethodId: firstShipMethod.id,
      couponCode: null,
      userId: user.id
    });
    const expectedGstC = Math.round(sellingPrice - (sellingPrice / 1.05));
    const expectedTotalC = Math.round(sellingPrice + shippingChargeVal);
    assertEqual(totals.gstAmount, expectedGstC, 'Inclusive GST extraction wrong');
    assertEqual(totals.finalTotal, expectedTotalC, 'Inclusive GST Final Total wrong');
    console.log('✅ Case C Passed!');

    // ==========================================
    // CASE D: Free Shipping Eligible
    // ==========================================
    console.log('\n--- Case D: Free Shipping Eligible ---');
    // Set free shipping threshold below product selling price
    await db.query(
      `INSERT INTO store_settings (setting_key, setting_value, category)
       VALUES ('store_shipping', '{"enableFreeShipping": true, "minFreeShippingOrder": ${Math.floor(sellingPrice - 100)}}', 'shipping')
       ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value`
    );

    totals = await calculateOrderTotals({
      items,
      shippingMethodId: firstShipMethod.id,
      couponCode: null,
      userId: user.id
    });
    assertEqual(totals.shippingAmount, 0, 'Shipping must be FREE (0) if eligible');
    assertEqual(totals.freeShippingStatus, 'FREE', 'Free shipping status wrong');
    console.log('✅ Case D Passed!');

    // ==========================================
    // CASE E: Free Shipping Not Eligible
    // ==========================================
    console.log('\n--- Case E: Free Shipping Not Eligible ---');
    // Set free shipping threshold above product selling price
    await db.query(
      `INSERT INTO store_settings (setting_key, setting_value, category)
       VALUES ('store_shipping', '{"enableFreeShipping": true, "minFreeShippingOrder": ${Math.floor(sellingPrice + 1000)}}', 'shipping')
       ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value`
    );

    totals = await calculateOrderTotals({
      items,
      shippingMethodId: firstShipMethod.id,
      couponCode: null,
      userId: user.id
    });
    assertEqual(totals.shippingAmount, shippingChargeVal, 'Configured shipping charge must apply');
    assertEqual(totals.freeShippingStatus, 'PAID', 'Free shipping status wrong');
    console.log('✅ Case E Passed!');

    // ==========================================
    // CASE F: Historical Orders NULL check
    // ==========================================
    console.log('\n--- Case F: Historical Orders Preservation ---');
    const oldOrderNum = `HS-OLD-${Date.now()}`;
    const testAddress = { name: 'Old Customer', street: 'Old Way' };
    const oldOrderIns = await db.query(
      `INSERT INTO orders (user_id, order_number, total_amount, payment_method, payment_status, order_status, shipping_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [user.id, oldOrderNum, 999.00, 'COD', 'Pending', 'Confirmed', JSON.stringify(testAddress)]
    );
    const oldOrder = oldOrderIns.rows[0];

    const fetchedOldOrder = await orderService.getById(oldOrder.id);
    assertEqual(fetchedOldOrder.subtotal, null, 'Historical order subtotal must be NULL');
    assertEqual(fetchedOldOrder.gstRate, null, 'Historical order gstRate must be NULL');
    assertEqual(fetchedOldOrder.shipping, null, 'Historical order shipping must be NULL');
    assertEqual(fetchedOldOrder.amount, 999.00, 'Historical order total must remain exactly preserved');
    console.log('✅ Case F Passed!');

    // ==========================================
    // CASE G: Saree Crown Reward Verification
    // ==========================================
    console.log('\n--- Case G: Saree Crown reward rules ---');
    
    // Create Saree Crown campaign and voter state
    const winningProductId = product1.id;
    
    await db.query(`DELETE FROM saree_crown_votes WHERE user_id = $1`, [user.id]);
    await db.query(`DELETE FROM saree_crown_campaign`);
    
    const campaignIns = await db.query(
      `INSERT INTO saree_crown_campaign (name, enabled, winner_revealed, winner_product_id, reward_type, reward_value)
       VALUES ('August Saree Crown', true, true, $1, 'percentage', 20.00) RETURNING *`,
      [winningProductId]
    );
    const campaign = campaignIns.rows[0];

    // Case G1: Not voted check
    try {
      await calculateOrderTotals({
        items: [{ id: winningProductId, quantity: 1, is_saree_crown: true }],
        shippingMethodId: firstShipMethod.id,
        couponCode: 'SAREECROWN',
        userId: user.id
      });
      throw new Error('Saree Crown reward applied even though user did not vote');
    } catch (e) {
      if (!e.message.includes('Only customers who voted')) throw e;
      console.log('✅ Saree Crown Case G1: Rejected non-voters (Success)');
    }

    // Cast vote for user
    await db.query(
      `INSERT INTO saree_crown_votes (campaign_id, user_id, product_id) VALUES ($1, $2, $3)`,
      [campaign.id, user.id, winningProductId]
    );

    // Case G2: Voted user applying reward correctly (20% percentage discount only on 1 unit)
    const crownItems = [
      { id: winningProductId, quantity: 2, price: sellingPrice, originalPrice: originalPrice, is_saree_crown: true }
    ];
    // Formula: Subtotal of 2 items is 2 * originalPrice.
    // Product-level discount: 2 * (originalPrice - sellingPrice).
    // Coupon-level discount: applied ONLY on 1 unit of winning product price: sellingPrice * 0.20
    const calculatedG2 = await calculateOrderTotals({
      items: crownItems,
      shippingMethodId: firstShipMethod.id,
      couponCode: 'SAREECROWN',
      userId: user.id
    });
    
    const expectedCouponDiscountG2 = Math.round(sellingPrice * 0.20);
    assertEqual(calculatedG2.couponDiscount, expectedCouponDiscountG2, 'Saree Crown 20% discount calculation wrong');
    console.log('✅ Saree Crown Case G2: Applied percentage reward on 1 unit (Success)');

    console.log('\n✨ All tests completed successfully! Clean audit passed.');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message || error);
    process.exit(1);
  } finally {
    // Restore original settings
    if (originalTaxSettings) {
      await db.query(`UPDATE store_settings SET setting_value = $1 WHERE setting_key = 'store_tax'`, [JSON.stringify(originalTaxSettings)]);
    }
    if (originalShippingSettings) {
      await db.query(`UPDATE store_settings SET setting_value = $1 WHERE setting_key = 'store_shipping'`, [JSON.stringify(originalShippingSettings)]);
    }
    process.exit(0);
  }
}

runTests();
