const db = require('../../../database/database.js')

//obtener todos los prestamos
async function getLoans(type = null) {
    try{


        const query = "SELECT * FROM "+ type + "loans";
        
        const [result] = await db.execute(query);
        return result;

    } catch (error){
        console.error('Error en getLoans: ', error);
        throw error;
    }



};

//obtener x prestamo (item - libro)
async function getLoan(id, type) {
    try{
        const query = "SELECT * FROM "+ type + "loans WHERE id = ?";
        
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
        const query = "SELECT "+ field +" FROM "+ type +"loans WHERE "+ field +" = ? AND id = ?";
        const [result] = await db.execute(query, [data, id]);
        return result;
    } catch (error){
        console.error('Error en getLoanWith: ', error);
        throw error;
    }

};

async function getLoansWith(type, field, data) {
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
        const query = "UPDATE "+ type +"loans SET "+ field +" = ? WHERE id = ?";
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
        const query = "INSERT INTO "+ type +"loans (userId, "+ type +"Id, state, dateIn, dateOut) VALUES (?, ?, ?, ?, ?)";
        const [result] = await db.execute(query, [loan.userId, loan.id, loan.state, loan.dateIn, loan.dateOut]);
        return result;
    } catch (error){
        console.error('Error en createLoan: ', error);
        throw error;
    }

};

//delete loan
async function deleteLoan(loanId, type) {
    try{
        const query = "DELETE FROM "+ type +"loans WHERE id = ?";
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
