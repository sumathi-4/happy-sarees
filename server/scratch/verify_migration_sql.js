const db = require('../db');

async function check() {
  try {
    const res = await db.pool.query('SELECT source, created_by_seller_id, count(*) FROM master_items GROUP BY 1,2');
    console.log('--- master_items counts ---');
    console.log(res.rows);

    const resTypes = await db.pool.query('SELECT source, created_by_seller_id, count(*) FROM master_types GROUP BY 1,2');
    console.log('--- master_types counts ---');
    console.log(resTypes.rows);

  } catch (err) {
    console.error('Error running check:', err);
  } finally {
    process.exit(0);
  }
}

check();
