const db = require('./db');

async function initEmailLogsTable() {
  try {
    // Drop foreign key if exists to ensure resilience
    await db.query(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id SERIAL PRIMARY KEY,
        order_id INT,
        customer_email VARCHAR(255) NOT NULL,
        notification_type VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Sent',
        sent_at TIMESTAMPTZ DEFAULT NOW(),
        error_message TEXT
      );
    `);

    // Remove FK constraint if present
    await db.query(`
      ALTER TABLE email_logs DROP CONSTRAINT IF EXISTS email_logs_order_id_fkey;
    `);

    console.log('✅ email_logs table verified with resilient schema in Neon PostgreSQL DB!');
  } catch (err) {
    console.error('❌ Error updating email_logs table:', err);
  } finally {
    process.exit(0);
  }
}

initEmailLogsTable();
