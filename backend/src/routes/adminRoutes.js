const express = require('express');
const router = express.Router();

const {
    getPendingUsers,
    approveUser,
    rejectUser,
    getAllUsers,
    warnUser,
    deleteUser,
    generateReports,
    getStatistics
} = require('../controllers/adminHandlers');

const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

// Middleware para todas las rutas de admin
router.use(authenticateToken);
router.use(isAdmin);

/**
 * @route   GET /api/admin/users/pending
 * @desc    Obtener usuarios pendientes de aprobación
 * @access  Private (Admin)
 */
router.get('/users/pending', getPendingUsers);

/**
 * @route   PUT /api/admin/users/:id/approve
 * @desc    Aprobar usuario
 * @access  Private (Admin)
 */
router.put('/users/:id/approve', approveUser);

/**
 * @route   PUT /api/admin/users/:id/reject
 * @desc    Rechazar usuario
 * @access  Private (Admin)
 */
router.put('/users/:id/reject', rejectUser);

/**
 * @route   GET /api/admin/users
 * @desc    Obtener todos los usuarios
 * @access  Private (Admin)
 */
router.get('/users', getAllUsers);

/**
 * @route   PUT /api/admin/users/:id/warn
 * @desc    Advertir usuario
 * @access  Private (Admin)
 * @body    { warningLevel, reason }
 */
router.put('/users/:id/warn', warnUser);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Eliminar usuario
 * @access  Private (Admin)
 */
router.delete('/users/:id', deleteUser);

/**
 * @route   GET /api/admin/reports
 * @desc    Generar reportes estadísticos
 * @access  Private (Admin)
 * @query   type, startDate, endDate
 */
router.get('/reports', generateReports);

/**
 * @route   GET /api/admin/statistics
 * @desc    Obtener estadísticas generales
 * @access  Private (Admin)
 */
router.get('/statistics', getStatistics);

module.exports = router;