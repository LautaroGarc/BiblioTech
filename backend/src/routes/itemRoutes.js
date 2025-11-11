const express = require('express');
const router = express.Router();

const ItemController = require('../controllers/itemHandlers');
const AuthMiddleware = require('../middlewares/authMiddleware');

// ⚠️ IMPORTANTE: Las rutas específicas ANTES de las rutas con parámetros

/**
 * @route   GET /api/items/books/carrousel
 * @desc    Obtener libros para carrousel
 * @access  Public
 */
router.get('/books/carrousel', ItemController.bookCarrousel);

/**
 * @route   GET /api/items/supps/carrousel
 * @desc    Obtener supplies para carrousel
 * @access  Public
 */
router.get('/supps/carrousel', ItemController.suppCarrousel);

/**
 * @route   GET /api/items/books/search
 * @desc    Buscar libros
 * @access  Public
 * @query   q, author, gender, etc.
 */
router.get('/books/search', ItemController.searchBooks);

/**
 * @route   GET /api/items/books/recommendations
 * @desc    Obtener recomendaciones de libros
 * @access  Private
 */
router.get('/books/recommendations', AuthMiddleware.authenticateToken, ItemController.getRecommendations);

/**
 * @route   POST /api/items/books/like
 * @desc    Dar like a un libro
 * @access  Private
 * @body    { bookId }
 */
router.post('/books/like', AuthMiddleware.authenticateToken, ItemController.likeBook);

/**
 * @route   POST /api/items/books/unlike
 * @desc    Quitar like a un libro
 * @access  Private
 * @body    { bookId }
 */
router.post('/books/unlike', AuthMiddleware.authenticateToken, ItemController.unlikeBook);

/**
 * @route   GET /api/items/books
 * @desc    Obtener todos los libros
 * @access  Public
 */
router.get('/books', ItemController.getAllBooks);

/**
 * @route   GET /api/items/supps
 * @desc    Obtener todos los supplies
 * @access  Public
 */
router.get('/supps', ItemController.getAllSupplies);

/**
 * @route   GET /api/items/books/:id
 * @desc    Obtener libro por ID
 * @access  Public
 */
router.get('/books/:id', ItemController.getBookById);

/**
 * @route   GET /api/items/supps/:id
 * @desc    Obtener supply por ID
 * @access  Public
 */
router.get('/supps/:id', ItemController.getSupplyById);

/**
 * @route   POST /api/items/books
 * @desc    Crear nuevo libro
 * @access  Private (Admin)
 * @body    { name, img, sinopsis, author, etc. }
 */
router.post('/books', AuthMiddleware.authenticateToken, AuthMiddleware.isAdmin, ItemController.createBook);

/**
 * @route   PUT /api/items/books/:id
 * @desc    Actualizar libro
 * @access  Private (Admin)
 * @body    { field, data }
 */
router.put('/books/:id', AuthMiddleware.authenticateToken, AuthMiddleware.isAdmin, ItemController.updateBook);

/**
 * @route   POST /api/items/supps
 * @desc    Crear nuevo supply
 * @access  Private (Admin)
 * @body    { name, img, barCode, etc. }
 */
router.post('/supps', AuthMiddleware.authenticateToken, AuthMiddleware.isAdmin, ItemController.createSupply);

/**
 * @route   PUT /api/items/supps/:id
 * @desc    Actualizar supply
 * @access  Private (Admin)
 * @body    { field, data }
 */
router.put('/supps/:id', AuthMiddleware.authenticateToken, AuthMiddleware.isAdmin, ItemController.updateSupply);

/**
 * @route   DELETE /api/items/books/:id
 * @desc    Eliminar libro
 * @access  Private (Admin)
 */
router.delete('/books/:id', AuthMiddleware.authenticateToken, AuthMiddleware.isAdmin, ItemController.deleteBook);

/**
 * @route   DELETE /api/items/supps/:id
 * @desc    Eliminar supply
 * @access  Private (Admin)
 */
router.delete('/supps/:id', AuthMiddleware.authenticateToken, AuthMiddleware.isAdmin, ItemController.deleteSupply);

module.exports = router;