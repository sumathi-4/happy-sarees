const db = require('../db');

async function migrate() {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Auditing seller_payout_items table structure...');

    // Check if table has rows
    const countRes = await client.query('SELECT COUNT(*) FROM seller_payout_items');
    const rowCount = Number(countRes.rows[0].count);

    if (rowCount === 0) {
      console.log('seller_payout_items is empty. Recreating table to ensure proper structure...');
      await client.query('DROP TABLE IF EXISTS seller_payout_items CASCADE');
      await client.query(`
        CREATE TABLE seller_payout_items (
          id            SERIAL PRIMARY KEY,
          payout_id     INTEGER REFERENCES seller_payouts(id) ON DELETE CASCADE,
          order_item_id INTEGER REFERENCES order_items(id) ON DELETE SET NULL,
          gross_amount  DECIMAL(10,2) NOT NULL,
          commission    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          net_amount    DECIMAL(10,2) NOT NULL,
          tcs_amount    DECIMAL(10,2) DEFAULT 0.00,
          created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ seller_payout_items table successfully recreated.');
    } else {
      console.log('seller_payout_items contains data. Altering columns idempotently...');
      await client.query(`ALTER TABLE seller_payout_items ADD COLUMN IF NOT EXISTS id SERIAL PRIMARY KEY`);
      await client.query(`ALTER TABLE seller_payout_items ADD COLUMN IF NOT EXISTS gross_amount DECIMAL(10,2) DEFAULT 0.00`);
      await client.query(`ALTER TABLE seller_payout_items ADD COLUMN IF NOT EXISTS commission DECIMAL(10,2) DEFAULT 0.00`);
      await client.query(`ALTER TABLE seller_payout_items ADD COLUMN IF NOT EXISTS net_amount DECIMAL(10,2) DEFAULT 0.00`);
      await client.query(`ALTER TABLE seller_payout_items ADD COLUMN IF NOT EXISTS tcs_amount DECIMAL(10,2) DEFAULT 0.00`);
      console.log('✅ seller_payout_items table altered.');
    }

    await client.query('COMMIT');
    console.log('✅ Idempotent seller_payout_items migration completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Payout items migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

migrate().then(() => {
  process.exit(0);
});
