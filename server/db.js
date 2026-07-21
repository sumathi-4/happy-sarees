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
  console.error('❌ Unexpected PostgreSQL error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
