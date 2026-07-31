const db = require('../db');

async function initNotif() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'system',
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ notifications table created/verified in PostgreSQL!');
}

initNotif().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
