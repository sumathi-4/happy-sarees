const db = require('./db');

async function run() {
  try {
    await db.query(`
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS image_data TEXT;
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved';
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;
    `);
    console.log('Successfully altered reviews table columns!');

    // Check existing reviews
    const res = await db.query('SELECT * FROM reviews');
    console.log(`Current reviews in DB: ${res.rows.length}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
