const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { authenticateToken } = require(path.join(__dirname, 'backend', 'src','middlewares','authMiddleware.js'));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//--- DIRECCIONES ---
app.get('/', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    if (!req.session.user.accepted) {
        return res.redirect('/waiting');
    }
    res.redirect('/home');
});

app.get('/login', (req, res) => {
    if (req.session.user) {
        return req.session.user.accepted ? res.redirect('/home') : res.redirect('/waiting');
    }
    res.sendFile(path.join(__dirname, 'frontend', 'public', 'login.html'));
});

app.get('/waiting', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    if (req.session.user.accepted) {
        return res.redirect('/home');
    }
    res.sendFile(path.join(__dirname, 'frontend', 'public', 'waiting.html'));
});

app.get('/home', authenticateToken, (req, res) => {
    if (!req.session.user.accepted) {
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
    if (!req.session.user.accepted) {
        return res.redirect('/waiting');
    }

    res.sendFile(path.join(__dirname, 'frontend', 'public', 'private', 'profile.html'))
});

//--- RUTAS API ---
app.use('/api/auth', require(path.join(__dirname, 'backend', 'src','routes','authRoutes.js')));



//--- ERROR 404 ---
app.use('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'frontend', 'public', '404.html'));
});

// Servidor desplegado

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