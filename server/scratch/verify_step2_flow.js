const db = require('../db');
const sellerMasterDataService = require('../services/seller/sellerMasterDataService');

async function runTest() {
  try {
    // Let's get an existing seller ID
    const sellerRes = await db.pool.query('SELECT id FROM sellers LIMIT 1');
    if (sellerRes.rows.length === 0) {
      console.log('No seller found in the database. Creating dummy seller for test...');
      await db.pool.query(`
        INSERT INTO sellers (name, email, password, status, business_name, owner_name, phone, street_address, city, state, pincode, bank_account_name, bank_account_no, bank_ifsc, bank_name)
        VALUES ('Test Seller', 'test@example.com', 'pwd123', 'approved', 'Boutique', 'Rajesh', '9999999999', 'Road', 'City', 'State', '631501', 'BankName', '123', 'SBIN0001234', 'SBI')
        ON CONFLICT DO NOTHING
      `);
    }
    const sellerResFinal = await db.pool.query('SELECT id FROM sellers LIMIT 1');
    const sellerId = sellerResFinal.rows[0].id;

    // Let's get an admin ID (or just use 1)
    const adminId = 1;

    // Let's find a valid master type slug (e.g., 'fabrics', 'colors')
    const typeRes = await db.pool.query('SELECT slug FROM master_types LIMIT 1');
    if (typeRes.rows.length === 0) {
      throw new Error('No master types found to run tests.');
    }
    const typeSlug = typeRes.rows[0].slug;

    console.log(`Using sellerId=${sellerId}, typeSlug=${typeSlug}`);

    // ============================================================
    // CASE 1: SUCCESS PATH
    // ============================================================
    console.log('\n--- Running Case 1: Success Path ---');
    const insertRequestRes = await db.pool.query(
      `INSERT INTO seller_master_data_requests (seller_id, request_type, type_slug, type_name, item_name, payload, status)
       VALUES ($1, 'add_item', $2, 'TestCategory', 'SuperSilkVerification', '{}', 'pending')
       RETURNING id`,
      [sellerId, typeSlug]
    );
    const requestId = insertRequestRes.rows[0].id;
    console.log(`Created request ID: ${requestId}`);

    // Approve the request
    await sellerMasterDataService.approveRequest(requestId, adminId);
    console.log('approveRequest ran successfully.');

    // Check if the item exists in master_items with correct source and creator
    const itemRes = await db.pool.query('SELECT * FROM master_items WHERE name = $1', ['SuperSilkVerification']);
    console.log('Resulting master_item:', itemRes.rows[0]);
    if (itemRes.rows.length > 0 && itemRes.rows[0].source === 'seller' && itemRes.rows[0].created_by_seller_id === sellerId) {
      console.log('✅ Success: Master item created with correct source and created_by_seller_id.');
    } else {
      console.error('❌ Failure: Master item not created properly.');
    }

    // Check status of request
    const statusRes = await db.pool.query('SELECT status FROM seller_master_data_requests WHERE id = $1', [requestId]);
    console.log('Request status:', statusRes.rows[0].status);
    if (statusRes.rows[0].status === 'approved') {
      console.log('✅ Success: Request status marked approved.');
    } else {
      console.error('❌ Failure: Request status not marked approved.');
    }

    // Cleanup Case 1
    await db.pool.query('DELETE FROM master_items WHERE name = $1', ['SuperSilkVerification']);
    await db.pool.query('DELETE FROM seller_master_data_requests WHERE id = $1', [requestId]);
    console.log('Cleaned up Case 1.');

    // ============================================================
    // CASE 2: FAILURE PATH (Rollback transaction)
    // ============================================================
    console.log('\n--- Running Case 2: Failure Path ---');
    const insertCorruptRes = await db.pool.query(
      `INSERT INTO seller_master_data_requests (seller_id, request_type, type_slug, type_name, item_name, payload, status)
       VALUES ($1, 'add_item', 'corrupted_fabrics_slug_xyz', 'CorruptCategory', 'CorruptedSilkVerification', '{}', 'pending')
       RETURNING id`,
      [sellerId]
    );
    const corruptRequestId = insertCorruptRes.rows[0].id;
    console.log(`Created corrupt request ID: ${corruptRequestId}`);

    let errorThrown = false;
    try {
      await sellerMasterDataService.approveRequest(corruptRequestId, adminId);
    } catch (err) {
      errorThrown = true;
      console.log('Expected error caught during approval:', err.message);
    }

    if (errorThrown) {
      console.log('✅ Success: Error was thrown on invalid request.');
    } else {
      console.error('❌ Failure: No error was thrown on invalid request.');
    }

    // Verify master_items does NOT contain 'CorruptedSilkVerification'
    const corruptItemRes = await db.pool.query('SELECT * FROM master_items WHERE name = $1', ['CorruptedSilkVerification']);
    if (corruptItemRes.rows.length === 0) {
      console.log('✅ Success: No orphaned master_item was inserted (Rollback verified).');
    } else {
      console.error('❌ Failure: Orphaned item was inserted despite exception!:', corruptItemRes.rows[0]);
    }

    // Verify request status is still 'pending'
    const corruptStatusRes = await db.pool.query('SELECT status FROM seller_master_data_requests WHERE id = $1', [corruptRequestId]);
    if (corruptStatusRes.rows[0].status === 'pending') {
      console.log('✅ Success: Request status remains pending (Rollback verified).');
    } else {
      console.error('❌ Failure: Request status was updated despite exception!:', corruptStatusRes.rows[0].status);
    }

    // Cleanup Case 2
    await db.pool.query('DELETE FROM master_items WHERE name = $1', ['CorruptedSilkVerification']);
    await db.pool.query('DELETE FROM seller_master_data_requests WHERE id = $1', [corruptRequestId]);
    console.log('Cleaned up Case 2.');

  } catch (err) {
    console.error('E2E Test encountered error:', err);
  } finally {
    await db.pool.end();
    process.exit(0);
  }
}

runTest();
