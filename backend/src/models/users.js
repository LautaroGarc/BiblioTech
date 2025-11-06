const db = require('../../../database/database.js')

// agregar usuario
async function addUser(user) {
    //user = {all}
    try{
        const [result] = await db.execute(`INSERT INTO users (name, lastName, img, email, pass) VALUES (?,?,?,?,?)`, [user.name, user.lastName, user.img, user.email, user.pass]);
        return result;
    } catch (error){
        console.error('Error en addUser: ', error);
        throw error;
    }
};

async function editUser(idUser, field, data) {
    try{
        const query = `UPDATE users SET \`${field}\` = ? WHERE id = ?`;
        const [result] = await db.execute(query, [data, idUser]);
        return result;
    } catch (error){
        console.error('Error en editUser: ', error);
        throw error;
    }
};

// eliminar usuario
async function deleteUser(idUser) {
    try{
        const [result] = await db.execute(`DELETE FROM users WHERE id = ?`, [idUser]);
        return result;
    } catch (error){
        console.error('Error en deleteUser: ', error);
        throw error;
    }
};


// agregar medalla a un usuario
async function addMedal(field) {
    try{
        const [result] = await db.execute(``);
        return result;
    } catch (error){
        console.error('Error en addMedal: ', error);
        throw error;
    }
};


// actualizar nivel
async function updateLvl(idUser) {
    try{
        const [result] = await db.execute(`UPDATE users SET lvl = lvl + 1 WHERE id = ?`, [idUser]);
        return result;
    } catch (error){
        console.error('Error en updateLvl: ', error);
        throw error;
    }
};

async function isAccepted(idUser) {
    try{
        const [rows] = await db.execute('SELECT accepted FROM users WHERE id = ?', [idUser]);
        return rows[0]?.accepted;
    } catch (error){
        console.error('Error en updateLvl: ', error);
        throw error;
    }
};

// obtener lista de usuarios
async function getUsers() {
    try{
        const [result] = await db.execute(`SELECT * FROM users`);
        return result;
    } catch (error){
        console.error('Error en getUsers: ', error);
        throw error;
    }
};


async function getUserWith(field,idUser) {
    try{
        const query = `SELECT \`${field}\` FROM users WHERE id = ?`;
        const [result] = await db.execute(query, [idUser]);
        return result;
    } catch (error){
        console.error('Error en getUsersWith: ', error);
        throw error;
    }
};

async function getUsersWith(field) {
    try{
        const query = `SELECT \`${field}\` FROM users`;
        const [result] = await db.execute(query);
        return result;
    } catch (error){
        console.error('Error en getUsersWith: ', error);
        throw error;
    }
};




// obtener lista de usuarios
async function getUser(idUser) {
    try{
        const [result] = await db.execute(`SELECT * FROM users WHERE id = ?`, [idUser]);
        return result[0];
    } catch (error){
        console.error('Error en getUser: ', error);
        throw error;
    }
};


// banear cuenta
/*async function banUser(field) {
    try{
        const [result] = await db.execute(``);
        return result;
    } catch (error){
        console.error('Error en ');
        throw error;
    }
}
*/

// advertir usuario (cambiar su warning)
async function warnUser(idUser, data) {
    try{
        const [result] = await db.execute(`UPDATE users SET warning = ? WHERE id = ?`, [data, idUser]);
        return result;
    } catch (error){
        console.error('Error en warnUser: ', error);
        throw error;
    }
};


module.exports = {
    addUser,
    editUser,
    deleteUser,
    addMedal,
    updateLvl,
    getUsers,
    getUser,
    getUserWith,
    getUsersWith,
    warnUser,
    isAccepted
}