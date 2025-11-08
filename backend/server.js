const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { isAccepted } = require('./src/models/users.js')
const { authenticateToken, checkSession } = require('./src/middlewares/authMiddleware.js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: ['http://localhost:5000', 'https://right-mite-infinite.ngrok-free.app'],
    credentials: true
}));

// Servir archivos estáticos desde la nueva estructura
app.use('/css', express.static(path.join(__dirname, '..', 'frontend', 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, '..', 'frontend', 'public', 'js')));
app.use('/assets', express.static(path.join(__dirname, '..', 'frontend', 'public', 'assets')));

//--- RUTAS PÚBLICAS (con redirección inteligente) ---

app.get('/', checkSession, (req, res) => {
    res.redirect('/login');
});

app.get('/login', checkSession, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'views', 'public', 'login.html'));
});

app.get('/logout', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'views', 'public', 'logout.html'));
})

app.get('/register', checkSession, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'views', 'public', 'register.html'));
});

//--- RUTAS PROTEGIDAS (requieren sesión + aceptación) ---

app.get('/home', authenticateToken, (req, res) => {
    const userType = req.user.type;
    
    console.log('[HOME] Usuario autenticado:', req.user.email, '| Tipo:', userType);
    
    switch(userType) {
        case 'admin':
            return res.sendFile(path.join(__dirname, '..', 'frontend', 'views', 'admin', 'home.html'));
        case 'user':
            return res.sendFile(path.join(__dirname, '..', 'frontend', 'views', 'user', 'home.html'));
        default:
            return res.status(403).json({ message: 'Acceso denegado' });
    }
});

app.get('/profile', authenticateToken, (req, res) => {
    const userType = req.user.type;
    
    if (userType === 'admin') {
        return res.sendFile(path.join(__dirname, '..', 'frontend', 'views', 'admin', 'profile.html'));
    } else {
        return res.sendFile(path.join(__dirname, '..', 'frontend', 'views', 'user', 'profile.html'));
    }
});

app.get('/books', authenticateToken, (req, res) => {
    const userType = req.user.type;
    
    if (userType === 'admin') {
        return res.sendFile(path.join(__dirname, '..', 'frontend', 'views', 'admin', 'books.html'));
    } else {
        return res.sendFile(path.join(__dirname, '..', 'frontend', 'views', 'user', 'books.html'));
    }
});

app.get('/forum', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'views', 'shared', 'forum.html'));
});

app.get('/search', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'views', 'shared', 'search.html'));
});

app.get('/plus', authenticateToken, (req, res) => {
    const userType = req.user.type;
    
    if (userType === 'admin') {
        return res.sendFile(path.join(__dirname, '..', 'frontend', 'views', 'admin', 'plus.html'));
    } else {
        return res.sendFile(path.join(__dirname, '..', 'frontend', 'views', 'user', 'plus.html'));
    }
});

app.get('/userActivity', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'views', 'user', 'userActivity.html'));
})

//--- RUTAS API ---
app.use('/api/auth', require('./src/routes/authRoutes.js'));
app.use('/api/users', require('./src/routes/userRoutes.js'));
app.use('/api/admin', require('./src/routes/adminRoutes.js'));
app.use('/api', require('./src/routes/itemRoutes.js'));
app.use('/api/loans', require('./src/routes/loanRoutes.js'));
app.use('/api/forums', require('./src/routes/forumRoutes.js'));
app.use('/api/recommendations', require('./src/routes/recomendationRoutes.js'));
app.use('/api/barcode', require('./src/routes/barcodeRoutes.js'));

//--- ERROR 404 ---
app.use('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, '..', 'frontend', 'views', 'public', '404.html'));
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