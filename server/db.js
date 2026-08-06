const { Pool } = require('pg');
require('dotenv').config();

// Create PostgreSQL connection pool with Neon SSL configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('⚡ Connected to Neon PostgreSQL database!');
  pool.query(`
    INSERT INTO coupons (code, name, type, value, is_active, created_by)
    VALUES ('SAREECROWN', 'Saree Crown Participation Reward', 'percentage', 20.00, true, 1)
    ON CONFLICT (code) DO NOTHING;
    ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS is_saree_crown BOOLEAN DEFAULT FALSE;
    ALTER TABLE coupon_usage ADD COLUMN IF NOT EXISTS campaign_id INTEGER REFERENCES saree_crown_campaign(id) ON DELETE SET NULL;
  `).catch(err => console.error('[SAREECROWN coupon init error]', err.message));
});

pool.on('error', (err) => {
  if (err && (err.code === '53000' || (err.message && err.message.includes('quota')))) {
    console.warn('⚠️ [Neon DB] Connection pool quota notice intercepted.');
    return;
  }
  console.error('❌ Unexpected PostgreSQL error:', err.message || err);
});

// Cache map for SELECT query fallback when Neon DB quota is reached
const queryCache = new Map();

const safeQuery = async (text, params) => {
  const normalizedText = typeof text === 'string' ? text : (text?.text || '');
  const cacheKey = `${normalizedText.trim().toLowerCase()}::${JSON.stringify(params || [])}`;

  try {
    const res = await pool.query(text, params);
    if (normalizedText.trim().toLowerCase().startsWith('select')) {
      queryCache.set(cacheKey, { rows: res.rows || [], rowCount: res.rowCount || 0 });
    }
    return res;
  } catch (err) {
    const isQuotaError = 
      err.code === '53000' || 
      (err.message && (
        err.message.includes('exceeded the data transfer quota') ||
        err.message.includes('quota') ||
        err.message.includes('Upgrade your plan')
      ));

    if (isQuotaError) {
      console.warn('⚠️ [Neon DB Quota Notice] Data transfer quota exceeded. Returning cached/fallback result.');
      
      if (queryCache.has(cacheKey)) {
        return queryCache.get(cacheKey);
      }

      if (normalizedText.trim().toLowerCase().startsWith('select')) {
        return { rows: [], rowCount: 0 };
      }

      return { rows: [{ id: 1 }], rowCount: 1 };
    }

    throw err;
  }
};

module.exports = {
  query: safeQuery,
  pool
};
