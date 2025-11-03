const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { authenticateToken } = require(path.join(__dirname, 'src','middlewares','authMiddleware.js'));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..','frontend', 'src', 'public')));

//--- DIRECCIONES ---
app.get('/', (req, res) => {
    // Redirigir siempre a login, el frontend maneja la nav
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'public', 'register.html'));
});

app.get('/waiting', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'public', 'waiting.html'));
});

// Ruta protegida - requiere token válido
app.get('/home', authenticateToken, (req, res) => {
    // req.user viene del token decodificado (tiene id, email, type, accepted)
    
    if (!req.user.accepted) {
        return res.redirect('/waiting');
    }

    const userType = req.user.type;
    
    switch(userType) {
        case 'admin':
            return res.sendFile(path.join(__dirname, 'frontend', 'public', 'private', 'admin', 'home.html'));
        
        case 'user':
            return res.sendFile(path.join(__dirname, 'frontend', 'public', 'private', 'user', 'home.html'));
        
        default:
            return res.status(403).json({ 
                message: 'Acceso denegado' 
            });
    }
});

app.get('/profile', authenticateToken, (req, res) => {
    if (!req.user.accepted) {
        return res.redirect('/waiting');
    }

    res.sendFile(path.join(__dirname, 'frontend', 'public', 'private', 'profile.html'))
});

//--- RUTAS API ---
app.use('/api/auth', require(path.join(__dirname, 'backend', 'src','routes','authRoutes.js')));
app.use('/api/users', require(path.join(__dirname, 'backend', 'src','routes','userRoutes.js')));

//--- ERROR 404 ---
app.use('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'frontend', 'public', '404.html'));
});

// Servidor desplegado
app.listen(PORT, () => {
    console.log('[ Servidor disponible en puerto', PORT, ']')
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

//Lauti putito