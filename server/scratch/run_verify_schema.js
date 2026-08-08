const db = require('../db');
async function verifyDatabaseSchema() {
  try {
    const requiredColumns = [
      { table: 'seller_master_data_requests', column: 'type_slug' },
      { table: 'seller_master_data_requests', column: 'type_name' },
      { table: 'seller_master_data_requests', column: 'item_name' },
      { table: 'seller_master_data_requests', column: 'payload' },
      { table: 'seller_master_data_requests', column: 'updated_at' },
      { table: 'seller_payout_items', column: 'net_amount' },
      { table: 'seller_payouts', column: 'tcs_amount' },
      { table: 'order_items', column: 'delivered_at' }
    ];

    const res = await db.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_name IN ('seller_master_data_requests', 'seller_payouts', 'seller_payout_items', 'order_items')
    `);

    const existing = res.rows.map(r => `${r.table_name}.${r.column_name}`);
    const missing = requiredColumns.filter(c => !existing.includes(`${c.table}.${c.column}`));

    if (missing.length > 0) {
      console.warn('\n⚠️ [Database Schema Warning] Missing expected columns:');
      missing.forEach(m => console.warn(`  - ${m.table}.${m.column} is missing!`));
      console.warn('  Please run outstanding migrations to fix this drift.\n');
    } else {
      console.log('✅ [Database Schema Check] All critical columns verified successfully.');
    }
  } catch (err) {
    console.error('❌ [Database Schema Check] Verification failed:', err.message);
  } finally {
    process.exit(0);
  }
}
verifyDatabaseSchema();
