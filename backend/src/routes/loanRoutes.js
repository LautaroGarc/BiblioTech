const express = require('express');
const router = express.Router();

const LoanController = require('../controllers/loanHandlers');
const AuthMiddleware = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/loans/create
 * @desc    Crear nuevo préstamo
 * @access  Private
 * @body    { userId, itemId, dateOut, type: 'book' | 'supply' }
 */
router.post('/create', AuthMiddleware.authenticateToken, LoanController.createLoan);

/**
 * @route   GET /api/loans/me
 * @desc    Ver mis préstamos activos (usuario autenticado)
 * @access  Private
 */
router.get('/me', AuthMiddleware.authenticateToken, LoanController.getMyLoans);

/**
 * @route   GET /api/loans/active
 * @desc    Ver préstamos activos
 * @access  Private
 */
router.get('/active', AuthMiddleware.authenticateToken, LoanController.getActiveLoans);

/**
 * @route   GET /api/loans/active/:userId
 * @desc    Ver préstamos activos de un usuario específico
 * @access  Private (Admin)
 */
router.get('/active/:userId', AuthMiddleware.authenticateToken, AuthMiddleware.isAdmin, LoanController.getActiveLoans);

/**
 * @route   PUT /api/loans/:id/return
 * @desc    Devolver item prestado
 * @access  Private
 * @body    { loanId, type: 'book' | 'supply' }
 */
router.put('/:id/return', AuthMiddleware.authenticateToken, LoanController.returnLoan);

/**
 * @route   GET /api/loans/history
 * @desc    Historial de préstamos
 * @access  Private
 * @query   userId, itemId, type
 */
router.get('/history', AuthMiddleware.authenticateToken, LoanController.getLoanHistory);

/**
 * @route   POST /api/loans/scan/:barcode
 * @desc    Escanear código de barras
 * @access  Private (Admin)
 */
router.post('/scan/:barcode', AuthMiddleware.authenticateToken, AuthMiddleware.isAdmin, LoanController.scanBarcode);

/**
 * @route   GET /api/loans/overdue
 * @desc    Obtener préstamos atrasados
 * @access  Private (Admin)
 */
router.get('/overdue', AuthMiddleware.authenticateToken, AuthMiddleware.isAdmin, LoanController.getOverdueLoans);

/**
 * @route   POST /api/loans/check-overdue
 * @desc    Verificar y actualizar atrasos
 * @access  Private (Admin)
 */
router.post('/check-overdue', AuthMiddleware.authenticateToken, AuthMiddleware.isAdmin, LoanController.checkOverdue);

/**
 * @route   GET /api/loans
 * @desc    Obtener todos los préstamos (Admin)
 * @access  Private (Admin)
 * @query   state, type, page, limit
 */
router.get('/', AuthMiddleware.authenticateToken, AuthMiddleware.isAdmin, LoanController.getAllLoans);

module.exports = router;