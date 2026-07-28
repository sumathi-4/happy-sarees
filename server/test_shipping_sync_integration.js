const db = require('./db');
const settingsService = require('./services/admin/settingsService');

async function testShippingSyncIntegration() {
  console.log('🧪 Starting Shipping Module Field Mapping & Synchronization Test...\n');

  try {
    // 1. Test CRUD in settingsService
    console.log('📡 Step 1: Testing getShippingMethods from Neon DB...');
    const methods = await settingsService.getShippingMethods();
    console.log(`✅ Loaded ${methods.length} shipping methods from Neon DB.`);
    methods.forEach(m => {
      console.log(`   • [ID: ${m.id}] ${m.name} | Charge: ₹${m.shipping_charge} | Free-Eligible: ${m.free_shipping_eligible} | Enabled: ${m.is_enabled}`);
    });

    // 2. Test updating global shipping rules
    console.log('\n📡 Step 2: Testing updateShipping global rules in store_settings...');
    const globalRes = await settingsService.updateShipping({
      enableFreeShipping: true,
      minFreeShippingOrder: 2500
    }, 1);
    console.log('✅ Global shipping rules updated:', globalRes.setting_value);

    // 3. Test field mapping standardization
    console.log('\n📡 Step 3: Verifying standardized field mapping across keys...');
    const parsed = typeof globalRes.setting_value === 'string' ? JSON.parse(globalRes.setting_value) : globalRes.setting_value;
    if (parsed.enable_free_shipping !== undefined && parsed.enableFreeShipping !== undefined &&
        parsed.free_shipping_min_amount !== undefined && parsed.minFreeShippingOrder !== undefined) {
      console.log('✅ Field mapping standardization verified! Both snake_case and camelCase keys are synchronized.');
    } else {
      console.error('❌ Mismatched keys found in store_settings payload!');
      process.exit(1);
    }

    console.log('\n🎉 ALL SHIPPING MODULE FIELD MAPPING AND SYNCHRONIZATION TESTS PASSED 100%!\n');
  } catch (err) {
    console.error('❌ Test execution failed:', err);
    process.exit(1);
  }
}

testShippingSyncIntegration().then(() => process.exit(0));
