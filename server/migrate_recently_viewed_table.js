const db = require('./db');

async function migrateRecentlyViewedTable() {
  try {
    console.log('🔄 Checking / Creating recently_viewed table in Neon PostgreSQL DB...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS recently_viewed (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_product_view UNIQUE (user_id, product_id)
      );

      CREATE INDEX IF NOT EXISTS idx_recently_viewed_user ON recently_viewed(user_id);
      CREATE INDEX IF NOT EXISTS idx_recently_viewed_time ON recently_viewed(viewed_at DESC);
    `);
    console.log('✅ recently_viewed table migrated successfully in Neon DB!');
  } catch (error) {
    console.error('❌ Migration Error for recently_viewed table:', error.message);
  }
}

if (require.main === module) {
  migrateRecentlyViewedTable().then(() => process.exit(0));
}

module.exports = migrateRecentlyViewedTable;
