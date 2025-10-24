const express = require('express');
const path = require('path');
const app = express();



const PORT = '';

app.listen(PORT, () => {
    console.log('Servidor disponible...')
})

///// cerrar servidor graceful /////////////////////////////////////////////

process.on('SIGTERM', () => {
    console.log('SIGTERM recibido, cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT recibido, cerrando servidor...');
    process.exit(0);
});

module.exports = app;