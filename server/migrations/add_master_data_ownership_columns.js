/**
 * Migration: Add Master Data Ownership Columns (STEP 1)
 * Run once via: node server/migrations/add_master_data_ownership_columns.js
 */
const db = require('../db');

async function migrate() {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Add ownership/source columns to master_types
    await client.query(`
      ALTER TABLE master_types 
      ADD COLUMN IF NOT EXISTS created_by_seller_id INTEGER REFERENCES sellers(id) ON DELETE SET NULL
    `);
    
    await client.query(`
      ALTER TABLE master_types 
      ADD COLUMN IF NOT EXISTS source VARCHAR(10) NOT NULL DEFAULT 'admin' CHECK (source IN ('admin','seller'))
    `);

    // Add ownership/source columns to master_items
    await client.query(`
      ALTER TABLE master_items 
      ADD COLUMN IF NOT EXISTS created_by_seller_id INTEGER REFERENCES sellers(id) ON DELETE SET NULL
    `);

    await client.query(`
      ALTER TABLE master_items 
      ADD COLUMN IF NOT EXISTS source VARCHAR(10) NOT NULL DEFAULT 'admin' CHECK (source IN ('admin','seller'))
    `);

    await client.query('COMMIT');
    console.log('[Migration] Ownership columns successfully added to master_types and master_items.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Migration] Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();
