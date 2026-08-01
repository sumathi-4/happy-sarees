// migrate_admin_avatar.js
// Run: node migrate_admin_avatar.js
// Adds avatar_url column to admin_users table

require('dotenv').config();
const db = require('./db');

async function migrate() {
  console.log('Running admin avatar migration...');
  try {
    await db.query(`
      ALTER TABLE admin_users
      ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;
    `);
    console.log('✅ avatar_url column added to admin_users table successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}

migrate();
