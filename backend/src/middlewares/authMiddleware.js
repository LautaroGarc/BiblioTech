const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');

class AuthMiddleware {
    static generateToken(user) {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                type: user.type,
                accepted: user.accepted
            },
            JWT_SECRET,
            { expiresIn: '24h' } // ← 24 horas de expiración
        );
    }

    static authenticateToken(req, res, next) {
        let token = req.headers['authorization']?.split(' ')[1]; // Bearer token

        if (!token) {
            token = req.cookies?.token;
        }

        if (!token) {
            token = req.query?.token;
        }

        if (!token) {
            token = req.headers['x-auth-token'];
        }

        if (!token) {
            return res.status(401).json({
                message: 'Acceso no autorizado. Token requerido.'
            });
        }

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(403).json({
                        message: 'Token expirado. Por favor, inicia sesión nuevamente.'
                    });
                }
                return res.status(403).json({
                    message: 'Token inválido.'
                });
            }

            req.user = user;
            next();
        });
    }

    /**
     * Middleware: Verificar sesión y redirigir
     */
    static checkSession(req, res, next) {
        let token = req.headers['authorization']?.split(' ')[1];

        if (!token) {
            token = req.cookies?.token;
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
    static isAdmin(req, res, next) {
        if (!req.user || req.user.type !== 'admin') {
            return res.status(403).json({
                message: 'Acceso denegado. Se requieren permisos de administrador.'
            });
        }
        next();
    }

    /**
     * Middleware: Verificar que el usuario sea estudiante o admin
     */
    static isStudent(req, res, next) {
        if (!req.user || (req.user.type !== 'student' && req.user.type !== 'admin')) {
            return res.status(403).json({
                message: 'Acceso denegado.'
            });
        }
        next();
    }
}

module.exports = AuthMiddleware;