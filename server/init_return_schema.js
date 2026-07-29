const db = require('./db');

async function initReturnSchema() {
  try {
    await db.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS return_status VARCHAR(50) DEFAULT 'No Request',
      ADD COLUMN IF NOT EXISTS return_reason TEXT,
      ADD COLUMN IF NOT EXISTS return_requested_at TIMESTAMPTZ;
    `);
    console.log('✅ orders table schema successfully updated with return_status, return_reason, return_requested_at!');

    // Migrate any existing order_status values if needed
    await db.query(`
      UPDATE orders SET return_status = 'Return Requested' WHERE order_status = 'Return Requested' AND (return_status IS NULL OR return_status = 'No Request');
      UPDATE orders SET return_status = 'Return Approved' WHERE order_status = 'Return Approved' AND (return_status IS NULL OR return_status = 'No Request');
      UPDATE orders SET return_status = 'Return Rejected' WHERE order_status = 'Return Rejected' AND (return_status IS NULL OR return_status = 'No Request');
      UPDATE orders SET return_status = 'Refunded', payment_status = 'Refunded' WHERE order_status = 'Refunded' AND (return_status IS NULL OR return_status = 'No Request');
      UPDATE orders SET order_status = 'Delivered' WHERE order_status IN ('Return Requested', 'Return Approved', 'Return Rejected', 'Refunded');
    `);
    console.log('✅ Existing orders migrated to dedicated return_status column!');
  } catch (err) {
    console.error('❌ Schema update error:', err);
  } finally {
    process.exit(0);
  }
}

initReturnSchema();
