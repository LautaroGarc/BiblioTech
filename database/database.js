const mysql = require('mysql2');
const path = require('path');
const { DB_CONFIG } = require(path.join(__dirname, '..', 'backend', 'src', 'config', 'config.js'));

const pool = mysql.createPool({
  host: DB_CONFIG.host,
  user: DB_CONFIG.user,
  password: DB_CONFIG.password,
  database: DB_CONFIG.database,
  port: DB_CONFIG.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

promisePool.on('error', (err) => {
  console.error('Error de MySQL Pool:', err.message);
});

module.exports = promisePool;