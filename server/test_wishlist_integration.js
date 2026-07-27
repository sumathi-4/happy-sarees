require('dotenv').config();
const db = require('./db');

async function testWishlistIntegration() {
  console.log('--- TESTING LIVE NEON POSTGRESQL WISHLIST SYNCHRONIZATION ---');

  // 1. Fetch test user
  const userRes = await db.query(`SELECT id, email FROM users LIMIT 1`);
  if (!userRes.rows.length) {
    console.error('❌ No test user found!');
    process.exit(1);
  }
  const user = userRes.rows[0];

  // 2. Fetch test product
  const prodRes = await db.query(`SELECT id, name, price, fabric FROM products WHERE deleted_at IS NULL LIMIT 1`);
  if (!prodRes.rows.length) {
    console.error('❌ No test product found!');
    process.exit(1);
  }
  const product = prodRes.rows[0];

  console.log(`👤 User: ID ${user.id} (${user.email})`);
  console.log(`🛍️ Product: ID ${product.id} (${product.name})`);

  // 3. Add to Wishlist
  await db.query(
    `INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) ON CONFLICT (user_id, product_id) DO NOTHING`,
    [user.id, product.id]
  );
  console.log('✅ Inserted item into wishlist table in Neon DB');

  // 4. Perform Live Joined SQL Query
  const fetchRes = await db.query(
    `SELECT w.id as wishlist_id, w.created_at as added_at, p.* 
     FROM wishlist w
     JOIN products p ON w.product_id = p.id
     WHERE w.user_id = $1 AND p.id = $2 AND p.deleted_at IS NULL`,
    [user.id, product.id]
  );

  console.log('📦 Joined Wishlist Result from Neon DB:', fetchRes.rows[0]);
  if (!fetchRes.rows.length) {
    console.error('❌ Joined Wishlist Query Failed!');
    process.exit(1);
  }

  // 5. Clean up test record
  await db.query(`DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2`, [user.id, product.id]);
  console.log('🧹 Cleaned up test wishlist record.');

  console.log('🎉 LIVE NEON DB WISHLIST SYNCHRONIZATION TEST PASSED 100%!');
  process.exit(0);
}

testWishlistIntegration().catch(e => { console.error('Wishlist Test Error:', e); process.exit(1); });
