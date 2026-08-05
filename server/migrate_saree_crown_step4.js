// migrate_saree_crown_step4.js
// Run once: node migrate_saree_crown_step4.js
require('dotenv').config();
const db = require('./db');

async function migrate() {
  console.log('Adding Step 4 columns to saree_crown_campaign table...');
  try {
    await db.query(`
      ALTER TABLE saree_crown_campaign
      ADD COLUMN IF NOT EXISTS voting_stopped BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS winner_product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS winner_revealed BOOLEAN NOT NULL DEFAULT FALSE
    `);
    console.log('✅ Columns added successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
