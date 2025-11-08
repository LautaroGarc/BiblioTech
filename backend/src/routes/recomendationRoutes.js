const express = require('express');
const router = express.Router();

const RecommendationController = require('../controllers/recomendationHandlers');
const AuthMiddleware = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/recommendations/books/:id/similar
 * @desc    Obtener libros similares
 * @access  Private
 */
router.get('/books/:id/similar', AuthMiddleware.authenticateToken, RecommendationController.getSimilarBooks);

/**
 * @route   GET /api/recommendations/books
 * @desc    Obtener recomendaciones personalizadas
 * @access  Private
 */
router.get('/books', AuthMiddleware.authenticateToken, RecommendationController.getRecommendations);

/**
 * @route   POST /api/recommendations/preferences
 * @desc    Guardar preferencias del usuario
 * @access  Private
 * @body    { preferences }
 */
router.post('/preferences', AuthMiddleware.authenticateToken, RecommendationController.saveUserPreferences);

/**
 * @route   POST /api/recommendations/interaction
 * @desc    Registrar interacción con libro
 * @access  Private
 * @body    { bookId, type: 'like' | 'view' }
 */
router.post('/interaction', AuthMiddleware.authenticateToken, RecommendationController.trackBookInteraction);

/**
 * @route   GET /api/recommendations/books/:id/expand
 * @desc    Expandir información de un libro
 * @access  Private
 */
router.get('/books/:id/expand', AuthMiddleware.authenticateToken, RecommendationController.expandBookInfo);

module.exports = router;