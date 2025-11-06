const express = require('express');
const router = express.Router();

const {
    getMe,
    getUserById,
    getUsers,
    getMyAd
} = require('../controllers/userHandlers');

const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/users/me
 * @desc    Obtener información del usuario actual
 * @access  Private
 */
router.get('/me', authenticateToken, getMe);

router.get('/me/ad', authenticateToken, getMyAd)

/**
 * @route   GET /api/users/:id
 * @desc    Obtener información de un usuario x
 * @access  Public
 */
router.get('/:id', getUserById);

/**
 * @route   GET /api/users
 * @desc    Obtener todos los usuarios (solo admin)
 * @access  Private (Admin)
 */
router.get('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { getUsers } = require('../models/users');
        const users = await getUsers();
        
        // Remover passwords
        const usersWithoutPass = users.map(u => {
            const { pass, ...user } = u;
            return user;
        });
        
        res.json({ users: usersWithoutPass });
    } catch (error) {
        console.error('[ GET USERS ERROR ]', error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
});

module.exports = router;