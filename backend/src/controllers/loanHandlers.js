const LoanModel = require('../models/loans.js');

class LoanController {
    // Crear préstamo
    static async createLoan(req, res) {
        try {
            const { userId, itemId, dateOut, type } = req.body;
            
            // Validaciones básicas
            if (!userId || !itemId || !dateOut || !type) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan campos requeridos: userId, itemId, dateOut, type'
                });
            }

            if (!['book', 'supply'].includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Tipo debe ser "book" o "supply"'
                });
            }

            let result;
            const loanData = { userId, dateOut };

            if (type === 'book') {
                loanData.bookId = itemId;
                result = await LoanModel.createBookLoan(loanData);
            } else {
                loanData.itemId = itemId;
                result = await LoanModel.createSupplyLoan(loanData);
            }

            res.status(201).json({
                success: true,
                message: 'Préstamo creado exitosamente',
                data: {
                    loanId: result.insertId,
                    ...loanData
                }
            });

        } catch (error) {
            console.error('Error creating loan:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener MIS préstamos activos (usuario autenticado)
    static async getMyLoans(req, res) {
        try {
            const userId = req.user.id;
            
            const loans = await LoanModel.getActiveLoansByUser(userId);
            
            res.json({
                success: true,
                data: loans
            });

        } catch (error) {
            console.error('Error getting my loans:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener préstamos activos
    static async getActiveLoans(req, res) {
        try {
            const userId = req.params.userId || req.user.id;
            
            const loans = await LoanModel.getActiveLoansByUser(userId);
            
            res.json({
                success: true,
                data: loans
            });

        } catch (error) {
            console.error('Error getting active loans:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Devolver item
    static async returnLoan(req, res) {
        try {
            const { loanId, type } = req.body;

            if (!loanId || !type) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan loanId o type'
                });
            }

            const result = await LoanModel.returnLoan(loanId, type);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Préstamo no encontrado o ya devuelto'
                });
            }

            res.json({
                success: true,
                message: 'Item devuelto exitosamente'
            });

        } catch (error) {
            console.error('Error returning loan:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Verificar atrasos
    static async checkOverdue(req, res) {
        try {
            const result = await LoanModel.checkAndUpdateOverdueLoans();
            
            res.json({
                success: true,
                message: 'Verificación de atrasos completada',
                data: result
            });

        } catch (error) {
            console.error('Error checking overdue loans:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Escanear código de barras
    static async scanBarcode(req, res) {
        try {
            const { barcode } = req.params;

            if (!barcode) {
                return res.status(400).json({
                    success: false,
                    message: 'Código de barras requerido'
                });
            }

            const item = await LoanModel.findItemByBarcode(barcode);

            if (!item) {
                return res.status(404).json({
                    success: false,
                    message: 'Item no encontrado'
                });
            }

            res.json({
                success: true,
                data: item
            });

        } catch (error) {
            console.error('Error scanning barcode:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Historial de préstamos
    static async getLoanHistory(req, res) {
        try {
            const { userId, itemId, type } = req.query;
            
            const history = await LoanModel.getLoanHistory(userId, itemId, type);
            
            res.json({
                success: true,
                data: history
            });

        } catch (error) {
            console.error('Error getting loan history:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener todos los préstamos (admin)
    static async getAllLoans(req, res) {
        try {
            const { state, type, page = 1, limit = 50 } = req.query;
            const offset = (page - 1) * limit;

            const filters = {
                state,
                type,
                limit: parseInt(limit),
                offset: parseInt(offset)
            };

            const loans = await LoanModel.getAllLoans(filters);
            
            res.json({
                success: true,
                data: loans,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    count: loans.length
                }
            });

        } catch (error) {
            console.error('Error getting all loans:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener préstamos atrasados
    static async getOverdueLoans(req, res) {
        try {
            const overdueLoans = await LoanModel.getOverdueLoans();
            
            res.json({
                success: true,
                data: overdueLoans
            });

        } catch (error) {
            console.error('Error getting overdue loans:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = LoanController;