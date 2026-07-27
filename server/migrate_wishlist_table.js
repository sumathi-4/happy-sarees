require('dotenv').config();
const db = require('./db');

async function migrateWishlistTable() {
  console.log('--- CREATING / VERIFYING wishlist TABLE IN NEON POSTGRESQL ---');

  await db.query(`
    CREATE TABLE IF NOT EXISTS wishlist (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_user_product_wishlist UNIQUE(user_id, product_id)
    );
  `);

  console.log('✅ wishlist TABLE VERIFIED / CREATED SUCCESSFULLY IN NEON DB!');
  process.exit(0);
}

migrateWishlistTable().catch(e => { console.error('WISHLIST MIGRATION ERROR:', e); process.exit(1); });
