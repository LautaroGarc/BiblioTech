const mysql = require('mysql2');
const path = require('path');
const { DB_CONFIG } = require(path.join(__dirname, '..', 'backend', 'src', 'config', 'config.js'));

const connection = mysql.createConnection({
  host: DB_CONFIG.host,
  user: DB_CONFIG.user,
  password: DB_CONFIG.password,
  database: DB_CONFIG.database,
  port: DB_CONFIG.port,
});

connection.connect((err) => {
  if (err) {
    console.error('Error conectando a MySQL:', err.message);
    return;
  }
  console.log('Conectado a MySQL - Base de datos: ' + DB_CONFIG.database);
});

connection.on('error', (err) => {
  console.error('Error de MySQL:', err.message);
});

module.exports = connection.promise();