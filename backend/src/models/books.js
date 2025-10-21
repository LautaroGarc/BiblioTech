const db = require('../../../database/database.js')

//obtener libro x
async function getBook(idBook) {
    try {
        const [rows] = await db.execute('SELECT * FROM books WHERE id = ?', [idBook]);
        return rows[0];
    } catch (error) {
        console.error('error en getBook:', error);
        throw error;
    }
}

//obtener todos los libros
async function getBooks() {
    try {
        const [rows] = await db.execute('SELECT * FROM books ORDER BY id');
        return rows;
    } catch (error) {
        console.error('error en getBook:', error);
        throw error;
    }
}

//obtener x dato de x libro
async function getBookData(idBook, data) {
    try {
        const [rows] = await db.execute('SELECT ? FROM books WHERE id = ?', [data, idBook]);
        return rows[0];
    } catch (error) {
        console.error('error en getBookData:', error);
        throw error;
    }
}

//obtener x dato de todos los libros
async function getBooksData(data) {
    try {
        const [rows] = await db.execute('SELECT ? FROM books ORDER BY id', [data]);
        return rows;
    } catch (error) {
        console.error('error en getBookData:', error);
        throw error;
    }
}

//obtener libros con x dato
async function getBooksWith(data) {

}

//editar libro
async function editBook(idBook, data) {

}

//crear libro
async function createBook(book) {
    //book = [all]

}

module.exports = {
    getBook,
    getBooks,
    getBookData,
    getBooksData,
    getBooksWith,
    editBook,
    createBook
}