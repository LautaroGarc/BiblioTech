const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: "BiblioTech",
  port: 3306,
});

connection.connect((err) => {
  if (err) {
    console.error('Error conectando a MySQL:', err.message);
    return;
  }
  console.log('Conectado a MySQL - Base de datos: BiblioTech');
});

connection.on('error', (err) => {
  console.error('Error de MySQL:', err.message);
});

module.exports = connection.promise();