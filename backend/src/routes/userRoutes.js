const express = require('express');
const router = express.Router();

const UserController = require('../controllers/userHandlers');
const AuthMiddleware = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/users/me
 * @desc    Obtener información del usuario actual
 * @access  Private
 */
router.get('/me', AuthMiddleware.authenticateToken, UserController.getMe);

/**
 * @route   PUT /api/users/me
 * @desc    Actualizar perfil del usuario actual
 * @access  Private
 * @body    { field, data }
 */
router.put('/me', AuthMiddleware.authenticateToken, UserController.updateUser);

/**
 * @route   DELETE /api/users/me
 * @desc    Eliminar cuenta del usuario actual
 * @access  Private
 */
router.delete('/me', AuthMiddleware.authenticateToken, UserController.deleteUserAccount);

/**
 * @route   POST /api/users/me/blacklist
 * @desc    Agregar usuario a blacklist
 * @access  Private
 * @body    { blacklistedUserId }
 */
router.post('/me/blacklist', AuthMiddleware.authenticateToken, UserController.addToBlacklist);

/**
 * @route   GET /api/users/me/blacklist
 * @desc    Obtener blacklist del usuario
 * @access  Private
 */
router.get('/me/blacklist', AuthMiddleware.authenticateToken, UserController.getUserBlacklist);

/**
 * @route   DELETE /api/users/me/blacklist/:id
 * @desc    Remover usuario de blacklist
 * @access  Private
 */
router.delete('/me/blacklist/:id', AuthMiddleware.authenticateToken, UserController.removeFromBlacklist);

/**
 * @route   GET /api/users/medals
 * @desc    Obtener todas las medallas disponibles
 * @access  Private
 */
router.get('/medals', AuthMiddleware.authenticateToken, UserController.getAllMedals);

/**
 * @route   POST /api/users/medals
 * @desc    Crear nueva medalla (Admin)
 * @access  Private (Admin)
 * @body    { tag, img }
 */
router.post('/medals', AuthMiddleware.authenticateToken, AuthMiddleware.isAdmin, UserController.createMedal);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener información de un usuario x
 * @access  Public
 */
router.get('/:id', UserController.getUserById);

/**
 * @route   GET /api/users
 * @desc    Obtener todos los usuarios (solo admin)
 * @access  Private (Admin)
 */
router.get('/', AuthMiddleware.authenticateToken, AuthMiddleware.isAdmin, UserController.getAllUsers);

/**
 * @route   GET /api/users/me/ads
 * @desc    Obtener anuncios del usuario actual
 * @access  Private
 */
router.get('/me/ads', AuthMiddleware.authenticateToken, UserController.getMyAd);

module.exports = router;