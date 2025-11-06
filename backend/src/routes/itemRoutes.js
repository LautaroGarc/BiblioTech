const express = require('express');
const router = express.Router();

const ItemController = require('../controllers/itemHandlers');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/api/books', ItemController.getAllBooks); 
router.get('/api/books/:id', ItemController.getBookById);
router.get('/api/books/search', ItemController.searchBooks);
router.get('/api/books/recommendations', authenticateToken, ItemController.getRecommendations);

router.post('/api/books', authenticateToken, isAdmin, ItemController.createBook);
router.put('/api/books/:id', authenticateToken, isAdmin, ItemController.updateBook);

router.get('/api/supps', ItemController.getAllSupplies);
router.get('/api/supps/:id', ItemController.getSupplyById); 
router.post('/api/supps', authenticateToken, isAdmin, ItemController.createSupply);
router.put('/api/supps/:id', authenticateToken, isAdmin, ItemController.updateSupply);

router.get('/api/books/carrousel', ItemController.bookCarrousel);
router.get('/api/supps/carrousel', ItemController.suppCarrousel);

module.exports = router;