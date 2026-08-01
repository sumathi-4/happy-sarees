require('dotenv').config({ path: 'c:/Users/ELCOT/OneDrive/Desktop/job tasks/happy sarees/server/.env' });
const db = require('c:/Users/ELCOT/OneDrive/Desktop/job tasks/happy sarees/server/db');

async function audit() {
  // Columns
  const cols = await db.query(
    `SELECT column_name, data_type, column_default, is_nullable 
     FROM information_schema.columns 
     WHERE table_name = 'master_items'`
  );
  console.log('--- COLUMNS OF master_items ---');
  console.table(cols.rows);

  // Foreign keys
  const fkeys = await db.query(
    `SELECT
       tc.table_name, kcu.column_name, 
       ccu.table_name AS foreign_table_name,
       ccu.column_name AS foreign_column_name 
     FROM 
       information_schema.table_constraints AS tc 
       JOIN information_schema.key_column_usage AS kcu
         ON tc.constraint_name = kcu.constraint_name
       JOIN information_schema.constraint_column_usage AS ccu
         ON ccu.constraint_name = tc.constraint_name
     WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='master_items'`
  );
  console.log('--- FOREIGN KEYS ON master_items ---');
  console.table(fkeys.rows);

  // Orphan check
  const orphans = await db.query(
    `SELECT COUNT(*) FROM master_items mi 
     LEFT JOIN master_types mt ON mi.type_id = mt.id 
     WHERE mt.id IS NULL`
  );
  console.log(`--- ORPHAN COUNT: ${orphans.rows[0].count} ---`);

  // Sample rows
  const sample = await db.query("SELECT * FROM master_items LIMIT 5");
  console.log('--- SAMPLE ROWS ---');
  console.log(sample.rows);

  process.exit(0);
}

audit().catch(e => { console.error(e); process.exit(1); });
