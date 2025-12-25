const express = require('express');
const router = express.Router();

const ItemController = require('../controllers/itemHandlers');
const AuthMiddleware = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/supplies
 * @desc    Obtener todos los útiles
 * @access  Public
 */
router.get('/', ItemController.getAllSupplies);

/**
 * @route   GET /api/supplies/carrousel
 * @desc    Obtener útiles para carrousel
 * @access  Public
 */
router.get('/carrousel', ItemController.suppCarrousel);

/**
 * @route   GET /api/supplies/:id
 * @desc    Obtener útil por ID
 * @access  Public
 */
router.get('/:id', ItemController.getSupplyById);

/**
 * @route   POST /api/supplies
 * @desc    Crear nuevo útil
 * @access  Private (Admin)
 */
router.post('/', AuthMiddleware.authenticateToken, AuthMiddleware.isAdmin, ItemController.createSupply);

/**
 * @route   PUT /api/supplies/:id
 * @desc    Actualizar útil
 * @access  Private (Admin)
 */
router.put('/:id', AuthMiddleware.authenticateToken, AuthMiddleware.isAdmin, ItemController.updateSupply);

/**
 * @route   DELETE /api/supplies/:id
 * @desc    Eliminar útil
 * @access  Private (Admin)
 */
router.delete('/:id', AuthMiddleware.authenticateToken, AuthMiddleware.isAdmin, ItemController.deleteSupply);

module.exports = router;
