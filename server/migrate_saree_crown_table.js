// migrate_saree_crown_table.js
// Run once: node migrate_saree_crown_table.js
require('dotenv').config();
const db = require('./db');

async function migrate() {
  try {
    // Main campaign config table - only ONE row ever (id=1)
    await db.query(`
      CREATE TABLE IF NOT EXISTS saree_crown_campaign (
        id           INTEGER PRIMARY KEY DEFAULT 1,
        enabled      BOOLEAN NOT NULL DEFAULT FALSE,
        voting_start TIMESTAMPTZ,
        voting_end   TIMESTAMPTZ,
        reward_type  VARCHAR(20) CHECK (reward_type IN ('free','percentage')),
        reward_value NUMERIC(5,2),
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Product associations - references existing products.id
    await db.query(`
      CREATE TABLE IF NOT EXISTS saree_crown_products (
        campaign_id  INTEGER NOT NULL REFERENCES saree_crown_campaign(id) ON DELETE CASCADE,
        product_id   INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        sort_order   SMALLINT DEFAULT 0,
        PRIMARY KEY  (campaign_id, product_id)
      )
    `);

    // Insert the single default row if not present
    await db.query(`
      INSERT INTO saree_crown_campaign (id, enabled) VALUES (1, false)
      ON CONFLICT (id) DO NOTHING
    `);

    console.log('✅ saree_crown_campaign & saree_crown_products tables created/verified.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
