const db = require('../db');
const svc = require('../services/seller/sellerMasterDataService');
async function go() {
  const [items, types, sellers] = await Promise.all([
    db.pool.query("SELECT id FROM master_items WHERE source='admin' LIMIT 1"),
    db.pool.query("SELECT id FROM master_types WHERE source='admin' LIMIT 1"),
    db.pool.query('SELECT id FROM sellers ORDER BY id LIMIT 2')
  ]);
  const adminItemId = items.rows[0].id;
  const adminTypeId = types.rows[0].id;
  const sellerAId = sellers.rows[0].id;
  const sellerBId = sellers.rows.length > 1 ? sellers.rows[1].id : sellers.rows[0].id;
  const typeId = (await db.pool.query('SELECT id FROM master_types LIMIT 1')).rows[0].id;
  const ownedSlug = 's4-owned-' + sellerAId + '-' + Date.now();
  const ins = await db.pool.query(
    "INSERT INTO master_items (type_id,name,slug,is_active,source,created_by_seller_id) VALUES ($1,$2,$3,true,'seller',$4) RETURNING id",
    [typeId, 'S4OwnedItem', ownedSlug, sellerAId]
  );
  const ownedId = ins.rows[0].id;
  console.log('Setup: adminItem=' + adminItemId + ' adminType=' + adminTypeId + ' A=' + sellerAId + ' B=' + sellerBId + ' owned=' + ownedId);

  let newReqId;
  // Case 1: Seller A edits admin item -> 403
  try { await svc.submitRequest(sellerAId,{requestType:'edit_item',targetItemId:adminItemId,itemName:'X',reason:'t'}); console.log('CASE1: FAIL no error'); }
  catch(e){ console.log('CASE1: ' + (e.status===403 ? 'PASS 403' : 'FAIL status='+e.status)); }
  // Case 2: Seller A deletes admin type -> 403
  try { await svc.submitRequest(sellerAId,{requestType:'delete_type',targetTypeId:adminTypeId,reason:'t'}); console.log('CASE2: FAIL no error'); }
  catch(e){ console.log('CASE2: ' + (e.status===403 ? 'PASS 403' : 'FAIL status='+e.status)); }
  // Case 3: Seller B edits Seller A item -> 403
  try { await svc.submitRequest(sellerBId,{requestType:'edit_item',targetItemId:ownedId,itemName:'Y',reason:'t'}); console.log('CASE3: FAIL no error'); }
  catch(e){ console.log('CASE3: ' + (e.status===403 ? 'PASS 403' : 'FAIL status='+e.status)); }
  // Case 4: Seller A edits own item -> success
  try { const r=await svc.submitRequest(sellerAId,{requestType:'edit_item',targetItemId:ownedId,itemName:'V',reason:'t'}); newReqId=r.id; console.log('CASE4: PASS id=' + r.id); }
  catch(e){ console.log('CASE4: FAIL ' + e.message.slice(0,80)); }

  if(newReqId) await db.pool.query('DELETE FROM seller_master_data_requests WHERE id=$1',[newReqId]);
  await db.pool.query('DELETE FROM master_items WHERE id=$1',[ownedId]);
  await db.pool.end(); process.exit(0);
}
go().catch(e=>{console.error('ERROR:',e.message);process.exit(1);});
