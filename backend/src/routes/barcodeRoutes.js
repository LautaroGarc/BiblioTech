
const express = require('express');
const router = express.Router();
const BarcodeController = require('../controllers/barcodeHandlers');

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
