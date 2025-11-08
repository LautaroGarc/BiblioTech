const db = require('../../../database/database.js')

class ForumModel {
    static async createForum(forum) {
        try {
            const [result] = await db.execute(`INSERT INTO forum (name, description) VALUES (?, ?)`, [forum.name, forum.description]);
            return result;
        } catch (error) {
            console.error('Error en createForum: ', error);
            throw error;
        }
    }

    static async getForums() {
        try {
            const [rows] = await db.execute(`SELECT * FROM forum ORDER BY id`);
            return rows;
        } catch (error) {
            console.error('Error en getForums:', error);
            throw error;
        }
    }

    static async getForum(forumId) {
        try {
            const [rows] = await db.execute(`SELECT * FROM forum WHERE id = ?`, [forumId]);
            return rows[0];
        } catch (error) {
            console.error('Error en getForum:', error);
            throw error;
        }
    }

    static async editForum(forumId, field, data) {
        try {
            const [result] = await db.execute(`UPDATE forum SET \`${field}\` = ? WHERE id = ?`, [data, forumId]);
            return result;
        } catch (error) {
            console.error('Error en editForum:', error);
            throw error;
        }
    }

    static async deleteForum(forumId) {
        try {
            const [result] = await db.execute(`DELETE FROM forum WHERE id = ?`, [forumId]);
            return result;
        } catch (error) {
            console.error('Error en deleteForum:', error);
            throw error;
        }
    }
}

module.exports = ForumModel;