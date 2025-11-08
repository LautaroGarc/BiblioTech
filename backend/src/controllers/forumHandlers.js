const db = require('../../../database/database');
const { createComment, deleteComment } = require('../models/forum');

class ForumController {
    // Obtener todos los foros
    static async getForums(req, res) {
        try {
            const [forums] = await db.execute(`
                SELECT 
                    f.*,
                    COUNT(fc.id) as messageCount,
                    MAX(fc.created_at) as lastActivity
                FROM forum f
                LEFT JOIN forumChat fc ON f.id = fc.forumId
                GROUP BY f.id
                ORDER BY lastActivity DESC
            `);
            
            res.json({
                success: true,
                count: forums.length,
                data: forums
            });
        } catch (error) {
            console.error('[GET FORUMS ERROR]', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener foros'
            });
        }
    }

    // Crear foro (solo admin)
    static async createForum(req, res) {
        try {
            const { name, description } = req.body;
            
            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre del foro es requerido'
                });
            }
            
            const [result] = await db.execute(
                `INSERT INTO forum (name, description) VALUES (?, ?)`,
                [name, description || '']
            );
            
            res.status(201).json({
                success: true,
                message: 'Foro creado exitosamente',
                data: {
                    id: result.insertId,
                    name,
                    description
                }
            });
        } catch (error) {
            console.error('[CREATE FORUM ERROR]', error);
            
            // Error de nombre duplicado
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un foro con ese nombre'
                });
            }
            
            res.status(500).json({
                success: false,
                message: 'Error al crear foro'
            });
        }
    }

    // Obtener mensajes de un foro
    static async getForumMessages(req, res) {
        try {
            const forumId = req.params.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const offset = (page - 1) * limit;
            
            // Verificar que el foro existe
            const [forumCheck] = await db.execute(
                `SELECT id FROM forum WHERE id = ?`,
                [forumId]
            );
            
            if (forumCheck.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Foro no encontrado'
                });
            }
            
            // Obtener mensajes con info del usuario
            const [messages] = await db.execute(`
                SELECT 
                    fc.*,
                    u.name as userName,
                    u.lastName as userLastName,
                    u.img as userImg,
                    u.lvl as userLevel,
                    COUNT(replies.id) as replyCount
                FROM forumChat fc
                JOIN users u ON fc.userId = u.id
                LEFT JOIN forumChat replies ON fc.id = replies.replyId
                WHERE fc.forumId = ? AND fc.reply = FALSE
                GROUP BY fc.id
                ORDER BY fc.created_at DESC
                LIMIT ? OFFSET ?
            `, [forumId, limit, offset]);
            
            // Obtener conteo total
            const [countResult] = await db.execute(
                `SELECT COUNT(*) as total FROM forumChat WHERE forumId = ? AND reply = FALSE`,
                [forumId]
            );
            
            res.json({
                success: true,
                data: messages,
                pagination: {
                    page,
                    limit,
                    total: countResult[0].total,
                    totalPages: Math.ceil(countResult[0].total / limit)
                }
            });
        } catch (error) {
            console.error('[GET FORUM MESSAGES ERROR]', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener mensajes'
            });
        }
    }

    // Publicar mensaje
    static async postMessage(req, res) {
        try {
            const forumId = req.params.id;
            const { text } = req.body;
            const userId = req.user.id;
            
            if (!text || text.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El mensaje no puede estar vacío'
                });
            }
            
            if (text.length > 500) {
                return res.status(400).json({
                    success: false,
                    message: 'El mensaje no puede superar los 500 caracteres'
                });
            }
            
            const comment = {
                userId,
                forumId,
                text: text.trim(),
                date: new Date()
            };
            
            const result = await createComment(comment);
            
            res.status(201).json({
                success: true,
                message: 'Mensaje publicado exitosamente',
                data: {
                    id: result.insertId,
                    ...comment
                }
            });
        } catch (error) {
            console.error('[POST MESSAGE ERROR]', error);
            res.status(500).json({
                success: false,
                message: 'Error al publicar mensaje'
            });
        }
    }

    // Responder a un mensaje
    static async replyToMessage(req, res) {
        try {
            const forumId = req.params.id;
            const messageId = req.params.msgId;
            const { text } = req.body;
            const userId = req.user.id;
            
            if (!text || text.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'La respuesta no puede estar vacía'
                });
            }
            
            // Verificar que el mensaje original existe
            const [originalMsg] = await db.execute(
                `SELECT id FROM forumChat WHERE id = ? AND forumId = ?`,
                [messageId, forumId]
            );
            
            if (originalMsg.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Mensaje original no encontrado'
                });
            }
            
            const [result] = await db.execute(
                `INSERT INTO forumChat (userId, forumId, text, reply, replyId) VALUES (?, ?, ?, TRUE, ?)`,
                [userId, forumId, text.trim(), messageId]
            );
            
            res.status(201).json({
                success: true,
                message: 'Respuesta publicada exitosamente',
                data: {
                    id: result.insertId,
                    userId,
                    forumId,
                    text: text.trim(),
                    replyId: messageId
                }
            });
        } catch (error) {
            console.error('[REPLY TO MESSAGE ERROR]', error);
            res.status(500).json({
                success: false,
                message: 'Error al publicar respuesta'
            });
        }
    }

    // Eliminar mensaje (admin o dueño)
    static async deleteMessage(req, res) {
        try {
            const messageId = req.params.msgId;
            const userId = req.user.id;
            const userType = req.user.type;
            
            // Obtener el mensaje
            const [message] = await db.execute(
                `SELECT userId FROM forumChat WHERE id = ?`,
                [messageId]
            );
            
            if (message.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Mensaje no encontrado'
                });
            }
            
            // Verificar permisos (admin o dueño)
            if (userType !== 'admin' && message[0].userId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para eliminar este mensaje'
                });
            }
            
            await deleteComment(messageId);
            
            res.json({
                success: true,
                message: 'Mensaje eliminado exitosamente'
            });
        } catch (error) {
            console.error('[DELETE MESSAGE ERROR]', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar mensaje'
            });
        }
    }
}

module.exports = ForumController;