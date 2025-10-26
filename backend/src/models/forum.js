const db = require('../../../database/database.js')

// crear comentario
async function createComment(comment) {
    try{
        const [result] = await db.execute(`INSERT INTO forumchat (userId, forumId, text, date) VALUES (?, ?, ?, ?)`, [comment.userId, comment.forumId, comment.text, comment.date]);
        return result;
    } catch (error){
        console.error('Error en createComment: ', error);
        throw error;
    }
};


// eliminar comentario
async function deleteComment(idComment) {
    try{
        const [result] = await db.execute(`DELETE FROM comments WHERE id = ?`, [idComment]);
        return result;
    } catch (error){
        console.error('Error en deleteComment: ', error);
        throw error;
    }
};
