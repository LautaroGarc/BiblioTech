const { getUsers, getUser, editUser, deleteUser: deleteUserModel, warnUser: warnUserModel } = require('../models/users');
const db = require('../../../database/database');

// Obtener usuarios pendientes de aprobación
async function getPendingUsers(req, res) {
    try {
        const users = await getUsers();
        const pendingUsers = users.filter(u => !u.accepted && u.type !== 'admin');
        
        // Remover contraseñas
        const safeUsers = pendingUsers.map(u => {
            const { pass, ...user } = u;
            return user;
        });
        
        res.json({
            success: true,
            count: safeUsers.length,
            data: safeUsers
        });
    } catch (error) {
        console.error('[GET PENDING USERS ERROR]', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios pendientes'
        });
    }
}

// Aprobar usuario
async function approveUser(req, res) {
    try {
        const userId = req.params.id;
        
        const user = await getUser(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        if (user.accepted) {
            return res.status(400).json({
                success: false,
                message: 'El usuario ya está aprobado'
            });
        }
        
        await editUser(userId, 'accepted', true);
        
        res.json({
            success: true,
            message: 'Usuario aprobado exitosamente'
        });
    } catch (error) {
        console.error('[APPROVE USER ERROR]', error);
        res.status(500).json({
            success: false,
            message: 'Error al aprobar usuario'
        });
    }
}

// Rechazar usuario (eliminarlo)
async function rejectUser(req, res) {
    try {
        const userId = req.params.id;
        
        const user = await getUser(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        if (user.type === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No se puede rechazar un administrador'
            });
        }
        
        await deleteUserModel(userId);
        
        res.json({
            success: true,
            message: 'Usuario rechazado y eliminado'
        });
    } catch (error) {
        console.error('[REJECT USER ERROR]', error);
        res.status(500).json({
            success: false,
            message: 'Error al rechazar usuario'
        });
    }
}

// Obtener todos los usuarios
async function getAllUsers(req, res) {
    try {
        const users = await getUsers();
        
        const safeUsers = users.map(u => {
            const { pass, ...user } = u;
            return user;
        });
        
        res.json({
            success: true,
            count: safeUsers.length,
            data: safeUsers
        });
    } catch (error) {
        console.error('[GET ALL USERS ERROR]', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios'
        });
    }
}

// Advertir usuario
async function warnUser(req, res) {
    try {
        const userId = req.params.id;
        const { warningLevel, reason } = req.body;
        
        const user = await getUser(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        if (user.type === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No se puede advertir a un administrador'
            });
        }
        
        const newWarningLevel = warningLevel !== undefined ? warningLevel : user.warning + 1;
        
        await warnUserModel(userId, newWarningLevel);
        
        // TODO: Enviar notificación al usuario
        
        res.json({
            success: true,
            message: 'Usuario advertido exitosamente',
            data: {
                userId,
                warningLevel: newWarningLevel,
                reason: reason || 'No especificado'
            }
        });
    } catch (error) {
        console.error('[WARN USER ERROR]', error);
        res.status(500).json({
            success: false,
            message: 'Error al advertir usuario'
        });
    }
}

// Eliminar usuario
async function deleteUser(req, res) {
    try {
        const userId = req.params.id;
        
        const user = await getUser(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        if (user.type === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No se puede eliminar a un administrador'
            });
        }
        
        await deleteUserModel(userId);
        
        res.json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });
    } catch (error) {
        console.error('[DELETE USER ERROR]', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar usuario'
        });
    }
}

// Generar reportes estadísticos
async function generateReports(req, res) {
    try {
        const { type, startDate, endDate } = req.query;
        
        let report = {};
        
        switch (type) {
            case 'users':
                report = await generateUserReport(startDate, endDate);
                break;
            case 'loans':
                report = await generateLoanReport(startDate, endDate);
                break;
            case 'books':
                report = await generateBookReport();
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Tipo de reporte no válido. Use: users, loans, books'
                });
        }
        
        res.json({
            success: true,
            type,
            period: { startDate, endDate },
            data: report
        });
    } catch (error) {
        console.error('[GENERATE REPORTS ERROR]', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar reporte'
        });
    }
}

// Obtener estadísticas generales
async function getStatistics(req, res) {
    try {
        const [userStats] = await db.execute(`
            SELECT 
                COUNT(*) as totalUsers,
                SUM(CASE WHEN accepted = TRUE THEN 1 ELSE 0 END) as acceptedUsers,
                SUM(CASE WHEN accepted = FALSE THEN 1 ELSE 0 END) as pendingUsers,
                SUM(CASE WHEN type = 'admin' THEN 1 ELSE 0 END) as adminUsers
            FROM users
        `);
        
        const [bookStats] = await db.execute(`
            SELECT 
                COUNT(*) as totalBooks,
                SUM(quant) as totalCopies,
                SUM(timesReaded) as totalReads,
                AVG(review) as avgReview
            FROM books
        `);
        
        const [loanStats] = await db.execute(`
            SELECT 
                (SELECT COUNT(*) FROM bookLoans WHERE state IN ('espera', 'en prestamo', 'atrasado')) +
                (SELECT COUNT(*) FROM suppLoans WHERE state IN ('espera', 'en prestamo', 'atrasado')) as activeLoans,
                (SELECT COUNT(*) FROM bookLoans WHERE state = 'atrasado') +
                (SELECT COUNT(*) FROM suppLoans WHERE state = 'atrasado') as overdueLoans,
                (SELECT COUNT(*) FROM bookLoans WHERE state = 'devuelto') +
                (SELECT COUNT(*) FROM suppLoans WHERE state = 'devuelto') as completedLoans
        `);
        
        const [supplyStats] = await db.execute(`
            SELECT 
                COUNT(*) as totalSupplies,
                SUM(total_quantity) as totalSupplyCopies,
                SUM(borrowed) as borrowedSupplies
            FROM supplies
        `);
        
        res.json({
            success: true,
            data: {
                users: userStats[0],
                books: bookStats[0],
                supplies: supplyStats[0],
                loans: loanStats[0]
            }
        });
    } catch (error) {
        console.error('[GET STATISTICS ERROR]', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas'
        });
    }
}

// Helpers para reportes
async function generateUserReport(startDate, endDate) {
    const dateFilter = startDate && endDate 
        ? `WHERE created_at BETWEEN '${startDate}' AND '${endDate}'`
        : '';
    
    const [result] = await db.execute(`
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as newUsers
        FROM users
        ${dateFilter}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
    `);
    
    return result;
}

async function generateLoanReport(startDate, endDate) {
    const dateFilter = startDate && endDate 
        ? `WHERE dateIn BETWEEN '${startDate}' AND '${endDate}'`
        : '';
    
    const [bookLoans] = await db.execute(`
        SELECT 
            DATE(dateIn) as date,
            COUNT(*) as loans,
            'book' as type
        FROM bookLoans
        ${dateFilter}
        GROUP BY DATE(dateIn)
    `);
    
    const [suppLoans] = await db.execute(`
        SELECT 
            DATE(dateIn) as date,
            COUNT(*) as loans,
            'supply' as type
        FROM suppLoans
        ${dateFilter}
        GROUP BY DATE(dateIn)
    `);
    
    return {
        books: bookLoans,
        supplies: suppLoans
    };
}

async function generateBookReport() {
    const [result] = await db.execute(`
        SELECT 
            b.id,
            b.name,
            b.author,
            b.gender,
            b.timesReaded,
            COUNT(bl.id) as totalLoans,
            SUM(CASE WHEN bl.state = 'atrasado' THEN 1 ELSE 0 END) as overdueCount
        FROM books b
        LEFT JOIN bookLoans bl ON b.id = bl.bookId
        GROUP BY b.id
        ORDER BY b.timesReaded DESC
        LIMIT 50
    `);
    
    return result;
}

module.exports = {
    getPendingUsers,
    approveUser,
    rejectUser,
    getAllUsers,
    warnUser,
    deleteUser,
    generateReports,
    getStatistics
};