const express = require('express');
const router = express.Router();

const AdminController = require('../controllers/adminHandlers');
const AuthMiddleware = require('../middlewares/authMiddleware');

// Middleware para todas las rutas de admin
router.use(AuthMiddleware.authenticateToken);
router.use(AuthMiddleware.isAdmin);

/**
 * @route   GET /api/admin/users/pending
 * @desc    Obtener usuarios pendientes de aprobación
 * @access  Private (Admin)
 */
router.get('/users/pending', AdminController.getPendingUsers);

/**
 * @route   PUT /api/admin/users/:id/approve
 * @desc    Aprobar usuario
 * @access  Private (Admin)
 */
router.put('/users/:id/approve', AdminController.approveUser);

/**
 * @route   PUT /api/admin/users/:id/reject
 * @desc    Rechazar usuario
 * @access  Private (Admin)
 */
router.put('/users/:id/reject', AdminController.rejectUser);

/**
 * @route   GET /api/admin/users
 * @desc    Obtener todos los usuarios
 * @access  Private (Admin)
 */
router.get('/users', AdminController.getAllUsers);

/**
 * @route   PUT /api/admin/users/:id/warn
 * @desc    Advertir usuario
 * @access  Private (Admin)
 * @body    { warningLevel, reason }
 */
router.put('/users/:id/warn', AdminController.warnUser);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Eliminar usuario
 * @access  Private (Admin)
 */
router.delete('/users/:id', AdminController.deleteUser);

/**
 * @route   GET /api/admin/reports
 * @desc    Generar reportes estadísticos
 * @access  Private (Admin)
 * @query   type, startDate, endDate
 */
router.get('/reports', AdminController.generateReports);

/**
 * @route   GET /api/admin/statistics
 * @desc    Obtener estadísticas generales
 * @access  Private (Admin)
 */
router.get('/statistics', AdminController.getStatistics);

module.exports = router;

/**
 * @route   GET /api/admin/users/pending
 * @desc    Obtener usuarios pendientes de aprobación
 * @access  Private (Admin)
 */
router.get('/users/pending', AdminController.getPendingUsers);

/**
 * @route   PUT /api/admin/users/:id/approve
 * @desc    Aprobar usuario
 * @access  Private (Admin)
 */
router.put('/users/:id/approve', AdminController.approveUser);

/**
 * @route   PUT /api/admin/users/:id/reject
 * @desc    Rechazar usuario
 * @access  Private (Admin)
 */
router.put('/users/:id/reject', AdminController.rejectUser);

/**
 * @route   GET /api/admin/users
 * @desc    Obtener todos los usuarios
 * @access  Private (Admin)
 */
router.get('/users', AdminController.getAllUsers);

/**
 * @route   PUT /api/admin/users/:id/warn
 * @desc    Advertir usuario
 * @access  Private (Admin)
 * @body    { warningLevel, reason }
 */
router.put('/users/:id/warn', AdminController.warnUser);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Eliminar usuario
 * @access  Private (Admin)
 */
router.delete('/users/:id', AdminController.deleteUser);

/**
 * @route   GET /api/admin/reports
 * @desc    Generar reportes estadísticos
 * @access  Private (Admin)
 * @query   type, startDate, endDate
 */
router.get('/reports', AdminController.generateReports);

/**
 * @route   GET /api/admin/statistics
 * @desc    Obtener estadísticas generales
 * @access  Private (Admin)
 */
router.get('/statistics', AdminController.getStatistics);

module.exports = router;