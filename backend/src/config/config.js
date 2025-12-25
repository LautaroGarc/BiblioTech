const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname,'..','..','..', 'main.env') });

module.exports = {
    PORT: process.env.PORT || 5000,
    JWT_SECRET: process.env.JWT_SECRET,
    DB_CONFIG: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    },
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS
};