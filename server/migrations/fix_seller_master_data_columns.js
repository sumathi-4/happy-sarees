const db = require('../db');

async function migrate() {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Starting idempotent patch migration for seller_master_data_requests...');

    const columnsToPatch = [
      { name: 'type_slug', type: 'VARCHAR(100)' },
      { name: 'type_name', type: 'VARCHAR(150)' },
      { name: 'item_name', type: 'VARCHAR(150)' },
      { name: 'reason', type: 'TEXT' },
      { name: 'admin_note', type: 'TEXT' },
      { name: 'reviewed_by', type: 'INTEGER' },
      { name: 'reviewed_at', type: 'TIMESTAMP' },
      { name: 'request_type', type: "VARCHAR(30) DEFAULT 'add_item'" },
      { name: 'target_type_id', type: 'INTEGER' },
      { name: 'target_item_id', type: 'INTEGER' },
      { name: 'payload', type: 'JSONB' },
      { name: 'updated_at', type: 'TIMESTAMP' }
    ];

    for (const col of columnsToPatch) {
      console.log(`Ensuring column ${col.name} exists in seller_master_data_requests...`);
      await client.query(`
        ALTER TABLE seller_master_data_requests 
        ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}
      `);
    }

    // Drop check_request_type constraint if exists and add it to include all 6 request types
    try {
      await client.query(`
        ALTER TABLE seller_master_data_requests DROP CONSTRAINT IF EXISTS check_request_type
      `);
    } catch (e) {}

    await client.query(`
      ALTER TABLE seller_master_data_requests ADD CONSTRAINT check_request_type 
      CHECK (request_type IN ('add_type','edit_type','delete_type','add_item','edit_item','delete_item'))
    `);

    await client.query('COMMIT');
    console.log('✅ Idempotent patch migration completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

migrate().then(() => {
  process.exit(0);
});
