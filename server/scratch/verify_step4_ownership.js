const db = require('../db');
const sellerMasterDataService = require('../services/seller/sellerMasterDataService');

async function run() {
  let sellerAId, sellerBId, adminItemId, adminTypeId, sellerItemId;
  const createdRequestIds = [];

  try {
    const sellersRes = await db.pool.query(`SELECT id FROM sellers ORDER BY id LIMIT 2`);
    if (sellersRes.rows.length < 1) throw new Error('Need at least 1 seller in DB');
    sellerAId = sellersRes.rows[0].id;
    if (sellersRes.rows.length >= 2) {
      sellerBId = sellersRes.rows[1].id;
    } else {
      const checkB = await db.pool.query(`SELECT id FROM sellers WHERE email='sellerb_v4@example.com'`);
      if (checkB.rows.length > 0) {
        sellerBId = checkB.rows[0].id;
      } else {
        const ins = await db.pool.query(
          `INSERT INTO sellers (name,email,password,status,business_name,owner_name,phone,street_address,city,state,pincode,bank_account_name,bank_account_no,bank_ifsc,bank_name)
           VALUES ('Seller B','sellerb_v4@example.com','pwd','approved','B Co','B','8888888888','St','City','State','600001','Bank','9999','HDFC0001','HDFC')
           RETURNING id`);
        sellerBId = ins.rows[0].id;
      }
    }
    console.log(`Seller A=${sellerAId}, Seller B=${sellerBId}`);

    const adminItem = await db.pool.query(`SELECT id FROM master_items WHERE source='admin' LIMIT 1`);
    if (!adminItem.rows.length) throw new Error('No admin items');
    adminItemId = adminItem.rows[0].id;

    const adminType = await db.pool.query(`SELECT id FROM master_types WHERE source='admin' LIMIT 1`);
    if (!adminType.rows.length) throw new Error('No admin types');
    adminTypeId = adminType.rows[0].id;

    const typeRes = await db.pool.query(`SELECT id FROM master_types LIMIT 1`);
    const typeId = typeRes.rows[0].id;
    const checkItem = await db.pool.query(`SELECT id FROM master_items WHERE slug='sellera-owneditem-step4'`);
    if (checkItem.rows.length > 0) {
      sellerItemId = checkItem.rows[0].id;
      await db.pool.query(`UPDATE master_items SET created_by_seller_id=$1, source='seller' WHERE id=$2`, [sellerAId, sellerItemId]);
    } else {
      const ins2 = await db.pool.query(
        `INSERT INTO master_items (type_id,name,slug,is_active,source,created_by_seller_id)
         VALUES ($1,'SellerA_OwnedItem_Step4','sellera-owneditem-step4',true,'seller',$2)
         RETURNING id`,
        [typeId, sellerAId]);
      sellerItemId = ins2.rows[0].id;
    }
    console.log(`Admin item=${adminItemId}, Admin type=${adminTypeId}, Seller item=${sellerItemId}`);

    console.log('\n--- Case 1: Seller A edits admin item (expects 403) ---');
    try {
      await sellerMasterDataService.submitRequest(sellerAId, { requestType:'edit_item', targetItemId:adminItemId, itemName:'Hack', reason:'test' });
      console.error('FAIL: no error thrown');
    } catch(e) {
      if(e.status===403) console.log('PASS: 403 -', e.message.slice(0,80));
      else console.error('FAIL: wrong status', e.status, e.message.slice(0,80));
    }

    console.log('\n--- Case 2: Seller A deletes admin type (expects 403) ---');
    try {
      await sellerMasterDataService.submitRequest(sellerAId, { requestType:'delete_type', targetTypeId:adminTypeId, reason:'test' });
      console.error('FAIL: no error thrown');
    } catch(e) {
      if(e.status===403) console.log('PASS: 403 -', e.message.slice(0,80));
      else console.error('FAIL: wrong status', e.status, e.message.slice(0,80));
    }

    console.log('\n--- Case 3: Seller B edits Seller A item (expects 403) ---');
    try {
      await sellerMasterDataService.submitRequest(sellerBId, { requestType:'edit_item', targetItemId:sellerItemId, itemName:'Stolen', reason:'test' });
      console.error('FAIL: no error thrown');
    } catch(e) {
      if(e.status===403) console.log('PASS: 403 -', e.message.slice(0,80));
      else console.error('FAIL: wrong status', e.status, e.message.slice(0,80));
    }

    console.log('\n--- Case 4: Seller A edits OWN item (expects success) ---');
    try {
      const r = await sellerMasterDataService.submitRequest(sellerAId, { requestType:'edit_item', targetItemId:sellerItemId, itemName:'Updated Legitimately', reason:'owner edit' });
      console.log('PASS: request ID', r.id, 'status', r.status);
      createdRequestIds.push(r.id);
    } catch(e) {
      console.error('FAIL: unexpected error', e.message);
    }

  } catch(e) {
    console.error('Setup error:', e.message);
  } finally {
    for(const rid of createdRequestIds)
      await db.pool.query(`DELETE FROM seller_master_data_requests WHERE id=$1`,[rid]).catch(()=>{});
    if(sellerItemId)
      await db.pool.query(`DELETE FROM master_items WHERE id=$1`,[sellerItemId]).catch(()=>{});
    await db.pool.query(`DELETE FROM sellers WHERE email='sellerb_v4@example.com'`).catch(()=>{});
    await db.pool.end();
    process.exit(0);
  }
}
run();
