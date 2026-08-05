// ============================================================
//  migrate_saree_crown_votes.js
//  Creates saree_crown_votes table for customer voting
//  Run: node server/migrate_saree_crown_votes.js
// ============================================================
require('dotenv').config();
const db = require('./db');

async function migrate() {
  console.log('Creating saree_crown_votes table...');

  await db.query(`
    CREATE TABLE IF NOT EXISTS saree_crown_votes (
      id           SERIAL PRIMARY KEY,
      campaign_id  INTEGER NOT NULL REFERENCES saree_crown_campaign(id) ON DELETE CASCADE,
      user_id      INTEGER NOT NULL,
      product_id   INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      voted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      -- One vote per user per campaign
      CONSTRAINT unique_vote_per_campaign UNIQUE (campaign_id, user_id)
    )
  `);

  await db.query(`CREATE INDEX IF NOT EXISTS idx_scv_campaign  ON saree_crown_votes(campaign_id)`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_scv_user      ON saree_crown_votes(user_id)`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_scv_product   ON saree_crown_votes(product_id)`);

  console.log('✅ saree_crown_votes table ready.');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
