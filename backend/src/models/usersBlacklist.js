db = require('../../../database/database.js')

class UsersBlacklistModel {
    static async addToBlacklist(userId, blacklistedUserId) {
        try {
            const [result] = await db.execute(`INSERT INTO usersBlacklist (userId, blacklistedUserId) VALUES (?, ?)`, [userId, blacklistedUserId]);
            return result;
        } catch (error) {
            console.error('Error en addToBlacklist: ', error);
            throw error;
        }
    }

    static async removeFromBlacklist(userId, blacklistedUserId) {
        try {
            const [result] = await db.execute(`DELETE FROM usersBlacklist WHERE userId = ? AND blacklistedUserId = ?`, [userId, blacklistedUserId]);
            return result;
        } catch (error) {
            console.error('Error en removeFromBlacklist: ', error);
            throw error;
        }
    }

    static async getBlacklist(userId) {
        try {
            const [rows] = await db.execute(`SELECT blacklistedUserId FROM usersBlacklist WHERE userId = ?`, [userId]);
            return rows;
        } catch (error) {
            console.error('Error en getBlacklist:', error);
            throw error;
        }
    }

    static async isBlacklisted(userId, blacklistedUserId) {
        try {
            const [rows] = await db.execute(`SELECT COUNT(*) as count FROM usersBlacklist WHERE userId = ? AND blacklistedUserId = ?`, [userId, blacklistedUserId]);
            return rows[0].count > 0;
        } catch (error) {
            console.error('Error en isBlacklisted:', error);
            throw error;
        }
    }
}

module.exports = UsersBlacklistModel;