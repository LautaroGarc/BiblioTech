const dotenv = require('dotenv');
const path = require('path');

//- Cargar variables de entorno (PORT, JWT_SECRET, DB credentials)

dotenv.config({ path: path.join(__dirname, 'env/main.env') });

module.exports = {
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET,
    DB_CONFIG: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    }
};