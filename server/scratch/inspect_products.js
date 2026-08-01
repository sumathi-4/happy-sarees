require('dotenv').config({ path: 'c:/Users/ELCOT/OneDrive/Desktop/job tasks/happy sarees/server/.env' });
const db = require('c:/Users/ELCOT/OneDrive/Desktop/job tasks/happy sarees/server/db');

async function inspect() {
  const productsCols = await db.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products'"
  );
  console.log('PRODUCTS COLUMNS:', productsCols.rows.map(c => `${c.column_name} (${c.data_type})`));

  const sampleProducts = await db.query("SELECT id, name, fabric, color, weave, border, occasion FROM products LIMIT 5");
  console.log('SAMPLE PRODUCTS:', sampleProducts.rows);

  const specsCount = await db.query("SELECT COUNT(*) FROM product_specifications");
  console.log('PRODUCT SPECIFICATIONS COUNT:', specsCount.rows[0].count);

  const sampleSpecs = await db.query(
    `SELECT ps.*, mt.slug as type_slug, mi.name as val_name 
     FROM product_specifications ps 
     JOIN master_types mt ON ps.master_type_id = mt.id 
     LEFT JOIN master_items mi ON ps.master_value_id = mi.id 
     LIMIT 10`
  );
  console.log('SAMPLE SPECIFICATIONS:', sampleSpecs.rows);

  process.exit(0);
}

inspect().catch(e => { console.error(e); process.exit(1); });
