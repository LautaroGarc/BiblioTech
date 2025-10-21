const db = require('../../../database/database.js')

//obtener todos los prestamos
async function getLoans(type = null) {

};

//obtener x prestamo (item - libro)
async function getLoan(id, type) {

};

//obtener prestamo (item - libro) con x dato
async function getLoan(id, type, field, data) {

};

//editar prestamos
async function editLoan(id, type, field, data) {

};

//crear prestamos
async function createLoan() {

};

module.exports = {
    getLoans,
    getLoan,
    editLoan,
    createLoan
}
