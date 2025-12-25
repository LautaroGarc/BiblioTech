document.addEventListener('DOMContentLoaded', async function() {
    const booksFeed = document.getElementById('booksFeed');
    const popup = document.getElementById('bookPopup');
    const closePopupBtn = document.getElementById('closePopup');
    const reserveBtn = document.getElementById('reserveBtn');
    
    let books = [];
    let currentBookIndex = 0;
    let userLikes = new Set();
    let currentBookId = null;
    let isScrolling = false;
    let scrollTimeout;

    // Obtener datos del usuario
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
        console.error('[BOOKS] No hay datos de usuario');
        window.location.href = '/login';
        return;
    }

    // Cargar likes del usuario primero
    await loadUserLikes();

    // Cargar libros (esto llamará a renderBooks)
    await loadBooks();

    // Control de scroll modular (más preciso)
    setupScrollControl();

    // Event listeners
    closePopupBtn.addEventListener('click', closePopup);
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            closePopup();
        }
    });

    reserveBtn.addEventListener('click', handleReserve);

    // Función para controlar el scroll modular
    function setupScrollControl() {
        let lastScrollTop = 0;
        let isSnapping = false;

        booksFeed.addEventListener('scroll', function() {
            if (isSnapping) return;

            clearTimeout(scrollTimeout);
            
            scrollTimeout = setTimeout(() => {
                const scrollTop = booksFeed.scrollTop;
                const cardHeight = booksFeed.clientHeight - 80;
                const currentIndex = Math.round(scrollTop / cardHeight);
                
                // Snap al elemento más cercano
                isSnapping = true;
                booksFeed.scrollTo({
                    top: currentIndex * cardHeight,
                    behavior: 'smooth'
                });

                setTimeout(() => {
                    isSnapping = false;
                }, 500);
            }, 150);
        });

        // Control con rueda del mouse más suave
        booksFeed.addEventListener('wheel', function(e) {
            if (isSnapping) {
                e.preventDefault();
                return;
            }

            e.preventDefault();
            
            const delta = Math.sign(e.deltaY);
            const cardHeight = booksFeed.clientHeight - 80;
            const currentScroll = booksFeed.scrollTop;
            const currentIndex = Math.round(currentScroll / cardHeight);
            const newIndex = Math.max(0, Math.min(books.length - 1, currentIndex + delta));

            if (newIndex !== currentIndex) {
                isSnapping = true;
                booksFeed.scrollTo({
                    top: newIndex * cardHeight,
                    behavior: 'smooth'
                });

                setTimeout(() => {
                    isSnapping = false;
                }, 500);
            }
        }, { passive: false });

        // Control táctil mejorado
        let touchStartY = 0;
        let touchEndY = 0;

        booksFeed.addEventListener('touchstart', function(e) {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        booksFeed.addEventListener('touchend', function(e) {
            touchEndY = e.changedTouches[0].clientY;
            const diff = touchStartY - touchEndY;

            if (Math.abs(diff) > 50) {
                const delta = diff > 0 ? 1 : -1;
                const cardHeight = booksFeed.clientHeight - 80;
                const currentScroll = booksFeed.scrollTop;
                const currentIndex = Math.round(currentScroll / cardHeight);
                const newIndex = Math.max(0, Math.min(books.length - 1, currentIndex + delta));

                isSnapping = true;
                booksFeed.scrollTo({
                    top: newIndex * cardHeight,
                    behavior: 'smooth'
                });

                setTimeout(() => {
                    isSnapping = false;
                }, 500);
            }
        }, { passive: true });
    }

    // Función para cargar libros
    async function loadBooks() {
        try {
            const response = await fetch('/api/items/books', {
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
            
            console.log(`[RENDER] Libro ${book.id} (${book.name}): isLiked=${isLiked}, userLikes.has=${userLikes.has(book.id)}`);
            
            // Calcular cantidad de likes
            let likesCount = 0;
            if (book.likes) {
                try {
                    const likesArray = typeof book.likes === 'string' ? JSON.parse(book.likes) : book.likes;
                    likesCount = Array.isArray(likesArray) ? likesArray.length : 0;
                } catch (e) {
                    likesCount = 0;
                }
            }

            // Construir ruta de imagen correctamente
            const imgSrc = book.img ? `/assets/items/${book.img}` : '/assets/icons/book-placeholder.png';

            bookCard.innerHTML = `
                <img src="${imgSrc}" 
                     alt="${book.name}" 
                     class="cover"
                     data-book-id="${book.id}">
                
                <div class="book-info">
                    <h2 class="book-title">${book.name}</h2>
                    <p class="book-author">${book.author}</p>
                </div>

                <div class="book-actions">
                    <button class="like-btn ${isLiked ? 'liked' : ''}" 
                            data-book-id="${book.id}"
                            title="${isLiked ? 'Quitar like' : 'Me gusta'}">
                        <img src="/assets/icons/${isLiked ? 'liked' : 'like'}.png" 
                             alt="Like" 
                             class="like-icon">
                        <span class="like-count">${likesCount}</span>
                    </button>
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
                // Asegurar que todos los IDs sean números
                const numericLikes = likes.map(id => parseInt(id));
                userLikes = new Set(numericLikes);
                console.log('[LOAD LIKES] Likes del usuario cargados:', Array.from(userLikes));
            }
        } catch (error) {
            console.error('[LOAD LIKES ERROR]', error);
        }
    }

    // Función para dar/quitar like
    async function toggleLike(bookId, button) {
        try {
            const isLiked = userLikes.has(bookId);
            const endpoint = isLiked ? '/api/items/books/unlike' : '/api/items/books/like';

            console.log(`[TOGGLE LIKE] BookId: ${bookId} (tipo: ${typeof bookId})`);
            console.log(`[TOGGLE LIKE] UserLikes contiene bookId:`, userLikes.has(bookId));
            console.log(`[TOGGLE LIKE] UserLikes actual:`, Array.from(userLikes));
            console.log(`[TOGGLE LIKE] ${isLiked ? 'Quitando' : 'Agregando'} like al libro ${bookId}`);
            console.log(`[TOGGLE LIKE] Endpoint:`, endpoint);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ bookId })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('[TOGGLE LIKE] Respuesta:', data);

                const likeIcon = button.querySelector('.like-icon');
                const likeCountSpan = button.querySelector('.like-count');
                let currentCount = parseInt(likeCountSpan.textContent) || 0;

                if (isLiked) {
                    // Quitar like
                    userLikes.delete(bookId);
                    button.classList.remove('liked');
                    likeIcon.src = '/assets/icons/like.png';
                    button.title = 'Me gusta';
                    likeCountSpan.textContent = Math.max(0, currentCount - 1);
                    
                    // Actualizar el objeto book en el array
                    const book = books.find(b => b.id === bookId);
                    if (book) {
                        const likesArray = book.likes ? (typeof book.likes === 'string' ? JSON.parse(book.likes) : book.likes) : [];
                        const updatedLikes = likesArray.filter(id => id !== userData.id);
                        book.likes = JSON.stringify(updatedLikes);
                    }
                } else {
                    // Agregar like
                    userLikes.add(bookId);
                    button.classList.add('liked');
                    likeIcon.src = '/assets/icons/liked.png';
                    button.title = 'Quitar like';
                    likeCountSpan.textContent = currentCount + 1;
                    
                    // Actualizar el objeto book en el array
                    const book = books.find(b => b.id === bookId);
                    if (book) {
                        const likesArray = book.likes ? (typeof book.likes === 'string' ? JSON.parse(book.likes) : book.likes) : [];
                        likesArray.push(userData.id);
                        book.likes = JSON.stringify(likesArray);
                    }
                }

                console.log('[TOGGLE LIKE] Like actualizado correctamente');
            } else {
                const errorData = await response.json();
                console.error('[TOGGLE LIKE ERROR] Error del servidor:', errorData);
                alert(errorData.message || 'Error al procesar el like');
            }
        } catch (error) {
            console.error('[TOGGLE LIKE ERROR]', error);
            alert('Error de conexión al procesar el like');
        }
    }

    // Función para abrir popup
    function openBookPopup(bookId) {
        const book = books.find(b => b.id === bookId);
        if (!book) return;

        currentBookId = bookId;

        // Construir ruta de imagen correctamente
        const imgSrc = book.img ? `/assets/items/${book.img}` : '/assets/icons/book-placeholder.png';
        document.getElementById('popupImage').src = imgSrc;
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

            // Obtener nombre del libro del popup
            const bookName = document.getElementById('popupTitle')?.textContent || '';

            // Usar función unificada
            const result = await requestLoan(currentBookId, 'book', bookName);

            if (result.success) {
                closePopup();
                // Recargar libros para actualizar stock
                await loadBooks();
            } else {
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
