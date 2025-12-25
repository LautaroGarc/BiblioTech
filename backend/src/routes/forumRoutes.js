const express = require('express');
const router = express.Router();

const ForumController = require('../controllers/forumHandlers');
const AuthMiddleware = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/forums
 * @desc    Obtener todos los foros
 * @access  Private
 */
router.get('/', AuthMiddleware.authenticateToken, ForumController.getForums);

/**
 * @route   POST /api/forums
 * @desc    Crear nuevo foro
 * @access  Private (Admin)
 */
router.post('/', AuthMiddleware.authenticateToken, AuthMiddleware.isAdmin, ForumController.createForum);

/**
 * @route   GET /api/forums/:id/messages
 * @desc    Obtener mensajes de un foro
 * @access  Private
 * @query   page, limit
 */
router.get('/:id/messages', AuthMiddleware.authenticateToken, ForumController.getForumMessages);

/**
 * @route   POST /api/forums/:id/messages
 * @desc    Publicar mensaje en foro
 * @access  Private
 * @body    { text }
 */
router.post('/:id/messages', AuthMiddleware.authenticateToken, ForumController.postMessage);

/**
 * @route   POST /api/forums/:id/messages/:msgId/reply
 * @desc    Responder a un mensaje
 * @access  Private
 * @body    { text }
 */
router.post('/:id/messages/:msgId/reply', AuthMiddleware.authenticateToken, ForumController.replyToMessage);

/**
 * @route   DELETE /api/forums/:id/messages/:msgId
 * @desc    Eliminar mensaje (admin o dueño)
 * @access  Private
 */
router.delete('/:id/messages/:msgId', AuthMiddleware.authenticateToken, ForumController.deleteMessage);

module.exports = router;