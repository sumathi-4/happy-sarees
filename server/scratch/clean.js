const db = require('../db');

async function clean() {
  const res = await db.pool.query("DELETE FROM orders WHERE payment_status = 'Pending Payment' OR payment_status = 'Payment Failed' OR order_status = 'Pending'");
  console.log('✅ Cleaned up un-paid draft test orders count:', res.rowCount);
}

clean().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
