const express = require('express');
const router = express.Router();

const ItemController = require('../controllers/itemHandlers');
const AuthMiddleware = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/books
 * @desc    Obtener todos los libros
 * @access  Public
 */
router.get('/', ItemController.getAllBooks);

/**
 * @route   GET /api/books/carrousel
 * @desc    Obtener libros para carrousel
 * @access  Public
 */
router.get('/carrousel', ItemController.bookCarrousel);

/**
 * @route   GET /api/books/search
 * @desc    Buscar libros
 * @access  Public
 */
router.get('/search', ItemController.searchBooks);

/**
 * @route   GET /api/books/recommendations
 * @desc    Obtener recomendaciones
 * @access  Private
 */
router.get('/recommendations', AuthMiddleware.authenticateToken, ItemController.getRecommendations);

/**
 * @route   GET /api/books/:id
 * @desc    Obtener libro por ID
 * @access  Public
 */
router.get('/:id', ItemController.getBookById);

/**
 * @route   POST /api/books
 * @desc    Crear nuevo libro
 * @access  Private (Admin)
 */
router.post('/', AuthMiddleware.authenticateToken, AuthMiddleware.isAdmin, ItemController.createBook);

/**
 * @route   POST /api/books/like
 * @desc    Dar like a libro
 * @access  Private
 */
router.post('/like', AuthMiddleware.authenticateToken, ItemController.likeBook);

/**
 * @route   POST /api/books/unlike
 * @desc    Quitar like a libro
 * @access  Private
 */
router.post('/unlike', AuthMiddleware.authenticateToken, ItemController.unlikeBook);

/**
 * @route   PUT /api/books/:id
 * @desc    Actualizar libro
 * @access  Private (Admin)
 */
router.put('/:id', AuthMiddleware.authenticateToken, AuthMiddleware.isAdmin, ItemController.updateBook);

/**
 * @route   DELETE /api/books/:id
 * @desc    Eliminar libro
 * @access  Private (Admin)
 */
router.delete('/:id', AuthMiddleware.authenticateToken, AuthMiddleware.isAdmin, ItemController.deleteBook);

module.exports = router;
