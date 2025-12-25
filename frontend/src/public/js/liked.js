let currentUser = null;
let likedBooks = [];

document.addEventListener('DOMContentLoaded', async function() {
    console.log('[LIKED] Inicializando página de libros likeados...');
    await init();
});

async function init() {
    try {
        await loadUserData();
        await loadLikedBooks();
    } catch (error) {
        console.error('[LIKED] Error inicializando página:', error);
    }
}

async function loadUserData() {
    try {
        const response = await fetch('/api/users/me', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar datos del usuario');
        }
        
        const data = await response.json();
        currentUser = data.user;
        
        console.log('[LIKED] Usuario cargado:', currentUser);
        
    } catch (error) {
        console.error('[LIKED] Error cargando usuario:', error);
    }
}

async function loadLikedBooks() {
    try {
        const response = await fetch('/api/items/books', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar libros');
        }
        
        const data = await response.json();
        const allBooks = data.data || [];
        
        // Filtrar libros que el usuario ha likeado
        likedBooks = allBooks.filter(book => {
            if (!book.likes) return false;
            try {
                const likes = JSON.parse(book.likes);
                return likes.includes(currentUser.id);
            } catch {
                return false;
            }
        });
        
        console.log('[LIKED] Libros likeados:', likedBooks);
        
        if (likedBooks.length === 0) {
            document.getElementById('books-grid').style.display = 'none';
            document.getElementById('empty-state').style.display = 'block';
        } else {
            renderBooks();
        }
        
    } catch (error) {
        console.error('[LIKED] Error cargando libros:', error);
        document.getElementById('books-grid').style.display = 'none';
        document.getElementById('empty-state').style.display = 'block';
    }
}

function renderBooks() {
    const booksGrid = document.getElementById('books-grid');
    booksGrid.innerHTML = '';
    
    likedBooks.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.onclick = () => showBookDetails(book.id);
        
        bookCard.innerHTML = `
            <div class="book-cover">
                <img src="${book.img || '/assets/items/default-book.png'}" alt="${book.name}">
            </div>
            <div class="book-info">
                <h3>${book.name}</h3>
                <p class="book-author">${book.author}</p>
                <div class="book-meta">
                    <span class="meta-item">⭐ ${book.review || '0.00'}</span>
                    <span class="meta-item">📚 ${book.gender}</span>
                </div>
            </div>
            <button class="like-btn liked" onclick="event.stopPropagation(); toggleLike(${book.id})">
                ❤️
            </button>
        `;
        
        booksGrid.appendChild(bookCard);
    });
}

async function toggleLike(bookId) {
    try {
        const response = await fetch(`/api/items/books/unlike`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ bookId })
        });
        
        if (response.ok) {
            // Recargar libros
            await loadLikedBooks();
        }
        
    } catch (error) {
        console.error('[LIKED] Error toggling like:', error);
    }
}

function showBookDetails(bookId) {
    // Aquí podrías abrir un modal o redirigir a la página de detalles del libro
    console.log('[LIKED] Mostrando detalles del libro:', bookId);
    // window.location.href = `/books/${bookId}`;
}
