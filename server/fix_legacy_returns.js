const db = require('./db');

async function fixLegacyOrders() {
  try {
    const res = await db.query(`
      UPDATE orders 
      SET order_status = 'Returned',
          return_status = 'Refunded'
      WHERE payment_status = 'Refunded' OR return_status IN ('Return Requested', 'Return Approved', 'Refunded');
    `);
    console.log(`✅ Updated ${res.rowCount} orders to order_status = Returned!`);
  } catch (err) {
    console.error('❌ Error updating legacy orders:', err);
  } finally {
    process.exit(0);
  }
}

fixLegacyOrders();
