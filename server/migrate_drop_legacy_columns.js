const db = require('./db');

async function migrate() {
  try {
    console.log('🚀 Running database migration to safely drop legacy video_data and image_data columns...');
    
    // 1. Drop video_data column from products table
    await db.query(`ALTER TABLE products DROP COLUMN IF EXISTS video_data;`);
    console.log('✅ Safely dropped video_data column from products table.');

    // 2. Drop image_data column from product_images table
    await db.query(`ALTER TABLE product_images DROP COLUMN IF EXISTS image_data;`);
    console.log('✅ Safely dropped image_data column from product_images table.');

    console.log('🎉 Migration completed successfully! Database now uses ONLY Cloudinary secure URLs (video_url and image_url).');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
