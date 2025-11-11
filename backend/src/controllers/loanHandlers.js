const LoanModel = require('../models/loans.js');

class LoanController {
    // Crear préstamo
    static async createLoan(req, res) {
        try {
            const { itemId, type } = req.body;
            const userId = req.user.id; // Obtenido del token
            
            // Validaciones básicas
            if (!itemId || !type) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan campos requeridos: itemId, type'
                });
            }

            if (!['book', 'supply'].includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Tipo debe ser "book" o "supply"'
                });
            }

            // Calcular fecha de devolución (14 días por defecto)
            const dateOut = new Date();
            dateOut.setDate(dateOut.getDate() + 14);
            const formattedDateOut = dateOut.toISOString().split('T')[0];

            let result;
            const loanData = { userId, dateOut: formattedDateOut };

            if (type === 'book') {
                loanData.bookId = itemId;
                result = await LoanModel.createBookLoan(loanData);
            } else {
                loanData.itemId = itemId;
                result = await LoanModel.createSupplyLoan(loanData);
            }

            res.status(201).json({
                success: true,
                message: 'Préstamo solicitado correctamente. Listo para retirar.',
                data: {
                    loanId: result.insertId,
                    userId,
                    itemId,
                    type,
                    dateOut: formattedDateOut,
                    state: 'espera',
                    daysUntilReturn: 14
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

            console.log('[GET ALL LOANS] Filters:', filters);
            const loans = await LoanModel.getAllLoans(filters);
            console.log('[GET ALL LOANS] Total loans returned:', loans.length);
            
            // Debug: contar estados
            const stateCount = {};
            loans.forEach(loan => {
                stateCount[loan.state] = (stateCount[loan.state] || 0) + 1;
            });
            console.log('[GET ALL LOANS] State breakdown:', stateCount);
            
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

    // Aprobar préstamo (cambiar de 'no aprobado' a 'espera')
    static async approveLoan(req, res) {
        try {
            const loanId = req.params.id;
            const { type } = req.body;

            if (!type || !['book', 'supply'].includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Tipo debe ser "book" o "supply"'
                });
            }

            const result = await LoanModel.approveLoan(loanId, type);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Préstamo no encontrado o ya aprobado'
                });
            }

            res.json({
                success: true,
                message: 'Préstamo aprobado exitosamente'
            });

        } catch (error) {
            console.error('Error approving loan:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Marcar préstamo como recogido (pickup)
    static async pickupLoan(req, res) {
        try {
            const loanId = req.params.id;
            const { type } = req.body;

            if (!type || !['book', 'supply'].includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Tipo debe ser "book" o "supply"'
                });
            }

            const result = await LoanModel.pickupLoan(loanId, type);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Préstamo no encontrado o no está en estado "espera"'
                });
            }

            res.json({
                success: true,
                message: 'Préstamo marcado como recogido'
            });

        } catch (error) {
            console.error('Error marking loan as picked up:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Crear préstamo directo (admin tramita préstamo en persona)
    static async createDirectLoan(req, res) {
        try {
            const { userId, itemId, type } = req.body;

            if (!userId || !itemId || !type) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan campos requeridos: userId, itemId, type'
                });
            }

            if (!['book', 'supply'].includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Tipo debe ser "book" o "supply"'
                });
            }

            // Calcular fecha de devolución (14 días)
            const dateOut = new Date();
            dateOut.setDate(dateOut.getDate() + 14);
            const formattedDateOut = dateOut.toISOString().split('T')[0];

            let result;
            const loanData = { userId, dateOut: formattedDateOut };

            // Crear préstamo directamente en estado "en prestamo"
            if (type === 'book') {
                loanData.bookId = itemId;
                result = await LoanModel.createBookLoan(loanData);
                // Cambiar a "en prestamo" inmediatamente
                await LoanModel.pickupLoan(result.insertId, 'book');
            } else {
                loanData.itemId = itemId;
                result = await LoanModel.createSupplyLoan(loanData);
                // Cambiar a "en prestamo" inmediatamente
                await LoanModel.pickupLoan(result.insertId, 'supply');
            }

            res.status(201).json({
                success: true,
                message: 'Préstamo tramitado exitosamente',
                data: {
                    loanId: result.insertId,
                    userId,
                    itemId,
                    type,
                    dateOut: formattedDateOut,
                    state: 'en prestamo'
                }
            });

        } catch (error) {
            console.error('Error creating direct loan:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = LoanController;