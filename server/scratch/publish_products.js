const db = require('../db');

async function publishAll() {
  try {
    const res = await db.query("UPDATE products SET status = 'published' WHERE status IS NULL OR LOWER(status) = 'draft'");
    console.log(`✅ ALL ${res.rowCount} PRODUCTS UPDATED TO PUBLISHED!`);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    process.exit(0);
  }
}

publishAll();
