const { getBookBarcode } = require('../models/books');
const { getItemBarcode } = require('../models/items');

class BarcodeController {
    /**
     * Busca un item (libro o supply) por código de barras
     * @route GET /api/barcode/:barcode
     */
    static async resolveBarcode(req, res) {
        try {
            const { barcode } = req.params;

            if (!barcode) {
                return res.status(400).json({
                    success: false,
                    message: 'Código de barras requerido'
                });
            }

            // Buscar primero en libros
            const book = await getBookBarcode(barcode);
            if (book) {
                return res.json({
                    success: true,
                    type: 'book',
                    data: book
                });
            }

            // Si no se encuentra, buscar en supplies
            const supply = await getItemBarcode(barcode);
            if (supply) {
                return res.json({
                    success: true,
                    type: 'supply',
                    data: supply
                });
            }

            // Si no se encuentra en ninguna tabla
            return res.status(404).json({
                success: false,
                message: 'Item no encontrado con ese código de barras'
            });

        } catch (error) {
            console.error('[RESOLVE BARCODE ERROR]', error);
            res.status(500).json({
                success: false,
                message: 'Error al buscar el item'
            });
        }
    }

    /**
     * Verifica si un código de barras ya existe en el sistema
     * @route GET /api/barcode/:barcode/exists
     */
    static async checkBarcodeExists(req, res) {
        try {
            const { barcode } = req.params;

            const book = await getBookBarcode(barcode);
            const supply = await getItemBarcode(barcode);

            const exists = !!(book || supply);

            res.json({
                success: true,
                exists,
                type: book ? 'book' : supply ? 'supply' : null
            });

        } catch (error) {
            console.error('[CHECK BARCODE EXISTS ERROR]', error);
            res.status(500).json({
                success: false,
                message: 'Error al verificar código de barras'
            });
        }
    }

    /**
     * Escanear código de barras y obtener información completa del item
     * @route GET /api/barcode/scan/:barcode
     */
    static async scanBarcode(req, res) {
        try {
            const { barcode } = req.params;

            if (!barcode) {
                return res.status(400).json({
                    success: false,
                    message: 'Código de barras requerido'
                });
            }

            // Buscar en libros
            const book = await getBookBarcode(barcode);
            if (book) {
                return res.json({
                    success: true,
                    data: {
                        ...book,
                        type: 'book',
                        available: book.quant - (book.borrowed ? 1 : 0),
                        quantity: book.quant
                    }
                });
            }

            // Buscar en útiles
            const supply = await getItemBarcode(barcode);
            if (supply) {
                return res.json({
                    success: true,
                    data: {
                        ...supply,
                        type: 'supply',
                        available: (supply.total_quantity || 0) - (supply.borrowed || 0),
                        quantity: supply.total_quantity
                    }
                });
            }

            // No encontrado
            return res.status(404).json({
                success: false,
                message: 'Item no encontrado con ese código de barras'
            });

        } catch (error) {
            console.error('[SCAN BARCODE ERROR]', error);
            res.status(500).json({
                success: false,
                message: 'Error al escanear código de barras'
            });
        }
    }
}

module.exports = BarcodeController;
