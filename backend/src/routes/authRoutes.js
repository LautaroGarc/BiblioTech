const express = require('express');
const router = express.Router();

const UserController = require('../controllers/userHandlers');
const ValidationMiddleware = require('../middlewares/validationMiddleware');
const AuthMiddleware = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 * @body    { name, lastName, email, pass }
 * @return  { token, user }
 */
router.post('/register', ValidationMiddleware.validateRegister, UserController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 * @body    { email, pass }
 * @return  { token, user }
 */
router.post('/login', ValidationMiddleware.validateLogin, UserController.login);

/**
 * @route   POST /api/auth/check-email
 * @desc    Verificar si email ya existe
 * @access  Public
 * @body    { email }
 * @return  { exists: boolean }
 */
router.post('/check-email', UserController.checkEmail);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión
 * @access  Private
 * @return  { message }
 */
router.post('/logout', AuthMiddleware.authenticateToken, (req, res) => {
    try {
        console.log('[LOGOUT] Cerrando sesión para usuario:', req.user.email);

        // Limpiar la cookie del token
        const isProduction = process.env.NODE_ENV === 'production';
        res.clearCookie('token', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/'
        });

        res.json({ message: 'Logout exitoso' });

    } catch (error) {
        console.error('[ LOGOUT ERROR ]', error);
        res.status(500).json({ 
            message: 'Error al cerrar sesión',
            error: error.message 
        });
    }
});

module.exports = router;