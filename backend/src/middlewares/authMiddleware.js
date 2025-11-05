const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');

/**
 * Middleware: Autenticar token (para rutas protegidas)
 * Verifica que el token sea válido
 * Si es válido, agrega req.user con los datos del token
 * Si no es válido, devuelve error 401 o 403
 */
function authenticateToken(req, res, next) {
    // BUSCAR TOKEN EN 3 LUGARES: headers, cookies, query params
    let token = req.headers['authorization']?.split(' ')[1]; // Bearer token
    
    if (!token) {
        token = req.cookies?.token; // ← AGREGAR ESTO
    }
    
    if (!token) {
        token = req.query?.token; // query params
    }

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
        
        req.user = user;
        next();
    });
}

function checkSession(req, res, next) {
    // BUSCAR TOKEN EN 3 LUGARES
    let token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        token = req.cookies?.token; // ← AGREGAR ESTO
    }
    
    if (!token) {
        token = req.query?.token;
    }

    if (!token) {
        return next(); // No hay token → permitir acceso
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return next(); // Token inválido → permitir acceso
        }
        
        // Token válido → redirigir según estado
        if (user.accepted) {
            return res.redirect('/home');
        } else {
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