// db.js
const { Pool } = require('pg');
require('dotenv').config();

// The Pool will use the DATABASE_URL environment variable automatically
// This is the standard way to connect to databases on platforms like Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for connecting to Render's PostgreSQL
  }
});

// A simple function to check the connection
pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Main query function
// This function has the same signature as your original, so index.js doesn't need to change
async function query(sql, params) {
  // The 'pg' library uses placeholders like $1, $2, etc.
  // We need to convert your MySQL '?' placeholders to '$1', '$2', etc.
  // This simple regex replacement works for most cases.
  let pgSql = sql.replace(/\?/g, (match, offset) => `$${parseInt(offset) + 1}`);
  
  try {
    const result = await pool.query(pgSql, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Get database connection (kept for compatibility, though Pool is preferred)
async function getConnection() {
  return pool;
}

module.exports = {
  query,
  getConnection,
};