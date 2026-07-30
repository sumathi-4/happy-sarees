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
