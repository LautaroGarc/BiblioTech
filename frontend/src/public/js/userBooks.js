document.addEventListener('DOMContentLoaded', async function() {
    const booksFeed = document.getElementById('booksFeed');
    const popup = document.getElementById('bookPopup');
    const closePopupBtn = document.getElementById('closePopup');
    const reserveBtn = document.getElementById('reserveBtn');
    
    let books = [];
    let currentBookIndex = 0;
    let userLikes = new Set();
    let currentBookId = null;

    // Obtener datos del usuario
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
        console.error('[BOOKS] No hay datos de usuario');
        window.location.href = '/login';
        return;
    }

    // Cargar libros
    await loadBooks();

    // Cargar likes del usuario
    await loadUserLikes();

    // Event listeners
    closePopupBtn.addEventListener('click', closePopup);
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            closePopup();
        }
    });

    reserveBtn.addEventListener('click', handleReserve);

    // Función para cargar libros
    async function loadBooks() {
        try {
            const response = await fetch('/api/books', {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Error al cargar libros');
            }

            const data = await response.json();
            console.log('[BOOKS] Datos recibidos:', data);
            books = data.data || [];

            if (books.length === 0) {
                booksFeed.innerHTML = `
                    <div class="no-books">
                        <h2>No hay libros disponibles</h2>
                        <p>Vuelve más tarde para descubrir nuevos títulos</p>
                    </div>
                `;
                return;
            }

            console.log('[BOOKS] Renderizando', books.length, 'libros');
            renderBooks();
            
        } catch (error) {
            console.error('[LOAD BOOKS ERROR]', error);
            booksFeed.innerHTML = `
                <div class="no-books">
                    <h2>Error al cargar libros</h2>
                    <p>Por favor, intenta de nuevo más tarde</p>
                </div>
            `;
        }
    }

    // Función para renderizar libros
    function renderBooks() {
        booksFeed.innerHTML = '';

        books.forEach((book, index) => {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            bookCard.dataset.index = index;

            const isLiked = userLikes.has(book.id);
            const stockAvailable = book.quant > 0;

            bookCard.innerHTML = `
                <img src="${book.img || '/assets/icons/book-placeholder.png'}" 
                     alt="${book.name}" 
                     class="cover"
                     data-book-id="${book.id}">
                
                <div class="book-info">
                    <h2 class="book-title">${book.name}</h2>
                    <p class="book-author">${book.author}</p>
                    
                    <div class="book-actions">
                        <button class="like-btn ${isLiked ? 'liked' : ''}" 
                                data-book-id="${book.id}"
                                title="${isLiked ? 'Quitar like' : 'Me gusta'}">
                            <img src="/assets/icons/heart${isLiked ? '-filled' : ''}.png" 
                                 alt="Like" 
                                 class="like-icon">
                        </button>
                    </div>
                </div>
            `;

            booksFeed.appendChild(bookCard);
        });

        // Agregar event listeners a las portadas
        document.querySelectorAll('.cover').forEach(cover => {
            cover.addEventListener('click', function() {
                const bookId = parseInt(this.dataset.bookId);
                openBookPopup(bookId);
            });
        });

        // Agregar event listeners a los botones de like
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const bookId = parseInt(this.dataset.bookId);
                toggleLike(bookId, this);
            });
        });
    }

    // Función para cargar likes del usuario
    async function loadUserLikes() {
        try {
            const response = await fetch(`/api/users/${userData.id}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                const likes = data.user.likes ? JSON.parse(data.user.likes) : [];
                userLikes = new Set(likes);
            }
        } catch (error) {
            console.error('[LOAD LIKES ERROR]', error);
        }
    }

    // Función para dar/quitar like
    async function toggleLike(bookId, button) {
        try {
            const isLiked = userLikes.has(bookId);
            const endpoint = isLiked ? '/api/books/unlike' : '/api/books/like';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ bookId })
            });

            if (response.ok) {
                if (isLiked) {
                    userLikes.delete(bookId);
                    button.classList.remove('liked');
                    button.querySelector('.like-icon').src = '/assets/icons/heart.png';
                } else {
                    userLikes.add(bookId);
                    button.classList.add('liked');
                    button.querySelector('.like-icon').src = '/assets/icons/heart-filled.png';
                }
            }
        } catch (error) {
            console.error('[TOGGLE LIKE ERROR]', error);
        }
    }

    // Función para abrir popup
    function openBookPopup(bookId) {
        const book = books.find(b => b.id === bookId);
        if (!book) return;

        currentBookId = bookId;

        document.getElementById('popupImage').src = book.img || '/assets/icons/book-placeholder.png';
        document.getElementById('popupTitle').textContent = book.name;
        document.getElementById('popupAuthor').textContent = `Por ${book.author}`;
        document.getElementById('popupSinopsis').textContent = book.sinopsis || 'Sin sinopsis disponible';
        document.getElementById('popupEditorial').textContent = book.editorial || 'N/A';
        document.getElementById('popupGender').textContent = book.gender || 'N/A';
        document.getElementById('popupLength').textContent = book.length ? `${book.length} páginas` : 'N/A';
        document.getElementById('popupStock').textContent = book.quant > 0 ? `${book.quant} disponibles` : 'No disponible';

        if (book.quant > 0) {
            reserveBtn.disabled = false;
            reserveBtn.textContent = 'Reservar Libro';
        } else {
            reserveBtn.disabled = true;
            reserveBtn.textContent = 'No Disponible';
        }

        popup.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Función para cerrar popup
    function closePopup() {
        popup.classList.remove('active');
        document.body.style.overflow = 'auto';
        currentBookId = null;
    }

    // Función para reservar libro
    async function handleReserve() {
        if (!currentBookId) return;

        try {
            reserveBtn.disabled = true;
            reserveBtn.textContent = 'Procesando...';

            const response = await fetch('/api/loans/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    bookId: currentBookId,
                    dateOut: calculateReturnDate()
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('¡Reserva exitosa! Puedes retirar el libro en la biblioteca.');
                closePopup();
                // Recargar libros para actualizar stock
                await loadBooks();
            } else {
                alert(data.message || 'Error al realizar la reserva');
                reserveBtn.disabled = false;
                reserveBtn.textContent = 'Reservar Libro';
            }
        } catch (error) {
            console.error('[RESERVE ERROR]', error);
            alert('Error de conexión. Intenta de nuevo.');
            reserveBtn.disabled = false;
            reserveBtn.textContent = 'Reservar Libro';
        }
    }

    // Función auxiliar para calcular fecha de devolución (30 días)
    function calculateReturnDate() {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date.toISOString().split('T')[0];
    }
});
