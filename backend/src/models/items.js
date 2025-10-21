const db = require('../../../database/database.js')

//obtener todos los items
async function getItems() {
    try {
        const [rows] = await db.execute(`SELECT * FROM items ORDER BY id`);
        return rows;
    } catch (error) {
        console.error('error en getItems:', error);
        throw error;
    }
}

//obtener x item
async function getItem(itemId) {
    try {
        const [rows] = await db.execute(`SELECT * FROM items WHERE id = ?`, [itemId]);
        return rows[0];
    } catch (error) {
        console.error('error en getItem:', error);
        throw error;
    }
}

//obtener x tipo de items
async function getTypeItems(type) {
    try {
        const [rows] = await db.execute(`SELECT * FROM items WHERE name = ?`, [type]);
        return rows;
    } catch (error) {
        console.error('error en getItem:', error);
        throw error;
    }
}

//obtener numero de items
async function countItems() {
    try {
        const [rows] = await db.execute(`SELECT COUNT(*) as total FROM items`);
        return rows[0].total;
    } catch (error) {
        console.error('error en countItems:', error);
        throw error;
    }
}

//obtener numero de x items
async function countTypeItems(type) {
    try {
        const [rows] = await db.execute(`SELECT COUNT(*) as total FROM items WHERE name = ?`, [type]);
        return rows[0].total;
    } catch (error) {
        console.error('error en countTypeItems:', error);
        throw error;
    }
}

//obtener x dato de x item
async function getItemWith(itemId, field) {
    try {
        const [rows] = await db.execute(`SELECT \`${field}\` FROM items WHERE name = ?`, [itemId]);
        return rows[0];
    } catch (error) {
        console.error('error en countTypeItems:', error);
        throw error;
    }
}

//editar x item
async function editItem(itemId, field, data) {
    try {
        const [result] = await db.execute(`UPDATE items SET \`${field}\` = ? WHERE id = ?`, [data, itemId])
        return result;
    } catch (error) {
        console.error('error en editItem:', error);
        throw error;
    }
}

//crear item
async function createItem(item) {
    //item = {all}

    sql = ``
    
    try {
        const requiredFields = ['name', 'img', 'borrowed'];
        const missingFields = requiredFields.filter(field => !(field in book));
        if (missingFields.length > 0) {
            throw new Error(`Campos faltantes: ${missingFields.join(', ')}`);
        }

        const sql = `INSERT INTO items (name, img, borrowed) VALUES (?, ?, ?)`;
        const values = [item.name, item.img, item.borrowed]

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

//delete item
async function deleteItem(itemId) {

};

module.exports = {
    getItems,
    getItem,
    getTypeItems,
    countItems,
    countTypeItems,
    getItemWith,
    editItem,
    createItem
}