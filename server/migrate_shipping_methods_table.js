const db = require('./db');

async function migrateShippingMethodsTable() {
  try {
    console.log('🔄 Checking / Creating shipping_methods table in Neon PostgreSQL DB...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS shipping_methods (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        shipping_charge NUMERIC(10,2) NOT NULL DEFAULT 0,
        estimated_delivery_days VARCHAR(100) DEFAULT '3-5 Business Days',
        free_shipping_eligible BOOLEAN DEFAULT true,
        is_enabled BOOLEAN DEFAULT true,
        display_order INT DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_shipping_methods_order ON shipping_methods(display_order ASC);
    `);

    // Seed default shipping methods if table is empty
    const countRes = await db.query(`SELECT COUNT(*) FROM shipping_methods`);
    if (parseInt(countRes.rows[0].count) === 0) {
      console.log('🌱 Seeding initial dynamic shipping methods into Neon DB...');
      await db.query(`
        INSERT INTO shipping_methods (name, description, shipping_charge, estimated_delivery_days, free_shipping_eligible, is_enabled, display_order)
        VALUES 
          ('Standard Delivery', 'Delivery in 4–6 business days', 99, '4–6 Business Days', true, true, 1),
          ('Express Premium Delivery', 'Guaranteed delivery in 1–2 business days', 199, '1–2 Business Days', false, true, 2),
          ('Boutique Pickup', 'Collect from your nearest Happy Sarees showroom', 0, 'Ready for Pickup', true, true, 3);
      `);
      console.log('✅ Default dynamic shipping methods seeded into Neon DB!');
    }

    console.log('✅ shipping_methods table fully synchronized in Neon DB!');
  } catch (error) {
    console.error('❌ Migration Error for shipping_methods table:', error.message);
  }
}

if (require.main === module) {
  migrateShippingMethodsTable().then(() => process.exit(0));
}

module.exports = migrateShippingMethodsTable;
