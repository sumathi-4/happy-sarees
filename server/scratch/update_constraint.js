const db = require('../db');

async function run() {
  try {
    // Drop existing check constraint if any
    await db.query(`
      ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_fulfillment_status_check
    `);
    // Add updated check constraint
    await db.query(`
      ALTER TABLE order_items ADD CONSTRAINT order_items_fulfillment_status_check
      CHECK (fulfillment_status IN ('Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'))
    `);
    console.log('✅ Check constraint on order_items.fulfillment_status updated.');
  } catch (e) {
    console.error('Error updating constraint:', e.message);
  } finally {
    process.exit(0);
  }
}
run();
