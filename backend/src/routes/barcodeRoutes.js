const express = require('express');
const router = express.Router();
const BarcodeController = require('../controllers/barcodeHandlers');
const { authenticateToken } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/barcode/:barcode
 * @desc    Resolver item (libro o supply) por código de barras
 * @access  Private
 */
router.get('/:barcode', authenticateToken, BarcodeController.resolveBarcode);

/**
 * @route   GET /api/barcode/:barcode/exists
 * @desc    Verificar si un código de barras existe
 * @access  Private
 */
router.get('/:barcode/exists', authenticateToken, BarcodeController.checkBarcodeExists);

module.exports = router;
