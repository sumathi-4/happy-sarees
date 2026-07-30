const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function exportFullBackup() {
  console.log('📦 Starting Full Database Backup Extraction...');

  const backupData = {};
  const tables = [
    'users',
    'categories',
    'products',
    'product_images',
    'product_seo',
    'master_types',
    'master_items',
    'coupons',
    'reviews',
    'orders',
    'order_items',
    'shipping_methods',
    'store_settings'
  ];

  let sqlStatements = `-- HAPPY SAREES DATABASE BACKUP DUMP\n-- Exported At: ${new Date().toISOString()}\n\n`;

  for (const table of tables) {
    try {
      const res = await pool.query(`SELECT * FROM ${table}`);
      backupData[table] = res.rows;
      console.log(`✅ Extracted table '${table}': ${res.rows.length} rows`);

      if (res.rows.length > 0) {
        sqlStatements += `-- Table: ${table}\n`;
        for (const row of res.rows) {
          const keys = Object.keys(row);
          const values = Object.values(row).map(val => {
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'number' || typeof val === 'boolean') return val;
            if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
            return `'${String(val).replace(/'/g, "''")}'`;
          });
          sqlStatements += `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        sqlStatements += '\n';
      }
    } catch (err) {
      console.warn(`⚠️ Notice for table '${table}': ${err.message}`);
    }
  }

  const jsonPath = path.join(__dirname, 'happy_sarees_database_backup.json');
  const sqlPath = path.join(__dirname, 'happy_sarees_database_backup.sql');

  fs.writeFileSync(jsonPath, JSON.stringify(backupData, null, 2));
  fs.writeFileSync(sqlPath, sqlStatements);

  console.log(`\n🎉 SUCCESS! Complete database backup saved locally:`);
  console.log(`📁 JSON Backup: ${jsonPath}`);
  console.log(`📁 SQL Backup: ${sqlPath}`);
  
  await pool.end();
}

exportFullBackup().catch(e => {
  console.error('❌ Backup Export Error:', e.message);
  process.exit(1);
});
