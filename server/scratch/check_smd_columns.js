const db = require('../db');

async function check() {
  try {
    const res = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'seller_master_data_requests'
    `);
    console.log('Columns in seller_master_data_requests:');
    res.rows.forEach(r => {
      console.log(`- ${r.column_name}: ${r.data_type}`);
    });
  } catch (err) {
    console.error('Error checking columns:', err.message);
  } finally {
    process.exit(0);
  }
}

check();
