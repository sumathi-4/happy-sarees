const db = require('../db');

async function migrate() {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Add delivered_at to order_items
    await client.query(`
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP
    `);

    // 2. Add tcs_amount to payouts and payout items
    await client.query(`
      ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS tcs_amount DECIMAL(10,2) DEFAULT 0.00
    `);
    await client.query(`
      ALTER TABLE seller_payout_items ADD COLUMN IF NOT EXISTS tcs_amount DECIMAL(10,2) DEFAULT 0.00
    `);

    // 3. Add request columns to seller_master_data_requests
    await client.query(`
      ALTER TABLE seller_master_data_requests ADD COLUMN IF NOT EXISTS request_type VARCHAR(30) DEFAULT 'add_item'
    `);
    await client.query(`
      ALTER TABLE seller_master_data_requests ADD COLUMN IF NOT EXISTS target_type_id INTEGER
    `);
    await client.query(`
      ALTER TABLE seller_master_data_requests ADD COLUMN IF NOT EXISTS target_item_id INTEGER
    `);
    await client.query(`
      ALTER TABLE seller_master_data_requests ADD COLUMN IF NOT EXISTS payload JSONB
    `);

    // Drop and recreate constraint on status / request_type to support all 6 request types
    try {
      await client.query(`
        ALTER TABLE seller_master_data_requests DROP CONSTRAINT IF EXISTS check_request_type
      `);
    } catch (e) {}

    await client.query(`
      ALTER TABLE seller_master_data_requests ADD CONSTRAINT check_request_type 
      CHECK (request_type IN ('add_type','edit_type','delete_type','add_item','edit_item','delete_item'))
    `);

    // Populate default settings in store_general if not present
    const settingsRes = await client.query(
      `SELECT id, setting_value FROM store_settings WHERE setting_key = 'store_general'`
    );
    if (settingsRes.rows.length > 0) {
      const row = settingsRes.rows[0];
      let val = typeof row.setting_value === 'string' ? JSON.parse(row.setting_value) : row.setting_value;
      let updated = false;
      if (val.payoutHoldDays === undefined) {
        val.payoutHoldDays = 7;
        updated = true;
      }
      if (val.tcsRate === undefined) {
        val.tcsRate = 1.00;
        updated = true;
      }
      if (updated) {
        await client.query(
          `UPDATE store_settings SET setting_value = $1, updated_at = NOW() WHERE id = $2`,
          [JSON.stringify(val), row.id]
        );
        console.log('✅ store_general updated with default payoutHoldDays and tcsRate.');
      }
    }

    await client.query('COMMIT');
    console.log('[Migration Round 2] Database successfully updated.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Migration Round 2] Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();
