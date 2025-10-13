const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const cfg = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'Rajesh',
    password: process.env.DB_PASS ?? process.env.DB_PASSWORD ?? 'Rajesh@254',
    database: process.env.DB_NAME || 'testdb',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    connectTimeout: 5000,
  };

  console.log('Attempting DB connection with:', {
    host: cfg.host,
    user: cfg.user,
    database: cfg.database,
    port: cfg.port,
    password: cfg.password ? '******' : '(empty)'
  });

  try {
    const conn = await mysql.createConnection(cfg);
    const [rows] = await conn.query('SELECT VERSION() as v');
    console.log('Connected. MySQL version:', rows[0].v);
    await conn.end();
  } catch (err) {
    console.error('Connection failed -> code:', err.code, 'sqlMessage:', err.sqlMessage || err.message);
    process.exit(1);
  }
})();