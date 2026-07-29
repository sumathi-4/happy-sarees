const db = require('./db');

async function updateReviewsSchema() {
  try {
    console.log('🔄 Updating Neon PostgreSQL `reviews` table schema...');

    await db.query(`
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS display_on_homepage BOOLEAN DEFAULT false;
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS featured_image TEXT;
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
    `);

    // Normalize status for any existing rows
    await db.query(`
      UPDATE reviews 
      SET status = CASE 
        WHEN status IS NULL AND (is_approved = true OR is_approved IS NULL) THEN 'approved'
        WHEN status IS NULL THEN 'pending'
        ELSE status
      END;
    `);

    // Ensure display_on_homepage is true for initial featured reviews
    await db.query(`
      UPDATE reviews 
      SET display_on_homepage = true 
      WHERE status = 'approved' AND (image_data IS NOT NULL OR images::text != '[]');
    `);

    console.log('✅ Reviews table schema updated successfully!');
  } catch (err) {
    console.error('❌ Error updating reviews schema:', err);
  } finally {
    process.exit(0);
  }
}

updateReviewsSchema();
