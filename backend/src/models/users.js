const db = require('../../../database/database.js')

class UserModel {
    static async addUser(user) {
        try {
            const [result] = await db.execute(`INSERT INTO users (name, lastName, img, email, pass) VALUES (?,?,?,?,?)`, [user.name, user.lastName, user.img, user.email, user.pass]);
            return result;
        } catch (error) {
            console.error('Error en addUser: ', error);
            throw error;
        }
    }

    static async editUser(idUser, field, data) {
        try {
            const query = `UPDATE users SET \`${field}\` = ? WHERE id = ?`;
            const [result] = await db.execute(query, [data, idUser]);
            return result;
        } catch (error) {
            console.error('Error en editUser: ', error);
            throw error;
        }
    }

    static async deleteUser(idUser) {
        try {
            const [result] = await db.execute(`DELETE FROM users WHERE id = ?`, [idUser]);
            return result;
        } catch (error) {
            console.error('Error en deleteUser: ', error);
            throw error;
        }
    }

    static async updateLvl(idUser) {
        try {
            const [result] = await db.execute(`UPDATE users SET lvl = lvl + 1 WHERE id = ?`, [idUser]);
            return result;
        } catch (error) {
            console.error('Error en updateLvl: ', error);
            throw error;
        }
    }

    static async getUsers() {
        try {
            const [result] = await db.execute(`SELECT * FROM users`);
            return result;
        } catch (error) {
            console.error('Error en getUsers: ', error);
            throw error;
        }
    }

    static async getUserWith(field, idUser) {
        try {
            const query = `SELECT \`${field}\` FROM users WHERE id = ?`;
            const [result] = await db.execute(query, [idUser]);
            return result;
        } catch (error) {
            console.error('Error en getUsersWith: ', error);
            throw error;
        }
    }

    static async getUsersWith(field) {
        try {
            const query = `SELECT \`${field}\` FROM users`;
            const [result] = await db.execute(query);
            return result;
        } catch (error) {
            console.error('Error en getUsersWith: ', error);
            throw error;
        }
    }

    static async getUser(idUser) {
        try {
            const [result] = await db.execute(`SELECT * FROM users WHERE id = ?`, [idUser]);
            return result[0];
        } catch (error) {
            console.error('Error en getUser: ', error);
            throw error;
        }
    }

    static async warnUser(idUser, data) {
        try {
            const [result] = await db.execute(`UPDATE users SET warning = ? WHERE id = ?`, [data, idUser]);
            return result;
        } catch (error) {
            console.error('Error en warnUser: ', error);
            throw error;
        }
    }
}

module.exports = UserModel;

// Export individual functions for backward compatibility
module.exports.addUser = UserModel.addUser;
module.exports.editUser = UserModel.editUser;
module.exports.deleteUser = UserModel.deleteUser;
module.exports.updateLvl = UserModel.updateLvl;
module.exports.getUsers = UserModel.getUsers;
module.exports.getUserWith = UserModel.getUserWith;
module.exports.getUsersWith = UserModel.getUsersWith;
module.exports.getUser = UserModel.getUser;
module.exports.warnUser = UserModel.warnUser;