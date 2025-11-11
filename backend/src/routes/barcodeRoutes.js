
const express = require('express');
const router = express.Router();
const BarcodeController = require('../controllers/barcodeHandlers');
const AuthMiddleware = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/barcode/scan/:barcode
 * @desc    Escanear código de barras para admin
 * @access  Private (Admin)
 */
router.get('/scan/:barcode', AuthMiddleware.authenticateToken, BarcodeController.scanBarcode);

/**
 * @route   GET /api/barcode/:barcode
 * @desc    Resolver item (libro o supply) por código de barras
 * @access  public
 */
router.get('/:barcode', BarcodeController.resolveBarcode);

/**
 * @route   GET /api/barcode/:barcode/exists
 * @desc    Verificar si un código de barras existe
 * @access  public
 */
router.get('/:barcode/exists', BarcodeController.checkBarcodeExists);

module.exports = router;
