const db = require('../db');

async function inspectMasterDB() {
  try {
    const typesRes = await db.query(`SELECT * FROM master_types ORDER BY id ASC`);
    console.log('--- MASTER TYPES IN NEON DB ---');
    console.log(typesRes.rows);

    const itemsRes = await db.query(`
      SELECT mi.*, mt.name as type_name, mt.slug as type_slug 
      FROM master_items mi 
      JOIN master_types mt ON mi.type_id = mt.id 
      ORDER BY mi.id ASC
    `);
    console.log(`--- MASTER ITEMS IN NEON DB (${itemsRes.rows.length} total) ---`);
    console.log(itemsRes.rows.slice(0, 15));
  } catch (err) {
    console.error('INSPECT ERROR:', err);
  }
}

inspectMasterDB().then(() => process.exit(0));
