const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');

/**
 * Middleware: Autenticar token (para rutas protegidas)
 * Verifica que el token sea válido
 * Si es válido, agrega req.user con los datos del token
 * Si no es válido, devuelve error 401 o 403
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            message: 'Acceso no autorizado. Token requerido.' 
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                message: 'Token inválido o expirado.' 
            });
        }
        
        // Agregar info del usuario al request
        req.user = user; // { id, email, type, accepted }
        next();
    });
}

/**
 * Middleware: Verificar sesión y redirigir inteligentemente
 * Para rutas públicas (login, register, /)
 * - Si HAY sesión válida:
 *   - Si accepted = true → redirige a /home
 *   - Si accepted = false → redirige a /waiting
 * - Si NO hay sesión → continúa (permite acceso)
 */
function checkSession(req, res, next) {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    // Si no viene en headers, buscar en query params (para navegación directa)
    if (!token && req.query.token) {
        token = req.query.token;
    }

    // Si no hay token, no hay sesión → permitir acceso a ruta pública
    if (!token) {
        return next();
    }

    // Verificar si el token es válido
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // Token inválido/expirado → permitir acceso a ruta pública
            return next();
        }
        
        // Token válido → redirigir según estado de aceptación
        if (user.accepted) {
            // Usuario aceptado → redirigir a home
            return res.redirect('/home');
        } else {
            // Usuario NO aceptado → redirigir a waiting
            return res.redirect('/waiting');
        }
    });
}

/**
 * Middleware: Verificar que el usuario sea admin
 */
function isAdmin(req, res, next) {
    if (req.user.type !== 'admin') {
        return res.status(403).json({ 
            message: 'Acceso denegado. Se requieren permisos de administrador.' 
        });
    }
    next();
}

/**
 * Middleware: Verificar que el usuario sea estudiante o admin
 */
function isStudent(req, res, next) {
    if (req.user.type !== 'student' && req.user.type !== 'admin') {
        return res.status(403).json({ 
            message: 'Acceso denegado.' 
        });
    }
    next();
}

module.exports = {
    authenticateToken,
    checkSession,
    isAdmin,
    isStudent
};