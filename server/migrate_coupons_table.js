const db = require('./db');

async function migrateCouponsTable() {
  try {
    console.log('🔄 Ensuring coupons and coupon_usage columns match in Neon PostgreSQL DB...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255),
        description TEXT,
        type VARCHAR(50) DEFAULT 'percentage',
        value NUMERIC(10,2) NOT NULL DEFAULT 0,
        min_order_amount NUMERIC(10,2) DEFAULT 0,
        max_discount_amount NUMERIC(10,2) DEFAULT NULL,
        usage_limit INT DEFAULT 100,
        usage_count INT DEFAULT 0,
        per_user_limit INT DEFAULT 1,
        starts_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE coupons ADD COLUMN IF NOT EXISTS min_order_amount NUMERIC(10,2) DEFAULT 0;
      ALTER TABLE coupons ADD COLUMN IF NOT EXISTS max_discount_amount NUMERIC(10,2) DEFAULT NULL;
      ALTER TABLE coupons ADD COLUMN IF NOT EXISTS min_order NUMERIC(10,2) DEFAULT 0;
      ALTER TABLE coupons ADD COLUMN IF NOT EXISTS max_discount NUMERIC(10,2) DEFAULT NULL;

      CREATE TABLE IF NOT EXISTS coupon_usage (
        id SERIAL PRIMARY KEY,
        coupon_id INT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        order_id INT REFERENCES orders(id) ON DELETE SET NULL,
        used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure sample active coupons exist in Neon DB
    const countRes = await db.query(`SELECT COUNT(*) FROM coupons`);
    if (parseInt(countRes.rows[0].count) === 0) {
      await db.query(`
        INSERT INTO coupons (code, name, type, value, min_order_amount, min_order, usage_limit, usage_count, is_active)
        VALUES 
          ('FESTIVAL20', 'Festival 20% Discount', 'percentage', 20, 1000, 1000, 200, 0, true),
          ('FLAT500', 'Flat ₹500 Savings', 'flat', 500, 2999, 2999, 100, 0, true),
          ('WELCOME10', 'Welcome 10% Off', 'percentage', 10, 500, 500, 500, 0, true),
          ('FREESHIP', 'Free Shipping Offer', 'flat', 100, 999, 999, 1000, 0, true);
      `);
      console.log('✅ Initial active coupons seeded into Neon DB!');
    }

    console.log('✅ Coupons and coupon_usage tables fully synchronized in Neon DB!');
  } catch (error) {
    console.error('❌ Migration Error for coupons table:', error.message);
  }
}

if (require.main === module) {
  migrateCouponsTable().then(() => process.exit(0));
}

module.exports = migrateCouponsTable;
