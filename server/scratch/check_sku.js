const db = require('../db');

async function checkSku() {
  try {
    const res = await db.query("SELECT id, name, sku, status, category_id, fabric, color, price, is_new_arrival, deleted_at FROM products WHERE sku LIKE '%8777%' OR name ILIKE '%past%'");
    console.log('RESULTS:', res.rows);
  } catch (e) {
    console.error(e.message);
  } finally {
    process.exit(0);
  }
}

checkSku();
