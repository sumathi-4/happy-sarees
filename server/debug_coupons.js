const db = require('./db');

async function checkCouponsColumns() {
  try {
    const res = await db.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'coupons'`
    );
    console.log('Coupons Table Columns in Neon DB:');
    res.rows.forEach(r => console.log(` - ${r.column_name} (${r.data_type})`));
  } catch (err) {
    console.error('Check failed:', err.message);
  }
}

checkCouponsColumns();
