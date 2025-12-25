db = require('../../../database/database.js')

class MedalModel {
    static async addMedal(medal) {
        try {
            const [result] = await db.execute(`INSERT INTO medals (img, tag) VALUES (?, ?)`, [medal.img, medal.tag]);
            return result;
        } catch (error) {
            console.error('Error en addMedal: ', error);
            throw error;
        }
    }

    static async getMedals() {
        try {
            const [rows] = await db.execute(`SELECT * FROM medals ORDER BY id`);
            return rows;
        } catch (error) {
            console.error('Error en getMedals:', error);
            throw error;
        }
    }

    static async getMedal(medalId) {
        try {
            const [rows] = await db.execute(`SELECT * FROM medals WHERE id = ?`, [medalId]);
            return rows[0];
        } catch (error) {
            console.error('Error en getMedal:', error);
            throw error;
        }
    }

    static async editMedal(medalId, field, data) {
        try {
            const [result] = await db.execute(`UPDATE medals SET \`${field}\` = ? WHERE id = ?`, [data, medalId]);
            return result;
        } catch (error) {
            console.error('Error en editMedal:', error);
            throw error;
        }
    }

    static async deleteMedal(medalId) {
        try {
            const [result] = await db.execute(`DELETE FROM medals WHERE id = ?`, [medalId]);
            return result;
        } catch (error) {
            console.error('Error en deleteMedal:', error);
            throw error;
        }
    }
}

module.exports = MedalModel;