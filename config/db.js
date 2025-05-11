const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ DB test query failed:', err);
  } else {
    console.log('🕒 Database time is:', res.rows[0].now);
  }
});

module.exports = pool;
