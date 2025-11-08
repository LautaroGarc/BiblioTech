const db = require('../../../database/database.js')

class ForumChatModel {
    // crear comentario
    static async createComment(comment) {
        try{
            const [result] = await db.execute(`INSERT INTO forumChat (userId, forumId, text, date) VALUES (?, ?, ?, ?)`, [comment.userId, comment.forumId, comment.text, comment.date]);
            return result;
        } catch (error){
            console.error('Error en createComment: ', error);
            throw error;
        }
    }

    // eliminar comentario
    static async deleteComment(idComment) {
        try{
            const [result] = await db.execute(`DELETE FROM forumChat WHERE id = ?`, [idComment]);
            return result;
        } catch (error){
            console.error('Error en deleteComment: ', error);
            throw error;
        }
    }

    static async getComments(forumId) {
        try {
            const [rows] = await db.execute(`SELECT * FROM forumChat WHERE forumId = ? ORDER BY created_at`, [forumId]);
            return rows;
        } catch (error) {
            console.error('Error en getComments:', error);
            throw error;
        }
    }

    static async getComment(commentId) {
        try {
            const [rows] = await db.execute(`SELECT * FROM forumChat WHERE id = ?`, [commentId]);
            return rows[0];
        } catch (error) {
            console.error('Error en getComment:', error);
            throw error;
        }
    }

    static async editComment(commentId, field, data) {
        try {
            const [result] = await db.execute(`UPDATE forumChat SET \`${field}\` = ? WHERE id = ?`, [data, commentId]);
            return result;
        } catch (error) {
            console.error('Error en editComment:', error);
            throw error;
        }
    }
}

module.exports = ForumChatModel;