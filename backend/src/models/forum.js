const db = require('../../../database/database.js')

async function getForums(){
    try {
        const [result] = await db.execute(`SELECT * FROM forum`);
        return result;
    }catch (error){
        console.error('Error en getForums: ', error);
        throw error;
    }
}

// obtener comentarios y paginas
async function getForumMessages(idForum, page = 1, itemsPerPage = 15) {
    try {
        const offset = (page - 1) * itemsPerPage;
        
        const [result] = await db.execute(
            `SELECT * FROM forumChat WHERE forumId = ? ORDER BY date ASC LIMIT ? OFFSET ?`, [idForum, itemsPerPage, offset]
        );
        
        // Obtener total para saber si hay más páginas
        const [[totalCount]] = await db.execute(
            `SELECT COUNT(*) as total FROM forumChat WHERE forumId = ?`,
            [idForum]
        );
        
        return {
            messages: result,
            currentPage: page,
            totalPages: Math.ceil(totalCount.total / itemsPerPage),
            hasMore: page < Math.ceil(totalCount.total / itemsPerPage)
        };
        
    } catch (error) {
        console.error('Error en getForumMessages: ', error);
        throw error;
    }
}



// crear comentario
async function postMessage(comment) {
    try{
        const [result] = await db.execute(`INSERT INTO forumChat (userId, forumId, text, date) VALUES (?, ?, ?, ?)`, [comment.userId, comment.forumId, comment.text, comment.date]);
        return result;
    } catch (error){
        console.error('Error en postMessage: ', error);
        throw error;
    }
};


// eliminar comentario
async function deleteMessage(idComment) {
    try{
        const [result] = await db.execute(`DELETE FROM forumChat WHERE id = ?`, [idComment]);
        return result;
    } catch (error){
        console.error('Error en deleteMessage: ', error);
        throw error;
    }
};

module.exports = {
    getForums,
    getForumMessages,
    postMessage,
    deleteMessage
};