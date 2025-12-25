const app = require('./backend/server.js');
const path = require('path');

require('dotenv').config({ 
    path: path.join(__dirname, 'backend', 'src', 'config', 'env', 'main.env') 
});

const PORT = process.env.PORT || 5000;

console.log('╔════════════════════════════════════════╗');
console.log('║           BIBLIOTECH SERVER            ║');
console.log('╚════════════════════════════════════════╝');
console.log('');
console.log(`Servidor corriendo en: http://localhost:${PORT}`);
console.log(`Iniciado: ${new Date().toLocaleString('es-AR')}`);
console.log('═══════════════════════════════════════════');