const db = require('../config/database');

class LoanModel {
    // Crear préstamo de libro
    static async createBookLoan(loanData) {
        const { userId, bookId, dateOut } = loanData;
        const query = `
            INSERT INTO bookLoans (userId, bookId, dateOut, state) 
            VALUES (?, ?, ?, 'espera')
        `;
        const [result] = await db.execute(query, [userId, bookId, dateOut]);
        return result;
    }

    // Crear préstamo de útil
    static async createSupplyLoan(loanData) {
        const { userId, itemId, dateOut } = loanData;
        const query = `
            INSERT INTO suppLoans (userId, itemId, dateOut, state) 
            VALUES (?, ?, ?, 'espera')
        `;
        const [result] = await db.execute(query, [userId, itemId, dateOut]);
        return result;
    }

    // Obtener préstamos activos de un usuario
    static async getActiveLoansByUser(userId) {
        const query = `
            SELECT 
                'book' as type,
                bl.id,
                bl.userId,
                bl.bookId as itemId,
                b.name as itemName,
                b.img,
                bl.state,
                bl.dateIn,
                bl.dateOut,
                bl.returned_at
            FROM bookLoans bl
            JOIN books b ON bl.bookId = b.id
            WHERE bl.userId = ? AND bl.state IN ('espera', 'en prestamo', 'atrasado')
            
            UNION ALL
            
            SELECT 
                'supply' as type,
                sl.id,
                sl.userId,
                sl.itemId,
                s.name as itemName,
                s.img,
                sl.state,
                sl.dateIn,
                sl.dateOut,
                sl.returned_at
            FROM suppLoans sl
            JOIN supplies s ON sl.itemId = s.id
            WHERE sl.userId = ? AND sl.state IN ('espera', 'en prestamo', 'atrasado')
            ORDER BY dateIn DESC
        `;
        const [rows] = await db.execute(query, [userId, userId]);
        return rows;
    }

    // Devolver item
    static async returnLoan(loanId, type) {
        const table = type === 'book' ? 'bookLoans' : 'suppLoans';
        const query = `
            UPDATE ${table} 
            SET state = 'devuelto', returned_at = CURRENT_TIMESTAMP 
            WHERE id = ? AND state != 'devuelto'
        `;
        const [result] = await db.execute(query, [loanId]);
        return result;
    }

    // Verificar y actualizar préstamos atrasados
    static async checkAndUpdateOverdueLoans() {
        const bookQuery = `
            UPDATE bookLoans 
            SET state = 'atrasado' 
            WHERE state = 'en prestamo' 
            AND dateOut < CURDATE() 
            AND returned_at IS NULL
        `;
        
        const supplyQuery = `
            UPDATE suppLoans 
            SET state = 'atrasado' 
            WHERE state = 'en prestamo' 
            AND dateOut < CURDATE() 
            AND returned_at IS NULL
        `;

        await db.execute(bookQuery);
        await db.execute(supplyQuery);
        
        // Obtener conteo de actualizados
        const [bookResult] = await db.execute('SELECT ROW_COUNT() as updated');
        const [supplyResult] = await db.execute('SELECT ROW_COUNT() as updated');
        
        return {
            bookLoansUpdated: bookResult[0].updated,
            supplyLoansUpdated: supplyResult[0].updated
        };
    }

    // Buscar item por código de barras
    static async findItemByBarcode(barcode) {
        // Buscar en libros
        const bookQuery = `
            SELECT 
                'book' as type,
                id,
                name,
                img,
                barCode,
                quant as quantity,
                (quant - (SELECT COUNT(*) FROM bookLoans WHERE bookId = books.id AND state IN ('espera', 'en prestamo', 'atrasado'))) as available
            FROM books 
            WHERE barCode = ?
        `;
        
        // Buscar en útiles
        const supplyQuery = `
            SELECT 
                'supply' as type,
                id,
                name,
                img,
                barCode,
                (total_quantity - borrowed) as available,
                total_quantity as quantity
            FROM supplies 
            WHERE barCode = ?
        `;

        const [books] = await db.execute(bookQuery, [barcode]);
        const [supplies] = await db.execute(supplyQuery, [barcode]);

        if (books.length > 0) return books[0];
        if (supplies.length > 0) return supplies[0];
        
        return null;
    }

    // Historial completo de préstamos
    static async getLoanHistory(userId = null, itemId = null, type = null) {
        let whereClause = '';
        const params = [];

        if (userId) {
            whereClause += ' WHERE bl.userId = ? OR sl.userId = ?';
            params.push(userId, userId);
        }

        const query = `
            SELECT 
                'book' as type,
                bl.id,
                bl.userId,
                u.name as userName,
                u.lastName as userLastName,
                bl.bookId as itemId,
                b.name as itemName,
                bl.state,
                bl.dateIn,
                bl.dateOut,
                bl.returned_at
            FROM bookLoans bl
            JOIN users u ON bl.userId = u.id
            JOIN books b ON bl.bookId = b.id
            ${userId ? 'WHERE bl.userId = ?' : ''}
            
            UNION ALL
            
            SELECT 
                'supply' as type,
                sl.id,
                sl.userId,
                u.name as userName,
                u.lastName as userLastName,
                sl.itemId as itemId,
                s.name as itemName,
                sl.state,
                sl.dateIn,
                sl.dateOut,
                sl.returned_at
            FROM suppLoans sl
            JOIN users u ON sl.userId = u.id
            JOIN supplies s ON sl.itemId = s.id
            ${userId ? 'WHERE sl.userId = ?' : ''}
            ORDER BY dateIn DESC
            LIMIT 100
        `;
        
        const [rows] = await db.execute(query, params);
        return rows;
    }

    // Obtener todos los préstamos (para admin)
    static async getAllLoans(filters = {}) {
        const { state, type, limit = 50, offset = 0 } = filters;
        let whereClause = '';
        const params = [];

        if (state) {
            whereClause += ` AND bl.state = ? AND sl.state = ?`;
            params.push(state, state);
        }

        const query = `
            SELECT 
                'book' as type,
                bl.id,
                bl.userId,
                u.name as userName,
                u.lastName as userLastName,
                u.email as userEmail,
                bl.bookId as itemId,
                b.name as itemName,
                bl.state,
                bl.dateIn,
                bl.dateOut,
                bl.returned_at
            FROM bookLoans bl
            JOIN users u ON bl.userId = u.id
            JOIN books b ON bl.bookId = b.id
            WHERE 1=1 ${whereClause}
            
            UNION ALL
            
            SELECT 
                'supply' as type,
                sl.id,
                sl.userId,
                u.name as userName,
                u.lastName as userLastName,
                u.email as userEmail,
                sl.itemId as itemId,
                s.name as itemName,
                sl.state,
                sl.dateIn,
                sl.dateOut,
                sl.returned_at
            FROM suppLoans sl
            JOIN users u ON sl.userId = u.id
            JOIN supplies s ON sl.itemId = s.id
            WHERE 1=1 ${whereClause}
            ORDER BY dateIn DESC
            LIMIT ? OFFSET ?
        `;

        params.push(parseInt(limit), parseInt(offset));
        const [rows] = await db.execute(query, params);
        return rows;
    }

    // Obtener préstamos atrasados
    static async getOverdueLoans() {
        const query = `
            SELECT 
                'book' as type,
                bl.id,
                bl.userId,
                u.name as userName,
                u.lastName as userLastName,
                u.email as userEmail,
                bl.bookId as itemId,
                b.name as itemName,
                bl.dateIn,
                bl.dateOut,
                DATEDIFF(CURDATE(), bl.dateOut) as daysOverdue
            FROM bookLoans bl
            JOIN users u ON bl.userId = u.id
            JOIN books b ON bl.bookId = b.id
            WHERE bl.state = 'atrasado'
            
            UNION ALL
            
            SELECT 
                'supply' as type,
                sl.id,
                sl.userId,
                u.name as userName,
                u.lastName as userLastName,
                u.email as userEmail,
                sl.itemId as itemId,
                s.name as itemName,
                sl.dateIn,
                sl.dateOut,
                DATEDIFF(CURDATE(), sl.dateOut) as daysOverdue
            FROM suppLoans sl
            JOIN users u ON sl.userId = u.id
            JOIN supplies s ON sl.itemId = s.id
            WHERE sl.state = 'atrasado'
            ORDER BY daysOverdue DESC
        `;

        const [rows] = await db.execute(query);
        return rows;
    }
}

module.exports = LoanModel;