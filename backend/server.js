const express = require('express');
const path = require('path');
const dotenv = require('dotenv')

const app = express();
const PORT = process.env.PORT;

//--- PUBLICOS ---
app.use(express.estatic(path.join(__dirname, 'frontend/public')));

//--- RUTAS API ---
app.use('/api/auth', require('./src/routes/authRoutes'));

app.listen(PORT, () => {
    console.log('[ Servidor disponible ]')
})

///// cerrar servidor graceful /////////////////////////////////////////////

process.on('SIGTERM', () => {
    console.log('[ SIGTERM recibido, cerrando servidor ]');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('[ SIGINT recibido, cerrando servidor ]');
    process.exit(0);
});

module.exports = app;