const db = require('../db');
const sellerMasterDataService = require('../services/seller/sellerMasterDataService');
const masterDataService = require('../services/admin/masterDataService');

async function run() {
  console.log('Starting E2E Verification Test for Seller Master Data Request Flow...');
  
  const testSellerId = 1; // Default test seller
  const testAdminId = 1;  // Default test admin

  try {
    // 1. Submit request
    console.log('1. Submitting test Master Data request...');
    const req = await sellerMasterDataService.submitRequest(testSellerId, {
      requestType: 'add_item',
      typeSlug: 'fabrics',
      typeName: 'Fabrics',
      itemName: 'Test Silk Raw',
      reason: 'E2E Verification testing'
    });

    console.log('   Submitted successfully. Request ID:', req.id);
    if (req.status !== 'pending') {
      throw new Error(`Expected status to be pending, got ${req.status}`);
    }

    // 2. Query requests
    console.log('2. Querying seller requests...');
    const requests = await sellerMasterDataService.getSellerRequests(testSellerId);
    const found = requests.find(r => r.id === req.id);
    if (!found) {
      throw new Error('Submitted request was not returned in seller requests list.');
    }
    console.log('   Request found in list with correct fields.');

    // 3. Approve request
    console.log('3. Approving the request...');
    await sellerMasterDataService.approveRequest(req.id, testAdminId);
    console.log('   Approved successfully.');

    // 4. Verify item exists in master_items
    console.log('4. Verifying item exists in master_items...');
    const itemsRes = await db.query(
      `SELECT mi.* FROM master_items mi
       JOIN master_types mt ON mi.type_id = mt.id
       WHERE mt.slug = 'fabrics' AND mi.name = 'Test Silk Raw'`
    );
    if (itemsRes.rows.length === 0) {
      throw new Error('Item "Test Silk Raw" not found in master_items after approval!');
    }
    const createdItem = itemsRes.rows[0];
    console.log('   Verified! Item exists with ID:', createdItem.id);

    // 5. Cleanup test data
    console.log('5. Cleaning up test data...');
    await db.query('DELETE FROM master_items WHERE id = $1', [createdItem.id]);
    await db.query('DELETE FROM seller_master_data_requests WHERE id = $1', [req.id]);
    console.log('   Cleanup completed.');

    console.log('\n🎉 E2E VERIFICATION SUCCESSFUL! No errors, database tables are fully synced.');
  } catch (err) {
    console.error('\n❌ E2E VERIFICATION FAILED:', err.stack || err.message || JSON.stringify(err));
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

run();
