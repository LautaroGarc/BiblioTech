const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');

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
        req.user = user; // { id, email, type }
        next();
    });
}

function isAdmin(req, res, next) {
    if (req.user.type !== 'admin') {
        return res.status(403).json({ 
            message: 'Acceso denegado. Se requieren permisos de administrador.' 
        });
    }
    next();
}

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
    isAdmin,
    isStudent
};