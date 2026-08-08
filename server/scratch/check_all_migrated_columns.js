const db = require('../db');

async function checkTable(tableName) {
  try {
    const res = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1
    `, [tableName]);
    console.log(`\nColumns in ${tableName}:`);
    res.rows.forEach(r => {
      console.log(`- ${r.column_name}: ${r.data_type}`);
    });
  } catch (err) {
    console.error(`Error checking ${tableName}:`, err.message);
  }
}

async function run() {
  await checkTable('seller_master_data_requests');
  await checkTable('seller_payouts');
  await checkTable('seller_payout_items');
  await checkTable('order_items');
  process.exit(0);
}

run();
