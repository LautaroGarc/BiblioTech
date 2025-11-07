const db = require('../config/database.js')

//obtener todos los supplies
async function getItems() {
    try {
        const [rows] = await db.execute(`SELECT * FROM supplies ORDER BY id`);
        return rows;
    } catch (error) {
        console.error('error en getItems:', error);
        throw error;
    }
}

//obtener x supply
async function getItem(itemId) {
    try {
        const [rows] = await db.execute(`SELECT * FROM supplies WHERE id = ?`, [itemId]);
        return rows[0];
    } catch (error) {
        console.error('error en getItem:', error);
        throw error;
    }
}

//obtener x tipo de supplies
async function getTypeItems(type) {
    try {
        const [rows] = await db.execute(`SELECT * FROM supplies WHERE name = ?`, [type]);
        return rows;
    } catch (error) {
        console.error('error en getTypeItems:', error);
        throw error;
    }
}

//obtener numero de supplies
async function countItems() {
    try {
        const [rows] = await db.execute(`SELECT COUNT(*) as total FROM supplies`);
        return rows[0].total;
    } catch (error) {
        console.error('error en countItems:', error);
        throw error;
    }
}

//obtener numero de x supplies
async function countTypeItems(type) {
    try {
        const [rows] = await db.execute(`SELECT COUNT(*) as total FROM supplies WHERE name = ?`, [type]);
        return rows[0].total;
    } catch (error) {
        console.error('error en countTypeItems:', error);
        throw error;
    }
}

//obtener x dato de x supply
async function getItemWith(itemId, field) {
    try {
        const [rows] = await db.execute(`SELECT \`${field}\` FROM supplies WHERE id = ?`, [itemId]);
        return rows[0];
    } catch (error) {
        console.error('error en getItemWith:', error);
        throw error;
    }
}

//editar x supply
async function editItem(itemId, field, data) {
    try {
        const [result] = await db.execute(`UPDATE supplies SET \`${field}\` = ? WHERE id = ?`, [data, itemId])
        return result;
    } catch (error) {
        console.error('error en editItem:', error);
        throw error;
    }
}

//crear supply
async function createItem(item) {
    try {
        const requiredFields = ['name', 'img', 'borrowed'];
        const missingFields = requiredFields.filter(field => !(field in item));
        
        if (missingFields.length > 0) {
            throw new Error(`Campos faltantes: ${missingFields.join(', ')}`);
        }

        const sql = `INSERT INTO supplies (name, img, barCode, borrowed, total_quantity) VALUES (?, ?, ?, ?, ?)`;
        const values = [
            item.name, 
            item.img, 
            item.barCode || null,
            item.borrowed || 0,
            item.total_quantity || 1
        ];

        const [result] = await db.execute(sql, values);
        return {
            result, 
            ...item
        };
    } catch (error) {
        console.error('error en createItem:', error);
        throw error;
    } 
}

//delete supply
async function deleteItem(itemId) {
    try {
        const [result] = await db.execute(`DELETE FROM supplies WHERE id = ?`, [itemId]);
        return result;
    } catch (error) {
        console.error('error en deleteItem:', error);
        throw error;
    }
};

async function getCarrouselSupps() {
    try {
        const [supplies] = await db.execute(
            `SELECT id, name, img, barCode, total_quantity, borrowed 
             FROM supplies 
             WHERE (total_quantity - borrowed) > 0
             LIMIT 10`
        );
        return supplies;
    } catch (error) {
        console.error('error en getCarrouselSupps:', error);
        throw error;
    }
}


module.exports = {
    getItems,
    getItem,
    getTypeItems,
    countItems,
    countTypeItems,
    getItemWith,
    editItem,
    createItem,
    deleteItem,
    getCarrouselSupps
}