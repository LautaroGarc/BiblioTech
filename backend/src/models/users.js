const db = require('../../../database/database.js')

// agregar cuenta
async function addAccount(account) {
    //account = {all}
    try{
        const [result] = await db.execute(`INSERT INTO users (name, lastName, img, email, pass, lvl, nReads, type, warning) VALUES (?,?,?,?,?,?,?,?,?)`, [account.name, account.lastName, account.img, account.email, account.pass, account.lvl, account.nReads, account.type, account.warning]);
        return result;
    } catch (error){
        console.error('Error en addAccount');
        throw error;
    }
}


// eliminar cuenta
async function deleteAccount(field) {
    try{
        const [result] = await db.execute(`DELETE FROM users WHERE id = ?`, [field]);
        return result;
    } catch (error){
        console.error('Error en deleteAccount');
        throw error;
    }
}


// agregar medalla a un usuario
async function addMedal(field) {
    try{
        const [result] = await db.execute(``);
        return result;
    } catch (error){
        console.error('Error en ');
        throw error;
    }
}


// actualizar nivel
async function updateLvl(idUser) {
    try{
        const [result] = await db.execute(`UPDATE users SET lvl = lvl + 1 WHERE id = ?`, [idUser]);
        return result;
    } catch (error){
        console.error('Error en updateLvl');
        throw error;
    }
}


// obtener lista de usuarios
async function getUsers() {
    try{
        const [result] = await db.execute(`SELECT * FROM users`);
        return result;
    } catch (error){
        console.error('Error en getUsers');
        throw error;
    }
}


// obtener lista de usuarios
async function getUser(idUser) {
    try{
        const [result] = await db.execute(`SELECT * FROM users WHERE id = ?`, [idUser]);
        return result;
    } catch (error){
        console.error('Error en getUser');
        throw error;
    }
}


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
        console.error('Error en warnUser');
        throw error;
    }
}


module.exports = {
    addAccount,
    deleteAccount,
    addMedal,
    updateLvl,
    getUsers,
    getUser,
    warnUser
}