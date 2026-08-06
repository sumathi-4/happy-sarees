const db = require('./db');
db.query('SELECT setting_value FROM store_settings WHERE setting_key = $1', ['store_tax'])
  .then(r => {
    const val = r.rows[0]?.setting_value;
    console.log('Raw value type:', typeof val);
    console.log('Raw value:', JSON.stringify(val, null, 2));
    process.exit(0);
  })
  .catch(e => {
    console.error(e.message);
    process.exit(1);
  });
