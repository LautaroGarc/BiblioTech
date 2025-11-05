const express = require('express');
const router = express.Router();

const {
    getForums,
    createForum,
    getForumMessages,
    postMessage,
    replyToMessage,
    deleteMessage
} = require('../controllers/forumHandlers');

const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/forums
 * @desc    Obtener todos los foros
 * @access  Private
 */
router.get('/', authenticateToken, getForums);

/**
 * @route   POST /api/forums
 * @desc    Crear nuevo foro
 * @access  Private (Admin)
 */
router.post('/', authenticateToken, isAdmin, createForum);

/**
 * @route   GET /api/forums/:id/messages
 * @desc    Obtener mensajes de un foro
 * @access  Private
 * @query   page, limit
 */
router.get('/:id/messages', authenticateToken, getForumMessages);

/**
 * @route   POST /api/forums/:id/messages
 * @desc    Publicar mensaje en foro
 * @access  Private
 * @body    { text }
 */
router.post('/:id/messages', authenticateToken, postMessage);

/**
 * @route   POST /api/forums/:id/messages/:msgId/reply
 * @desc    Responder a un mensaje
 * @access  Private
 * @body    { text }
 */
router.post('/:id/messages/:msgId/reply', authenticateToken, replyToMessage);

/**
 * @route   DELETE /api/forums/:id/messages/:msgId
 * @desc    Eliminar mensaje (admin o dueño)
 * @access  Private
 */
router.delete('/:id/messages/:msgId', authenticateToken, deleteMessage);

module.exports = router;