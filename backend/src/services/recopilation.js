// algoritmo de recopilacion de datos

const { getUser } = require('../models/users');
const { getBooks } = require('../models/books');
const db = require('../../../database/database'); // Assuming a database connection module

// funciones intermedias que interactuan con el PREFERENCES --> users

/**
 * Recopila preferencias del usuario desde la tabla users
 * @param {number} userId - ID del usuario
 * @returns {Object} Preferencias parseadas o null si no existen
 */
async function collectUserPreferences(userId) {
    const user = await getUser(userId);
    if (user && user.preferences) {
        return JSON.parse(user.preferences);
    }
    return null; // Indica que se necesita un formulario
}

/**
 * Recopila historial de libros leídos
 * @param {number} userId - ID del usuario
 * @returns {Array} Lista de IDs de libros leídos
 */
async function collectReadHistory(userId) {
    const user = await getUser(userId);
    if (user && user.readHistory) {
        return JSON.parse(user.readHistory);
    }
    return [];
}

/**
 * Recopila likes del usuario
 * @param {number} userId - ID del usuario
 * @returns {Array} Lista de IDs de libros liked
 */
async function collectUserLikes(userId) {
    const user = await getUser(userId);
    if (user && user.likes) {
        return JSON.parse(user.likes);
    }
    return [];
}

/**
 * Recopila interacciones (likes, views) desde la nueva tabla bookInteractions
 * @param {number} userId - ID del usuario
 * @returns {Array} Lista de objetos {bookId, type, timestamp}
 */
async function collectInteractions(userId) {
    const [rows] = await db.query('SELECT bookId, type, created_at FROM bookInteractions WHERE userId = ?', [userId]);
    return rows;
}

// formulario

/**
 * Verifica si el usuario tiene preferencias; si no, sugiere completar un formulario
 * @param {number} userId - ID del usuario
 * @returns {boolean} True si necesita formulario
 */
async function needsPreferenceForm(userId) {
    const prefs = await collectUserPreferences(userId);
    return !prefs || Object.keys(prefs).length === 0;
}

// libros leidos

/**
 * Obtiene detalles de libros leídos para análisis
 * @param {number} userId - ID del usuario
 * @returns {Array} Lista de objetos libro
 */
async function getReadBooksDetails(userId) {
    const readIds = await collectReadHistory(userId);
    const allBooks = await getBooks();
    return allBooks.filter(book => readIds.includes(book.id));
}

// busqueda

/**
 * Recopila búsquedas recientes (asumiendo un log futuro; por ahora, basado en interacciones)
 * @param {number} userId - ID del usuario
 * @returns {Array} Lista de géneros/autores buscados (simulado)
 */
async function collectSearchHistory(userId) {
    // TODO: Implementar tabla de búsquedas si es necesario
    const interactions = await collectInteractions(userId);
    const genres = new Set();
    const allBooks = await getBooks();
    interactions.forEach(int => {
        const book = allBooks.find(b => b.id === int.bookId);
        if (book) genres.add(book.gender);
    });
    return Array.from(genres);
}

// filtros

/**
 * Recopila filtros aplicados (basado en preferencias e interacciones)
 * @param {number} userId - ID del usuario
 * @returns {Object} Filtros como {genres: [], authors: []}
 */
async function collectAppliedFilters(userId) {
    const prefs = await collectUserPreferences(userId);
    const readBooks = await getReadBooksDetails(userId);
    const genres = new Set(readBooks.map(b => b.gender));
    const authors = new Set(readBooks.map(b => b.author));
    if (prefs) {
        if (prefs.genres) prefs.genres.forEach(g => genres.add(g));
        if (prefs.authors) prefs.authors.forEach(a => authors.add(a));
    }
    return { genres: Array.from(genres), authors: Array.from(authors) };
}

/**
 * Función principal para recopilar todos los datos del usuario
 * @param {number} userId - ID del usuario
 * @returns {Object} Datos agregados
 */
async function collectAllUserData(userId) {
    const [preferences, readHistory, likes, interactions, searchHistory, filters] = await Promise.all([
        collectUserPreferences(userId),
        collectReadHistory(userId),
        collectUserLikes(userId),
        collectInteractions(userId),
        collectSearchHistory(userId),
        collectAppliedFilters(userId)
    ]);
    return {
        preferences,
        readHistory,
        likes,
        interactions,
        searchHistory,
        filters,
        needsForm: await needsPreferenceForm(userId)
    };
}

module.exports = {
    collectAllUserData,
    collectUserPreferences,
    collectReadHistory,
    collectUserLikes,
    collectInteractions,
    getReadBooksDetails,
    collectSearchHistory,
    collectAppliedFilters,
    needsPreferenceForm
};