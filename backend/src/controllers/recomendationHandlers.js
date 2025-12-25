const { getBooks, getBook } = require('../models/books');
const { editUser } = require('../models/users');
const { collectAllUserData, getReadBooksDetails } = require('../services/recopilation');
const db = require('../../../database/database'); // Assuming a database connection module

class RecommendationController {
    static async getSimilarBooks(req, res) {
        try {
            const bookId = req.params.id;
            const book = await getBook(bookId);

            if (!book) {
                return res.status(404).json({
                    success: false,
                    message: 'Libro no encontrado'
                });
            }

            // Buscar libros similares por género y autor
            const allBooks = await getBooks();
            const similar = allBooks.filter(b => 
                b.id != bookId && 
                (b.gender === book.gender || b.author === book.author)
            ).slice(0, 5);

            res.json({
                success: true,
                data: similar
            });
        } catch (error) {
            console.error('[GET SIMILAR BOOKS ERROR]', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener libros similares'
            });
        }
    }

    static async getRecommendations(req, res) {
        try {
            const userId = req.user.id;
            
            // Recopilar datos del usuario
            const userData = await collectAllUserData(userId);
            
            if (userData.needsForm) {
                return res.status(200).json({
                    success: true,
                    message: 'Complete el formulario de preferencias para mejores recomendaciones',
                    data: []
                });
            }
            
            const allBooks = await getBooks();
            let recommendations = [];
            
            // Algoritmo basado en preferencias y historial
            const preferredGenres = userData.filters.genres;
            const preferredAuthors = userData.filters.authors;
            const likedBooks = userData.likes;
            const readBooks = userData.readHistory;
            
            // Filtrar libros no leídos
            const unreadBooks = allBooks.filter(book => !readBooks.includes(book.id));
            
            // Calcular score basado en similitud
            recommendations = unreadBooks.map(book => {
                let score = 0;
                if (preferredGenres.includes(book.gender)) score += 2;
                if (preferredAuthors.includes(book.author)) score += 2;
                if (likedBooks.includes(book.id)) score += 3; // Boost para likes directos
                score += book.review * 0.5; // Peso por reseña
                return { ...book, score };
            }).sort((a, b) => b.score - a.score).slice(0, 10);
            
            res.json({
                success: true,
                data: recommendations
            });
        } catch (error) {
            console.error('[GET RECOMMENDATIONS ERROR]', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener recomendaciones'
            });
        }
    }

    static async saveUserPreferences(req, res) {
        try {
            const userId = req.user.id;
            const { preferences } = req.body;

            await editUser(userId, 'preferences', JSON.stringify(preferences));

            res.json({
                success: true,
                message: 'Preferencias guardadas'
            });
        } catch (error) {
            console.error('[SAVE PREFERENCES ERROR]', error);
            res.status(500).json({
                success: false,
                message: 'Error al guardar preferencias'
            });
        }
    }

    static async trackBookInteraction(req, res) {
        try {
            const userId = req.user.id;
            const { bookId, type } = req.body;

            // Insertar en la nueva tabla bookInteractions
            await db.query('INSERT INTO bookInteractions (userId, bookId, type) VALUES (?, ?, ?)', [userId, bookId, type]);

            res.json({
                success: true,
                message: 'Interacción registrada'
            });
        } catch (error) {
            console.error('[TRACK INTERACTION ERROR]', error);
            res.status(500).json({
                success: false,
                message: 'Error al registrar interacción'
            });
        }
    }

    static async expandBookInfo(req, res) {
        try {
            const bookId = req.params.id;
            const book = await getBook(bookId);

            if (!book) {
                return res.status(404).json({
                    success: false,
                    message: 'Libro no encontrado'
                });
            }

            // TODO: Expandir con más información (reseñas, etc.)
            res.json({
                success: true,
                data: book
            });
        } catch (error) {
            console.error('[EXPAND BOOK INFO ERROR]', error);
            res.status(500).json({
                success: false,
                message: 'Error al expandir información del libro'
            });
        }
    }
}

module.exports = RecommendationController;