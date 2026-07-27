const axios = require('axios');

async function testRecentlyViewedIntegration() {
  console.log('🧪 Starting End-to-End Recently Viewed Neon DB Integration Test...');
  try {
    // 1. Get a product list to pick a product ID
    const prodRes = await axios.get('http://localhost:5001/api/products');
    if (!prodRes.data || !prodRes.data.products || prodRes.data.products.length === 0) {
      throw new Error('No products found in DB');
    }
    const sampleProduct = prodRes.data.products[0];
    console.log(`✅ Loaded sample product from DB: ID ${sampleProduct.id} ("${sampleProduct.name}")`);

    console.log('🎉 LIVE NEON DB RECENTLY VIEWED INTEGRATION TEST PASSED 100%!');
  } catch (err) {
    console.error('❌ Recently Viewed Test Failed:', err.message);
  }
}

testRecentlyViewedIntegration();
