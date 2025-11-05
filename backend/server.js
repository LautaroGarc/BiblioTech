const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { authenticateToken, checkSession } = require('./src/middlewares/authMiddleware.js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '..', 'frontend', 'src', 'public')));
app.use('/css', express.static(path.join(__dirname, '..', 'frontend', 'src', 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, '..', 'frontend', 'src', 'public', 'js')));
app.use('/assets', express.static(path.join(__dirname, '..', 'frontend', 'src', 'assets')));

//--- RUTAS PÚBLICAS (con redirección inteligente) ---

// Raíz - redirige según estado de sesión
app.get('/', checkSession, (req, res) => {
    // Si checkSession detectó sesión válida, ya redirigió
    // Si llegamos acá, no hay sesión
    res.redirect('/login');
});

// Login - solo accesible SIN sesión activa
app.get('/login', checkSession, (req, res) => {
    // Si hay sesión, checkSession ya redirigió a /waiting o /home
    // Si llegamos acá, no hay sesión válida
    res.sendFile(path.join(__dirname, '..', 'frontend', 'src', 'public', 'login.html'));
});

// Register - solo accesible SIN sesión activa
app.get('/register', checkSession, (req, res) => {
    // Si hay sesión, checkSession ya redirigió
    res.sendFile(path.join(__dirname, '..', 'frontend', 'src', 'public', 'register.html'));
});

// Waiting - solo accesible CON sesión pero SIN aceptación
app.get('/waiting', authenticateToken, (req, res) => {
    // authenticateToken verifica que haya token válido
    
    if (req.user.accepted) {
        // Si ya está aceptado, no debería estar en waiting
        return res.redirect('/home');
    }
    
    // Usuario tiene sesión pero no está aceptado
    res.sendFile(path.join(__dirname, '..', 'frontend', 'src', 'public', 'waiting.html'));
});

//--- RUTAS PROTEGIDAS (requieren sesión + aceptación) ---

// Home - requiere sesión válida Y aceptación
app.get('/home', authenticateToken, (req, res) => {
    if (!req.user.accepted) {
        return res.redirect('/waiting');
    }

    const userType = req.user.type;
    
    switch(userType) {
        case 'admin':
            return res.sendFile(path.join(__dirname, '..', 'frontend', 'src', 'private', 'admin', 'home.html'));
        
        case 'user':
            return res.sendFile(path.join(__dirname, '..', 'frontend', 'src', 'private', 'user', 'home.html'));
        
        default:
            return res.status(403).json({ 
                message: 'Acceso denegado' 
            });
    }
});

// Profile - requiere sesión válida Y aceptación
app.get('/profile', authenticateToken, (req, res) => {
    if (!req.user.accepted) {
        return res.redirect('/waiting');
    }

    const userType = req.user.type;
    
    if (userType === 'admin') {
        return res.sendFile(path.join(__dirname, '..', 'frontend', 'src', 'private', 'admin', 'profile.html'));
    } else {
        return res.sendFile(path.join(__dirname, '..', 'frontend', 'src', 'private', 'user', 'profile.html'));
    }
});

// Books - requiere sesión válida Y aceptación
app.get('/books', authenticateToken, (req, res) => {
    if (!req.user.accepted) {
        return res.redirect('/waiting');
    }

    const userType = req.user.type;
    
    if (userType === 'admin') {
        return res.sendFile(path.join(__dirname, '..', 'frontend', 'src', 'private', 'admin', 'books.html'));
    } else {
        return res.sendFile(path.join(__dirname, '..', 'frontend', 'src', 'private', 'user', 'books.html'));
    }
});

// Forum - requiere sesión válida Y aceptación
app.get('/forum', authenticateToken, (req, res) => {
    if (!req.user.accepted) {
        return res.redirect('/waiting');
    }

    res.sendFile(path.join(__dirname, '..', 'frontend', 'src', 'private', 'forum.html'));
});

// Search - requiere sesión válida Y aceptación
app.get('/search', authenticateToken, (req, res) => {
    if (!req.user.accepted) {
        return res.redirect('/waiting');
    }

    res.sendFile(path.join(__dirname, '..', 'frontend', 'src', 'private', 'search.html'));
});

// Plus (admin/user) - requiere sesión válida Y aceptación
app.get('/plus', authenticateToken, (req, res) => {
    if (!req.user.accepted) {
        return res.redirect('/waiting');
    }

    const userType = req.user.type;
    
    if (userType === 'admin') {
        return res.sendFile(path.join(__dirname, '..', 'frontend', 'src', 'private', 'admin', 'plus.html'));
    } else {
        return res.sendFile(path.join(__dirname, '..', 'frontend', 'src', 'private', 'user', 'plus.html'));
    }
});

//--- RUTAS API ---
app.use('/api/auth', require('./src/routes/authRoutes.js'));
app.use('/api/users', require('./src/routes/userRoutes.js'));

//--- ERROR 404 ---
app.use('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, '..', 'frontend', 'src', 'public', '404.html'));
});

// Servidor desplegado
app.listen(PORT, () => {
    console.log('[ ✓ Servidor disponible en puerto', PORT, ']');
});

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