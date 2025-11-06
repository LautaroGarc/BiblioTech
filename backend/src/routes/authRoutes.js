const express = require('express');
const router = express.Router();

const {
    register,
    login,
    logout,
    checkEmail,
    forgotPassword
} = require('../controllers/userHandlers');

const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateRegister, validateLogin } = require('../middlewares/validationMiddleware');

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 * @body    { name, lastName, email, pass }
 * @return  { token, user }
 */
router.post('/register', validateRegister, register);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 * @body    { email, pass }
 * @return  { token, user }
 */
router.post('/login', validateLogin, login);

/**
 * @route   POST /api/auth/check-email
 * @desc    Verificar si email ya existe
 * @access  Public
 * @body    { email }
 * @return  { exists: boolean }
 */
router.post('/check-email', checkEmail);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Recuperar contraseña (enviar email)
 * @access  Public
 * @body    { email }
 * @return  { ok: boolean }
 *
router.post('/forgot-password', forgotPassword);
*/
module.exports = router;