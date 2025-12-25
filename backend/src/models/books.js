const db = require('../../../database/database.js')

class BookModel {
    //obtener libro x
    static async getBook(bookId) {
        try {
            const [rows] = await db.execute(`SELECT * FROM books WHERE id = ?`, [bookId]);
            return rows[0];
        } catch (error) {
            console.error('error en getBook:', error);
            throw error;
        }
    }

    static async getCarrouselBooks() {
        try {
            const [books] = await db.execute(
                `SELECT id, name, img, review, quant, likes, author, gender 
                 FROM books 
                 WHERE borrowed = False 
                 LIMIT 10`
            );
            return books;
        } catch (error) {
            console.error('error en getCarrouselBooks:', error);
            throw error;
        }
    }

    //obtener todos los libros
    static async getBooks() {
        try {
            const [rows] = await db.execute(`SELECT * FROM books ORDER BY id`);
            return rows;
        } catch (error) {
            console.error('error en getBook:', error);
            throw error;
        }
    }

    static async getBookBarcode(barcode) {
        try {
            const [rows] = await db.execute('SELECT * FROM books WHERE barCode = ?', [barcode]);
            return rows[0];
        } catch(error) {
            console.error('error en geBook:', error);
            throw error;
        }
    }

    //obtener x dato de x libro
    static async getBookData(bookId, field) {
        try {
            const [rows] = await db.execute(`SELECT \`${field}\` FROM books WHERE id = ?`, [bookId]);
            return rows[0];
        } catch (error) {
            console.error('error en getBookData:', error);
            throw error;
        }
    }

    //obtener x dato de todos los libros
    static async getBooksData(field) {
        try {
            const [rows] = await db.execute(`SELECT \`${field}\` FROM books ORDER BY id`);
            return rows;
        } catch (error) {
            console.error('error en getBookData:', error);
            throw error;
        }
    }

    //obtener libros con x dato
    static async getBooksWith(field, data) {
        try {
            const [rows] = await db.execute(`SELECT * FROM books WHERE \`${field}\` = ?`, [data]);
            return rows;
        } catch (error) {
            console.error('error en getBooksWith:', error);
            throw error;
        }
    }

    //obtener x libro con x dato
    static async getBookWith(bookId, field, data) {
        try {
            const [rows] = await db.execute(`SELECT * FROM books WHERE \`${field}\` = ? AND id = ?`, [data, bookId]);
            return rows[0];
        } catch (error) {
            console.error('error en getBookWith:', error);
            throw error;
        }
    }

    //editar libro
    static async editBook(bookId, field, data) {
        try {
            const [result] = await db.execute(`UPDATE books SET \`${field}\` = ? WHERE id = ?`, [data, bookId])
            return result;
        } catch (error) {
            console.error('error en editBook:', error);
            throw error;
        }
    }

    //crear libro
    static async createBook(book) {
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

            const [result] = await db.execute(sql, values);
            return {
                result, 
                ...book
            };
        } catch (error) {
            console.error('error en createBook:', error);
            throw error;
        }
    }

    //delete book
    static async deleteBook(bookId) {
        try {
            const [result] = await db.execute(`DELETE FROM books WHERE id = ?`, [bookId]);
            return result;
        } catch (error) {
            console.error('error en deleteBook:', error);
            throw error;
        }
    }
}

module.exports = BookModel;