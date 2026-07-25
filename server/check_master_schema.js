require('dotenv').config();
const db = require('./db');

async function checkMasterSchema() {
  const res = await db.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'master_types'"
  );
  console.log('master_types Columns:', res.rows.map(c => c.column_name));

  const rows = await db.query("SELECT * FROM master_types LIMIT 10");
  console.log('Sample master_types rows:', rows.rows);

  process.exit(0);
}

checkMasterSchema().catch(e => { console.error(e); process.exit(1); });
