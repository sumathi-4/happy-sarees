require('dotenv').config();
const db = require('./db');

async function migrateProductSpecifications() {
  console.log('--- CREATING product_specifications TABLE IN NEON POSTGRESQL ---');

  await db.query(`
    CREATE TABLE IF NOT EXISTS product_specifications (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      master_type_id INTEGER NOT NULL REFERENCES master_types(id) ON DELETE CASCADE,
      master_value_id INTEGER REFERENCES master_items(id) ON DELETE CASCADE,
      custom_value TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_product_master_type UNIQUE(product_id, master_type_id)
    );
  `);

  console.log('✅ product_specifications TABLE CREATED / VERIFIED SUCCESSFULLY!');
  process.exit(0);
}

migrateProductSpecifications().catch(e => { console.error('MIGRATION ERROR:', e); process.exit(1); });
