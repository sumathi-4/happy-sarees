const db = require('./db');

async function migrateOrdersPaymentColumns() {
  try {
    console.log('🔄 Checking / Creating payment columns in orders table (Neon DB)...');
    
    await db.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'Pending',
      ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
      ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
      ADD COLUMN IF NOT EXISTS razorpay_signature TEXT,
      ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(10, 2),
      ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;
    `);

    console.log('✅ orders table payment columns migration complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrateOrdersPaymentColumns().then(() => process.exit(0));
