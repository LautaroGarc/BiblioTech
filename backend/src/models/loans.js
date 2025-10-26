const db = require('../../../database/database.js')

//obtener todos los prestamos
async function getLoans(type = null) {
    try{ 
        const query1 = `SELECT * FROM itemLoans`;
        const [result1] = await db.execute(query1);
        const query2 = `SELECT * FROM bookLoans`;
        const [result2] = await db.execute(query2);
        const result = result1.concat(resutl2)
        if (type === 'itemLoans'){
            return result1;
        } else if (type === 'bookLoans'){
            return result2;
        }
        return result;

    } catch (error){
        console.error('Error en getLoans: ', error);
        throw error;
    }



};

//obtener x prestamo (item - libro)
async function getLoan(id, type) {
    try{
        const query = `SELECT * FROM \`${type}\` WHERE id = ?`;
        
        const [result] = await db.execute(query, [id]);
        return result;
        
    } catch (error){
        console.error('Error en getLoan: ', error);
        throw error;
    }

};

//obtener prestamo (item - libro) con x dato
async function getLoanWith(id, type, field, data) {
    try{
        const query = `SELECT \`${field}\` FROM \`${type}\` WHERE \`${field}\` = ? AND id = ?`;
        const [result] = await db.execute(query, [data, id]);
        return result;
    } catch (error){
        console.error('Error en getLoanWith: ', error);
        throw error;
    }

};

async function getLoansWith(type = null, field, data) {
    try{
        const query = `SELECT * FROM \`${type}\` WHERE \`${field}\` = ?`;
        const [result] = await db.execute(query, [data]);
        return result;
    } catch (error){
        console.error('Error en getLoansWith: ', error);
        throw error;
    }

};

//editar prestamos
async function editLoan(id, type, field, data) {
    try{
        const query = `UPDATE \`${type}\` SET \`${field}\` = ? WHERE id = ?`;
        const [result] = await db.execute(query, [data, id]);
        return result;
    } catch (error){
        console.error('Error en editLoan: ', error);
        throw error;
    }

};

//crear prestamos
async function createLoan(type ,loan) {
    try{
        const query1 = `INSERT INTO \`${type}\` (userId, bookId, state, dateIn, dateOut) VALUES (?, ?, ?, ?, ?)`;
        const [result1] = await db.execute(query1, [loan.userId, loan.bookId, loan.state, loan.dateIn, loan.dateOut]);
        const query2 = `INSERT INTO \`${type}\` (userId, bookId, state, dateIn, dateOut) VALUES (?, ?, ?, ?, ?)`;
        const [result2] = await db.execute(query2, [loan.userId, loan.itemId, loan.state, loan.dateIn, loan.dateOut]);
        
        if (type === 'bookLoans'){
            return result1;
        } else if (type === 'itemLoans'){
            return result2;
        }
    } catch (error){
        console.error('Error en createLoan: ', error);
        throw error;
    }

};

//delete loan
async function deleteLoan(loanId, type) {
    try{
        const query = `DELETE FROM \`${type}\` WHERE id = ?`;
        const [result] = await db.execute(query, [loanId]);
        return result;
    } catch (error){
        console.error('Error en deleteLoan: ', error);
        throw error;
    }

};

module.exports = {
    getLoans,
    getLoan,
    getLoanWith,
    getLoansWith,
    deleteLoan,
    editLoan,
    createLoan
}
