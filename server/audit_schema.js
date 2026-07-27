require('dotenv').config();
const db = require('./db');

async function auditSchema() {
  console.log('=== AUDITING NEON POSTGRESQL TABLES & COLUMNS ===');

  const tables = ['products', 'master_types', 'master_items', 'product_specifications'];

  for (const t of tables) {
    const res = await db.query(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns 
       WHERE table_name = $1
       ORDER BY ordinal_position ASC`,
      [t]
    );
    console.log(`\n--- TABLE: ${t} (${res.rows.length} columns) ---`);
    console.table(res.rows);
  }

  process.exit(0);
}

auditSchema().catch(e => { console.error(e); process.exit(1); });
