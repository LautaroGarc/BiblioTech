const express = require('express');
const router = express.Router();

const LoanController = require('../controllers/loanHandlers');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/loans/create
 * @desc    Crear nuevo préstamo
 * @access  Private
 * @body    { userId, itemId, dateOut, type: 'book' | 'supply' }
 */
router.post('/create', authenticateToken, LoanController.createLoan);

/**
 * @route   GET /api/loans/active
 * @desc    Ver préstamos activos
 * @access  Private
 */
router.get('/active', authenticateToken, LoanController.getActiveLoans);

/**
 * @route   GET /api/loans/active/:userId
 * @desc    Ver préstamos activos de un usuario específico
 * @access  Private (Admin)
 */
router.get('/active/:userId', authenticateToken, isAdmin, LoanController.getActiveLoans);

/**
 * @route   PUT /api/loans/:id/return
 * @desc    Devolver item prestado
 * @access  Private
 * @body    { loanId, type: 'book' | 'supply' }
 */
router.put('/:id/return', authenticateToken, LoanController.returnLoan);

/**
 * @route   GET /api/loans/history
 * @desc    Historial de préstamos
 * @access  Private
 * @query   userId, itemId, type
 */
router.get('/history', authenticateToken, LoanController.getLoanHistory);

/**
 * @route   POST /api/loans/scan/:barcode
 * @desc    Escanear código de barras
 * @access  Private (Admin)
 */
router.post('/scan/:barcode', authenticateToken, isAdmin, LoanController.scanBarcode);

/**
 * @route   GET /api/loans/overdue
 * @desc    Obtener préstamos atrasados
 * @access  Private (Admin)
 */
router.get('/overdue', authenticateToken, isAdmin, LoanController.getOverdueLoans);

/**
 * @route   POST /api/loans/check-overdue
 * @desc    Verificar y actualizar atrasos
 * @access  Private (Admin)
 */
router.post('/check-overdue', authenticateToken, isAdmin, LoanController.checkOverdue);

/**
 * @route   GET /api/loans
 * @desc    Obtener todos los préstamos (Admin)
 * @access  Private (Admin)
 * @query   state, type, page, limit
 */
router.get('/', authenticateToken, isAdmin, LoanController.getAllLoans);

module.exports = router;