const db = require('../db');

async function testDuplicateInsert() {
  try {
    const res1 = await db.query(`
      INSERT INTO wishlist (user_id, product_id) VALUES (1, 1) ON CONFLICT (user_id, product_id) DO NOTHING RETURNING *
    `);
    console.log('Insert 1:', res1.rows);
  } catch (err) {
    console.error('Insert 1 ERROR:', err.message);
  }

  try {
    const res2 = await db.query(`
      INSERT INTO wishlist (user_id, product_id) VALUES (1, 1) ON CONFLICT (user_id, product_id) DO NOTHING RETURNING *
    `);
    console.log('Insert 2:', res2.rows);
  } catch (err) {
    console.error('Insert 2 ERROR:', err.message);
  }
}

testDuplicateInsert().then(() => process.exit(0));
