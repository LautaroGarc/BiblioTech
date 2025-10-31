const express = require('express');
const router = express.Router();

const {
    getMe,
    getUser,
} = require('../controllers/userHandlers');

/*
GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/loans
GET    /api/users/recommendations
GET    /api/users/stats
*/

/**
 * @route   GET /api/user/me
 * @desc    Obtener información del usuario actual
 * @access  Private
 * @header  Authorization: Bearer {token}
 * @return  { user }
 */
router.get('/me', authenticateToken, getMe);

/**
 * @route   GET /api/user/:id
 * @desc    Obtener información de un usuario x
 * @access  Public
 * @header  Authorization: Bearer {token}
 * @return  { user }
 */
router.get('/:id', getUser);

/**
 * @route   GET /api/user/:id
 * @desc    Obtener información de un usuario x
 * @access  Private
 * @header  Authorization: Bearer {token}
 * @return  { user }
 */
router.get('/users', isAdmin, getUsers);