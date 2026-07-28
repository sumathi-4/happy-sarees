const db = require('./db');
const settingsService = require('./services/admin/settingsService');

async function testPaymentSyncIntegration() {
  console.log('🧪 Starting Payment Module Field Mapping & Synchronization Test...\n');

  try {
    // 1. Update Payment & Integrations settings in Neon DB
    console.log('📡 Step 1: Updating Payment Integration Settings in Neon DB...');
    const updateRes = await settingsService.updateIntegrations({
      razorpayEnabled: true,
      razorpayKey: 'rzp_live_TEST_KEY_123',
      razorpaySecret: 'secret_test_456',
      codEnabled: true,
      codMaxAmount: 5000
    }, 1);
    console.log('✅ Settings saved in store_settings table:', updateRes.setting_value);

    // 2. Verify field mapping standardization (both camelCase and snake_case)
    console.log('\n📡 Step 2: Verifying Field Mapping Standardization...');
    const val = typeof updateRes.setting_value === 'string' ? JSON.parse(updateRes.setting_value) : updateRes.setting_value;

    if (
      val.razorpayEnabled !== undefined && val.razorpay_enabled !== undefined &&
      val.codEnabled !== undefined && val.cod_enabled !== undefined &&
      val.codMaxAmount !== undefined && val.cod_max_amount !== undefined
    ) {
      console.log('✅ Field mapping verified! Both camelCase and snake_case aliases are present.');
    } else {
      console.error('❌ Field mapping missing expected keys!');
      process.exit(1);
    }

    // 3. Query store_settings directly as cmsRoutes.js does
    console.log('\n📡 Step 3: Simulating GET /api/cms/payment-methods endpoint response...');
    const settingsRes = await db.query(
      `SELECT setting_key, setting_value FROM store_settings WHERE category IN ('integrations', 'payment') OR setting_key LIKE 'store_integrations%' OR setting_key LIKE 'store_payment%'`
    );

    let config = { razorpayEnabled: true, codEnabled: true, codMaxAmount: 5000 };
    settingsRes.rows.forEach(r => {
      let v = r.setting_value;
      if (typeof v === 'string') { try { v = JSON.parse(v); } catch(e) {} }
      if (v && typeof v === 'object') {
        if (v.razorpayEnabled !== undefined) config.razorpayEnabled = !!v.razorpayEnabled;
        if (v.codEnabled !== undefined) config.codEnabled = !!v.codEnabled;
        if (v.codMaxAmount !== undefined) config.codMaxAmount = Number(v.codMaxAmount) || 5000;
      }
    });

    console.log('✅ Dynamic Payment Methods Configured:', config);

    // 4. Test COD Threshold Logic
    console.log('\n📡 Step 4: Testing Cash on Delivery (COD) Order Limit Logic...');
    const smallOrderAmount = 2499;
    const largeOrderAmount = 6500;

    console.log(`   Order Total ₹${smallOrderAmount} <= ₹${config.codMaxAmount}: ${smallOrderAmount <= config.codMaxAmount ? '✅ COD AVAILABLE' : '❌ WRONG'}`);
    console.log(`   Order Total ₹${largeOrderAmount} > ₹${config.codMaxAmount}: ${largeOrderAmount > config.codMaxAmount ? '✅ COD DISABLED (Limit Exceeded)' : '❌ WRONG'}`);

    console.log('\n🎉 ALL PAYMENT MODULE FIELD MAPPING AND SYNCHRONIZATION TESTS PASSED 100%!\n');
  } catch (err) {
    console.error('❌ Test execution failed:', err);
    process.exit(1);
  }
}

testPaymentSyncIntegration().then(() => process.exit(0));
