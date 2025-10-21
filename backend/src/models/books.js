const db = require('../../../database/database.js')

//obtener libro x
async function getBook(idBook) {
    try {
        const [rows] = await db.execute(`SELECT * FROM books WHERE id = ?`, [idBook]);
        return rows[0];
    } catch (error) {
        console.error('error en getBook:', error);
        throw error;
    }
}

//obtener todos los libros
async function getBooks() {
    try {
        const [rows] = await db.execute(`SELECT * FROM books ORDER BY id`);
        return rows;
    } catch (error) {
        console.error('error en getBook:', error);
        throw error;
    }
}

//obtener x dato de x libro
async function getBookData(idBook, field) {
    try {
        const [rows] = await db.execute(`SELECT \`${field}\` FROM books WHERE id = ?`, [field, idBook]);
        return rows[0];
    } catch (error) {
        console.error('error en getBookData:', error);
        throw error;
    }
}

//obtener x dato de todos los libros
async function getBooksData(field) {
    try {
        const [rows] = await db.execute(`SELECT \`${field}\` FROM books ORDER BY id`);
        return rows;
    } catch (error) {
        console.error('error en getBookData:', error);
        throw error;
    }
}

//obtener libros con x dato
async function getBooksWith(field, data) {
    try {
        const [rows] = await db.execute(`SELECT * FROM books WHERE \`${field}\` = ?`, [data]);
        return rows;
    } catch (error) {
        console.error('error en getBooksWith:', error);
        throw error;
    }
}

//obtener x libro con x dato
async function getBookWith(bookId, field, data) {
    try {
        const [rows] = await db.execute(`SELECT * FROM books WHERE \`${field}\` = ? AND id = ?`, [data, bookId]);
        return rows[0];
    } catch (error) {
        console.error('error en getBookWith:', error);
        throw error;
    }
}

//editar libro
async function editBook(idBook, field, data) {
    try {
        const [result] = await db.execute(`UPDATE books SET \`${field}\` = ? WHERE id = ?`, [data, idBook])
        return result;
    } catch (error) {
        console.error('error en editBook:', error);
        throw error;
    }
}

//crear libro
async function createBook(book) {
    //book = {all}

    sql = `INSERT INTO books (name, img, timesReaded, borrowed, sinopsis, author, gender, review, editorial, barCode, subGender, ageRangeMin, ageRangeMax, readLevel, rhythm, tone, narrativeStyle, length, type, theme, final, similar) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    try {
        const requiredFields = [
            'name', 'img', 'timesReaded', 'borrowed', 'sinopsis', 
            'author', 'gender', 'review', 'editorial', 'barCode',
            'subGender', 'ageRangeMin', 'ageRangeMax', 'readLevel',
            'rhythm', 'tone', 'narrativeStyle', 'length', 'type',
            'theme', 'final', 'similar'
        ];
        const missingFields = requiredFields.filter(field => !(field in book));
        if (missingFields.length > 0) {
            throw new Error(`Campos faltantes: ${missingFields.join(', ')}`);
        }

        const sql = `
            INSERT INTO books (
                name, img, timesReaded, borrowed, sinopsis, author, gender, 
                review, editorial, barCode, subGender, ageRangeMin, ageRangeMax, 
                readLevel, rhythm, tone, narrativeStyle, length, type, theme, 
                final, similar
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            book.name,
            book.img,
            book.timesReaded,
            book.borrowed,
            book.sinopsis,
            book.author,
            book.gender,
            book.review,
            book.editorial,
            book.barCode,
            book.subGender,
            book.ageRangeMin,
            book.ageRangeMax,
            book.readLevel,
            book.rhythm,
            book.tone,
            book.narrativeStyle,
            book.length,
            book.type,
            book.theme,
            book.final,
            JSON.stringify(book.similar) 
        ];

        const [result] = await db.execute(sql, values)
        return {...book};
    } catch (error) {
        console.error('error en createBook:', error);
        throw error;
    }
}

module.exports = {
    getBook,
    getBooks,
    getBookData,
    getBooksData,
    getBookWith,
    getBooksWith,
    editBook,
    createBook
}