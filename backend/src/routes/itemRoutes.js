const express = require('express');
const router = express.Router();

const ItemController = require('../controllers/itemHandlers');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

// ⚠️ IMPORTANTE: Las rutas específicas ANTES de las rutas con parámetros

// Rutas de carrousel (PRIMERO)
router.get('/books/carrousel', ItemController.bookCarrousel);
router.get('/supps/carrousel', ItemController.suppCarrousel);

// Rutas de búsqueda y recomendaciones
router.get('/books/search', ItemController.searchBooks);
router.get('/books/recommendations', authenticateToken, ItemController.getRecommendations);

// Rutas generales
router.get('/books', ItemController.getAllBooks); 
router.get('/supps', ItemController.getAllSupplies);

// Rutas con parámetros (AL FINAL)
router.get('/books/:id', ItemController.getBookById);
router.get('/supps/:id', ItemController.getSupplyById);

// Rutas de modificación (admin)
router.post('/books', authenticateToken, isAdmin, ItemController.createBook);
router.put('/books/:id', authenticateToken, isAdmin, ItemController.updateBook);
router.post('/supps', authenticateToken, isAdmin, ItemController.createSupply);
router.put('/supps/:id', authenticateToken, isAdmin, ItemController.updateSupply);

module.exports = router;