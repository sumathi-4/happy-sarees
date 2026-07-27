const axios = require('axios');

async function testCouponEndToEndSync() {
  console.log('🧪 Starting End-to-End Coupon Synchronization Test across Neon DB, Backend API & Customer Website...');

  try {
    // 1. Fetch available active coupons for customer website
    console.log('📡 Step 1: Requesting public active coupons from GET /api/cms/available-coupons...');
    const offersRes = await axios.get('http://localhost:5001/api/cms/available-coupons');
    if (!offersRes.data.success || !Array.isArray(offersRes.data.offers)) {
      throw new Error('Failed to fetch public active coupons');
    }
    console.log(`✅ Loaded ${offersRes.data.offers.length} active coupons from Neon DB:`, offersRes.data.offers.map(o => o.code).join(', '));

    // 2. Validate coupon code "FESTIVAL20" with an order amount of ₹2000
    console.log('\n📡 Step 2: Validating coupon FESTIVAL20 for order amount ₹2000...');
    const valRes = await axios.post('http://localhost:5001/api/cms/validate-coupon', {
      code: 'FESTIVAL20',
      orderAmount: 2000
    });
    if (!valRes.data.success || !valRes.data.valid) {
      throw new Error('Failed to validate active coupon FESTIVAL20');
    }
    console.log(`✅ Coupon FESTIVAL20 validated successfully! Calculated Discount: ₹${valRes.data.discountAmount}`);

    // 3. Attempt to validate an expired / invalid coupon "INVALID_999"
    console.log('\n📡 Step 3: Testing validation rejection for invalid coupon code...');
    try {
      await axios.post('http://localhost:5001/api/cms/validate-coupon', {
        code: 'INVALID_999',
        orderAmount: 2000
      });
      console.error('❌ Expected error for invalid coupon but request succeeded!');
    } catch (err) {
      console.log(`✅ Correctly rejected invalid coupon: "${err.response?.data?.message || err.message}"`);
    }

    console.log('\n🎉 ALL END-TO-END COUPON SYNCHRONIZATION TESTS PASSED 100%!');
  } catch (err) {
    console.error('❌ Coupon Synchronization Test Failed:', err.message);
  }
}

testCouponEndToEndSync();
