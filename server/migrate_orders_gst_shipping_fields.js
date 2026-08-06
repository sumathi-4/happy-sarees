const db = require('./db');

async function migrateOrdersGstShippingFields() {
  try {
    console.log('🔄 Checking / Creating dynamic order breakdown columns in orders table...');
    
    await db.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS discount NUMERIC(10, 2) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS gst_rate NUMERIC(5, 2) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS gst_amount NUMERIC(10, 2) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS tax_inclusivity_mode VARCHAR(50) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS shipping_amount NUMERIC(10, 2) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS shipping_discount NUMERIC(10, 2) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS free_shipping_status VARCHAR(50) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS final_total NUMERIC(10, 2) DEFAULT NULL;
    `);

    console.log('✅ orders table breakdown columns migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message || err);
    process.exit(1);
  }
}

if (require.main === module) {
  migrateOrdersGstShippingFields().then(() => process.exit(0));
}

module.exports = migrateOrdersGstShippingFields;
