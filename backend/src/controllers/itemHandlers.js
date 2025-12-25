const { 
    getBooks, 
    getBook, 
    createBook: createBookModel, 
    editBook, 
    getCarrouselBooks
} = require('../models/books');

const { 
    getItems, 
    getItem, 
    createItem, 
    editItem,
    getCarrouselSupps
} = require('../models/items');

const UserModel = require('../models/users');

class ItemController{
// ========== HANDLERS DE LIBROS ==========

    static async getAllBooks(req, res) {
        try {
            const books = await getBooks();
            
            res.json({
                success: true,
                count: books.length,
                data: books
            });
        } catch (error) {
            console.error('[GET ALL BOOKS ERROR]', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener libros'
            });
        }
    }

    static async getBookById(req, res) {
        try {
            const bookId = req.params.id;
            const book = await getBook(bookId);
            
            if (!book) {
                return res.status(404).json({
                    success: false,
                    message: 'Libro no encontrado'
                });
            }
            
            res.json({
                success: true,
                data: book
            });
        } catch (error) {
            console.error('[GET BOOK BY ID ERROR]', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener libro'
            });
        }
    }

    static async searchBooks(req, res) {
        try {
            const query = req.query.q || '';
            
            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: 'Query de búsqueda requerido'
                });
            }
            
            const books = await getBooks();
            
            // Buscar en título, autor, género
            const results = books.filter(book => 
                book.name.toLowerCase().includes(query.toLowerCase()) ||
                book.author.toLowerCase().includes(query.toLowerCase()) ||
                book.gender.toLowerCase().includes(query.toLowerCase())
            );
            
            res.json({
                success: true,
                count: results.length,
                data: results
            });
        } catch (error) {
            console.error('[SEARCH BOOKS ERROR]', error);
            res.status(500).json({
                success: false,
                message: 'Error en búsqueda'
            });
        }
    }

    static async getRecommendations(req, res) {
        try {
            const userId = req.user.id;
            
            // TODO: Implementar algoritmo de recomendación
            // Por ahora devuelve los top 10 libros más leídos
            const books = await getBooks();
            const recommendations = books
                .sort((a, b) => b.timesReaded - a.timesReaded)
                .slice(0, 10);
            
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

    static async createBook(req, res) {
        try {
            const bookData = req.body;
            
            // Validar campos requeridos
            const requiredFields = ['name', 'author', 'sinopsis', 'editorial', 'gender', 'readLevel', 'length', 'theme'];
            const missingFields = requiredFields.filter(field => !bookData[field]);
            
            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Campos faltantes: ${missingFields.join(', ')}`
                });
            }
            
            // Generar código de barras único
            const barCode = `BOOK-${Date.now()}`;
            
            const newBook = {
                ...bookData,
                barCode,
                timesReaded: 0,
                borrowed: false,
                review: 0.00,
                img: bookData.img || '/assets/default-book.png'
            };
            
            const result = await createBookModel(newBook);
            
            res.status(201).json({
                success: true,
                message: 'Libro creado exitosamente',
                data: {
                    id: result.result.insertId,
                    ...newBook
                }
            });
        } catch (error) {
            console.error('[CREATE BOOK ERROR]', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear libro'
            });
        }
    }

    static async updateBook(req, res) {
        try {
            const bookId = req.params.id;
            const updates = req.body;
            
            // Verificar que el libro existe
            const book = await getBook(bookId);
            if (!book) {
                return res.status(404).json({
                    success: false,
                    message: 'Libro no encontrado'
                });
            }
            
            // Actualizar cada campo
            for (const [field, value] of Object.entries(updates)) {
                await editBook(bookId, field, value);
            }
            
            res.json({
                success: true,
                message: 'Libro actualizado exitosamente'
            });
        } catch (error) {
            console.error('[UPDATE BOOK ERROR]', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar libro'
            });
        }
    }

    static async likeBook(req, res) {
        try {
            const userId = req.user.id;
            const { bookId } = req.body;

            if (!bookId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de libro requerido'
                });
            }

            // Verificar que el libro existe
            const book = await getBook(bookId);
            if (!book) {
                return res.status(404).json({
                    success: false,
                    message: 'Libro no encontrado'
                });
            }

            // Obtener likes actuales del libro
            let bookLikes = [];
            try {
                bookLikes = book.likes ? JSON.parse(book.likes) : [];
            } catch (e) {
                bookLikes = [];
            }

            // Verificar si ya tiene like
            if (bookLikes.includes(userId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya has dado like a este libro'
                });
            }

            // Agregar like al libro
            bookLikes.push(userId);
            await editBook(bookId, 'likes', JSON.stringify(bookLikes));

            // Obtener likes del usuario
            const user = await UserModel.getUser(userId);
            let userLikes = [];
            try {
                userLikes = user.likes ? JSON.parse(user.likes) : [];
            } catch (e) {
                userLikes = [];
            }

            // Agregar libro a likes del usuario
            if (!userLikes.includes(parseInt(bookId))) {
                userLikes.push(parseInt(bookId));
                await UserModel.editUser(userId, 'likes', JSON.stringify(userLikes));
            }

            res.json({
                success: true,
                message: 'Like agregado exitosamente',
                likesCount: bookLikes.length
            });
        } catch (error) {
            console.error('[LIKE BOOK ERROR]', error);
            console.error('[LIKE BOOK ERROR] Stack:', error.stack);
            console.error('[LIKE BOOK ERROR] Message:', error.message);
            res.status(500).json({
                success: false,
                message: 'Error al dar like al libro',
                error: error.message
            });
        }
    }

    static async unlikeBook(req, res) {
        try {
            const userId = req.user.id;
            const { bookId } = req.body;

            if (!bookId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de libro requerido'
                });
            }

            // Verificar que el libro existe
            const book = await getBook(bookId);
            if (!book) {
                return res.status(404).json({
                    success: false,
                    message: 'Libro no encontrado'
                });
            }

            // Obtener likes actuales del libro
            let bookLikes = [];
            try {
                bookLikes = book.likes ? JSON.parse(book.likes) : [];
            } catch (e) {
                bookLikes = [];
            }

            // Quitar like del libro
            bookLikes = bookLikes.filter(id => id !== userId);
            await editBook(bookId, 'likes', JSON.stringify(bookLikes));

            // Obtener likes del usuario
            const user = await UserModel.getUser(userId);
            let userLikes = [];
            try {
                userLikes = user.likes ? JSON.parse(user.likes) : [];
            } catch (e) {
                userLikes = [];
            }

            // Quitar libro de likes del usuario
            userLikes = userLikes.filter(id => id !== parseInt(bookId));
            await UserModel.editUser(userId, 'likes', JSON.stringify(userLikes));

            res.json({
                success: true,
                message: 'Like removido exitosamente',
                likesCount: bookLikes.length
            });
        } catch (error) {
            console.error('[UNLIKE BOOK ERROR]', error);
            console.error('[UNLIKE BOOK ERROR] Stack:', error.stack);
            console.error('[UNLIKE BOOK ERROR] Message:', error.message);
            res.status(500).json({
                success: false,
                message: 'Error al quitar like del libro',
                error: error.message
            });
        }
    }

    // ========== HANDLERS DE ÚTILES ==========

    static async getAllSupplies(req, res) {
        try {
            const supplies = await getItems();
            
            res.json({
                success: true,
                count: supplies.length,
                data: supplies
            });
        } catch (error) {
            console.error('[GET ALL SUPPLIES ERROR]', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener útiles'
            });
        }
    }

    static async getSupplyById(req, res) {
        try {
            const supplyId = req.params.id;
            const supply = await getItem(supplyId);
            
            if (!supply) {
                return res.status(404).json({
                    success: false,
                    message: 'Útil no encontrado'
                });
            }
            
            res.json({
                success: true,
                data: supply
            });
        } catch (error) {
            console.error('[GET SUPPLY BY ID ERROR]', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener útil'
            });
        }
    }

    static async createSupply(req, res) {
        try {
            const { name, img, total_quantity } = req.body;
            
            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre es requerido'
                });
            }
            
            const barCode = `SUPP-${Date.now()}`;
            
            const newSupply = {
                name,
                img: img || '/assets/default-supply.png',
                barCode,
                borrowed: 0,
                total_quantity: total_quantity || 1
            };
            
            const result = await createItem(newSupply);
            
            res.status(201).json({
                success: true,
                message: 'Útil creado exitosamente',
                data: {
                    id: result.result.insertId,
                    ...newSupply
                }
            });
        } catch (error) {
            console.error('[CREATE SUPPLY ERROR]', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear útil'
            });
        }
    }

    static async bookCarrousel(req, res) {
        try {
            const books = await getCarrouselBooks();
            res.json({
                success: true,
                data: books 
            });
        } catch(error) {
            console.error('[CARROUSEL BOOK ERROR]', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener libros del carrusel'
            });
        }
    }

    static async suppCarrousel(req, res) {
        try {
            const supps = await getCarrouselSupps();
            res.json({
                success: true,
                data: supps 
            });
        } catch(error) {
            console.error('[CARROUSEL SUPPLY ERROR]', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener útiles del carrusel'
            });
        }
    }

    static async updateSupply(req, res) {
        try {
            const supplyId = req.params.id;
            const updates = req.body;
            
            const supply = await getItem(supplyId);
            if (!supply) {
                return res.status(404).json({
                    success: false,
                    message: 'Útil no encontrado'
                });
            }
            
            for (const [field, value] of Object.entries(updates)) {
                await editItem(supplyId, field, value);
            }
            
            res.json({
                success: true,
                message: 'Útil actualizado exitosamente'
            });
        } catch (error) {
            console.error('[UPDATE SUPPLY ERROR]', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar útil'
            });
        }
    }

    static async deleteBook(req, res) {
        try {
            const bookId = req.params.id;
            
            const book = await getBook(bookId);
            if (!book) {
                return res.status(404).json({
                    success: false,
                    message: 'Libro no encontrado'
                });
            }

            const { deleteBook: deleteBookModel } = require('../models/books');
            await deleteBookModel(bookId);

            res.json({
                success: true,
                message: 'Libro eliminado exitosamente'
            });
        } catch (error) {
            console.error('[DELETE BOOK ERROR]', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar libro'
            });
        }
    }

    static async deleteSupply(req, res) {
        try {
            const supplyId = req.params.id;
            
            const supply = await getItem(supplyId);
            if (!supply) {
                return res.status(404).json({
                    success: false,
                    message: 'Útil no encontrado'
                });
            }

            const { deleteItem } = require('../models/items');
            await deleteItem(supplyId);

            res.json({
                success: true,
                message: 'Útil eliminado exitosamente'
            });
        } catch (error) {
            console.error('[DELETE SUPPLY ERROR]', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar útil'
            });
        }
    }
}
module.exports = ItemController;

/*
module.exports = {
    getAllBooks,
    getBookById,
    searchBooks,
    getRecommendations,
    createBook,
    updateBook,
    getAllSupplies,
    getSupplyById,
    createSupply,
    updateSupply
};*/