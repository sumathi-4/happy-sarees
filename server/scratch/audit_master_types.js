require('dotenv').config({ path: 'c:/Users/ELCOT/OneDrive/Desktop/job tasks/happy sarees/server/.env' });
const db = require('c:/Users/ELCOT/OneDrive/Desktop/job tasks/happy sarees/server/db');

async function audit() {
  const cols = await db.query(
    `SELECT column_name, data_type, column_default, is_nullable 
     FROM information_schema.columns 
     WHERE table_name = 'master_types'`
  );
  console.log('--- COLUMNS OF master_types ---');
  console.table(cols.rows);

  const indexes = await db.query(
    `SELECT indexname, indexdef 
     FROM pg_indexes 
     WHERE tablename = 'master_types'`
  );
  console.log('--- INDEXES ON master_types ---');
  console.table(indexes.rows);

  const sample = await db.query("SELECT * FROM master_types LIMIT 10");
  console.log('--- SAMPLE ROWS ---');
  console.log(sample.rows);

  process.exit(0);
}

audit().catch(e => { console.error(e); process.exit(1); });
