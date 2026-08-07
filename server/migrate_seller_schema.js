// migrate_seller_schema.js
// Run once: node migrate_seller_schema.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./db');

async function migrate() {
  try {
    console.log('🚀 Applying Seller database schema migrations...');
    const schemaPath = path.join(__dirname, 'seller_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await db.query(schema);
    console.log('✅ Seller tables created and tables altered successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seller database schema migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
