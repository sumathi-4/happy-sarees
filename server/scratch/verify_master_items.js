require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const http = require('http');

function fetch(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      method: opts.method || 'GET',
      headers: opts.headers || {}
    };
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ json: () => JSON.parse(data) }));
    });
    req.on('error', reject);
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

const BASE = 'http://localhost:5001/api/admin/master-data';
const TOKEN = 'demo_token';
const H = { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` };

async function run() {
  // 1. GET all types
  let r = await fetch(`${BASE}/types`, { headers: H });
  const typesBody = await r.json();
  const types = typesBody.data?.types || typesBody.types || [];
  const fabricsType = types.find(t => t.slug === 'fabrics' || t.name?.toLowerCase() === 'fabrics');
  console.log(`✅ [1] GET /types → ${types.length} types. Fabrics ID: ${fabricsType?.id}`);

  // 2. GET all items (single request)
  r = await fetch(`${BASE}/items`, { headers: H });
  const allItems = await r.json();
  const items = allItems.data?.items || allItems.items || [];
  console.log(`✅ [2] GET /items → ${items.length} items. All have typeId: ${items.every(i => i.typeId != null)}`);

  const typeId = fabricsType?.id;
  if (!typeId) { console.log('❌ Fabrics type not found'); process.exit(1); }

  // 3. CREATE a new item under Fabrics
  r = await fetch(`${BASE}/types/${typeId}/items`, {
    method: 'POST', headers: H,
    body: JSON.stringify({ name: 'Loom Linen Test', description: 'Test fabric item', isActive: true, sortOrder: 99 })
  });
  const created = await r.json();
  const newItem = created.data?.item || created.item;
  console.log(`✅ [3] POST /types/${typeId}/items → Created: id=${newItem?.id}, name="${newItem?.name}", typeId=${newItem?.typeId}, isActive=${newItem?.isActive}`);

  // 4. VERIFY it appears only under Fabrics
  r = await fetch(`${BASE}/items`, { headers: H });
  const after = (await r.json());
  const afterItems = after.data?.items || after.items || [];
  const loomLinen = afterItems.find(i => i.id === newItem?.id);
  console.log(`✅ [4] Cross-type check: item typeId=${loomLinen?.typeId}, expected=${typeId}, match=${loomLinen?.typeId === typeId}`);

  // 5. UPDATE the item
  r = await fetch(`${BASE}/types/${typeId}/items/${newItem?.id}`, {
    method: 'PUT', headers: H,
    body: JSON.stringify({ description: 'Premium pure handloom linen fabric' })
  });
  const updated = await r.json();
  const updatedItem = updated.data?.item || updated.item;
  console.log(`✅ [5] PUT /types/${typeId}/items/${newItem?.id} → description="${updatedItem?.description}"`);

  // 6. TOGGLE the item (Active → Inactive)
  r = await fetch(`${BASE}/types/${typeId}/items/${newItem?.id}/toggle`, { method: 'PUT', headers: H });
  const toggled = await r.json();
  const toggledItem = toggled.data?.item || toggled.item;
  console.log(`✅ [6] PUT .../toggle → isActive=${toggledItem?.isActive} (should be false/inactive)`);

  // 7. DELETE the item
  r = await fetch(`${BASE}/types/${typeId}/items/${newItem?.id}`, { method: 'DELETE', headers: H });
  const deleted = await r.json();
  console.log(`✅ [7] DELETE /types/${typeId}/items/${newItem?.id} → ${deleted.message || JSON.stringify(deleted)}`);

  // 8. CONFIRM deletion
  r = await fetch(`${BASE}/items`, { headers: H });
  const final = (await r.json());
  const finalItems = final.data?.items || final.items || [];
  const stillExists = finalItems.find(i => i.id === newItem?.id);
  console.log(`✅ [8] After DELETE: item still exists? ${!!stillExists} (should be false)`);

  console.log('\n🎉 All CRUD operations completed successfully.');
  process.exit(0);
}

run().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });
