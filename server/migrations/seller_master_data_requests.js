/**
 * Migration: Seller Master Data Requests + Payout Engine Extension
 * Run once via: node server/migrations/seller_master_data_requests.js
 */
const db = require('../db');

async function migrate() {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // ── Seller Master Data Requests ─────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS seller_master_data_requests (
        id           SERIAL PRIMARY KEY,
        seller_id    INTEGER NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
        type_slug    VARCHAR(100) NOT NULL,
        type_name    VARCHAR(150) NOT NULL,
        item_name    VARCHAR(150) NOT NULL,
        reason       TEXT,
        status       VARCHAR(20) NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','approved','rejected')),
        admin_note   TEXT,
        reviewed_by  INTEGER,
        reviewed_at  TIMESTAMP,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ── Extend seller_payouts ───────────────────────────────────
    await client.query(`ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS notes TEXT`);
    await client.query(`ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS reference_id VARCHAR(100)`);
    await client.query(`ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS adjustment_type VARCHAR(30) DEFAULT 'payout'
      CHECK (adjustment_type IN ('payout','return_deduction','adjustment'))`);

    // ── Seller Payout Items (line items per payout) ─────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS seller_payout_items (
        id           SERIAL PRIMARY KEY,
        payout_id    INTEGER REFERENCES seller_payouts(id) ON DELETE CASCADE,
        order_item_id INTEGER REFERENCES order_items(id) ON DELETE SET NULL,
        gross_amount DECIMAL(10,2) NOT NULL,
        commission   DECIMAL(10,2) NOT NULL DEFAULT 0,
        net_amount   DECIMAL(10,2) NOT NULL,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query('COMMIT');
    console.log('[Migration] seller_master_data_requests + payout engine tables created successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Migration] Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();
