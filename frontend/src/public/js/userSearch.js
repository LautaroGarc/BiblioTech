// Estado global de la aplicación
const appState = {
    allBooks: [],
    filteredBooks: [],
    genres: [],
    currentFilters: {
        searchQuery: '',
        selectedGenre: null,
        likesOnly: false,
        author: '',
        editorial: '',
        minReview: 0,
        readLevel: null
    },
    userLikes: []
};

document.addEventListener('DOMContentLoaded', function() {
    initSearchPage();
});

/**
 * Inicializa la página de búsqueda
 */
async function initSearchPage() {
    console.log('[SEARCH] Inicializando página...');
    
    try {
        // Cargar datos iniciales
        await Promise.all([
            loadAllBooks(),
            loadUserData(),
            loadGenres()
        ]);

        // Configurar eventos
        setupEventListeners();
        
        // Renderizar libros iniciales
        renderBooks(appState.allBooks);
        
        console.log('[SEARCH] Página inicializada correctamente');
    } catch (error) {
        console.error('[SEARCH] Error inicializando página:', error);
    }
}

/**
 * Carga todos los libros
 */
async function loadAllBooks() {
    try {
        console.log('[SEARCH] Cargando libros...');
        
        const response = await fetch('/api/items/books', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const result = await response.json();
        appState.allBooks = result.data || [];
        appState.filteredBooks = [...appState.allBooks];
        
        console.log(`[SEARCH] ${appState.allBooks.length} libros cargados`);
    } catch (error) {
        console.error('[SEARCH] Error cargando libros:', error);
        throw error;
    }
}

/**
 * Carga datos del usuario (likes)
 */
async function loadUserData() {
    try {
        const response = await fetch('/api/users/me', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const userData = await response.json();
            const likes = userData.user.likes;
            
            // Parsear likes si es JSON string
            if (typeof likes === 'string') {
                appState.userLikes = JSON.parse(likes);
            } else if (Array.isArray(likes)) {
                appState.userLikes = likes;
            }
            
            console.log('[SEARCH] Likes del usuario cargados:', appState.userLikes);
        }
    } catch (error) {
        console.error('[SEARCH] Error cargando datos del usuario:', error);
    }
}

/**
 * Carga y procesa los géneros únicos
 */
async function loadGenres() {
    // Extraer géneros únicos de los libros
    const genresSet = new Set();
    appState.allBooks.forEach(book => {
        if (book.gender) {
            genresSet.add(book.gender);
        }
    });
    
    appState.genres = Array.from(genresSet).sort();
    renderGenreFilters();
    
    console.log('[SEARCH] Géneros cargados:', appState.genres);
}

/**
 * Renderiza los filtros de género
 */
function renderGenreFilters() {
    const genresContainer = document.getElementById('genres-container');
    
    genresContainer.innerHTML = '';
    
    appState.genres.forEach(genre => {
        const chip = document.createElement('button');
        chip.className = 'filter-chip genre-chip';
        chip.setAttribute('data-genre', genre);
        chip.textContent = genre;
        
        chip.addEventListener('click', () => {
            toggleGenreFilter(genre);
        });
        
        genresContainer.appendChild(chip);
    });
}

/**
 * Configura los event listeners
 */
function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    
    // Búsqueda en tiempo real con debounce
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            appState.currentFilters.searchQuery = e.target.value.toLowerCase();
            applyAllFilters();
        }, 300);
    });

    // Búsqueda al presionar Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

/**
 * Ejecuta la búsqueda
 */
function performSearch() {
    const searchInput = document.getElementById('search-input');
    appState.currentFilters.searchQuery = searchInput.value.toLowerCase();
    applyAllFilters();
    console.log('[SEARCH] Búsqueda realizada:', appState.currentFilters.searchQuery);
}

/**
 * Toggle filtro de likes/favoritos
 */
function toggleLikesFilter() {
    appState.currentFilters.likesOnly = !appState.currentFilters.likesOnly;
    
    const likesButton = document.getElementById('likes-filter');
    likesButton.classList.toggle('active', appState.currentFilters.likesOnly);
    
    applyAllFilters();
    console.log('[SEARCH] Filtro de likes:', appState.currentFilters.likesOnly);
}

/**
 * Toggle filtro de género
 */
function toggleGenreFilter(genre) {
    if (appState.currentFilters.selectedGenre === genre) {
        appState.currentFilters.selectedGenre = null;
    } else {
        appState.currentFilters.selectedGenre = genre;
    }
    
    // Actualizar UI
    document.querySelectorAll('.genre-chip').forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('data-genre') === appState.currentFilters.selectedGenre);
    });
    
    applyAllFilters();
    console.log('[SEARCH] Género seleccionado:', appState.currentFilters.selectedGenre);
}

/**
 * Aplica todos los filtros
 */
function applyAllFilters() {
    let filtered = [...appState.allBooks];
    
    // Filtro de búsqueda por texto
    if (appState.currentFilters.searchQuery) {
        filtered = filtered.filter(book => {
            const searchTerm = appState.currentFilters.searchQuery;
            return (
                book.name?.toLowerCase().includes(searchTerm) ||
                book.author?.toLowerCase().includes(searchTerm) ||
                book.sinopsis?.toLowerCase().includes(searchTerm)
            );
        });
    }
    
    // Filtro por género
    if (appState.currentFilters.selectedGenre) {
        filtered = filtered.filter(book => 
            book.gender === appState.currentFilters.selectedGenre
        );
    }
    
    // Filtro por likes
    if (appState.currentFilters.likesOnly) {
        filtered = filtered.filter(book => 
            appState.userLikes.includes(book.id)
        );
    }
    
    // Filtro por autor
    if (appState.currentFilters.author) {
        filtered = filtered.filter(book =>
            book.author?.toLowerCase().includes(appState.currentFilters.author.toLowerCase())
        );
    }
    
    // Filtro por editorial
    if (appState.currentFilters.editorial) {
        filtered = filtered.filter(book =>
            book.editorial?.toLowerCase().includes(appState.currentFilters.editorial.toLowerCase())
        );
    }
    
    // Filtro por review mínimo
    if (appState.currentFilters.minReview > 0) {
        filtered = filtered.filter(book =>
            parseFloat(book.review) >= appState.currentFilters.minReview
        );
    }
    
    // Filtro por nivel de lectura
    if (appState.currentFilters.readLevel) {
        filtered = filtered.filter(book =>
            book.readLevel === parseInt(appState.currentFilters.readLevel)
        );
    }
    
    appState.filteredBooks = filtered;
    renderBooks(filtered);
}

/**
 * Renderiza los libros en el grid
 */
function renderBooks(books) {
    const booksGrid = document.getElementById('books-grid');
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const resultsInfo = document.getElementById('results-info');
    
    loadingState.style.display = 'none';
    
    if (books.length === 0) {
        booksGrid.style.display = 'none';
        emptyState.style.display = 'flex';
        resultsInfo.style.display = 'none';
        return;
    }
    
    booksGrid.style.display = 'grid';
    emptyState.style.display = 'none';
    resultsInfo.style.display = 'block';
    
    // Actualizar contador de resultados
    resultsInfo.querySelector('.results-count').textContent = 
        `${books.length} libro${books.length !== 1 ? 's' : ''} encontrado${books.length !== 1 ? 's' : ''}`;
    
    // Renderizar tarjetas
    booksGrid.innerHTML = '';
    books.forEach(book => {
        const bookCard = createBookCard(book);
        booksGrid.appendChild(bookCard);
    });
    
    console.log(`[SEARCH] ${books.length} libros renderizados`);
}

/**
 * Crea una tarjeta de libro
 */
function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.setAttribute('data-book-id', book.id);

    const available = !book.borrowed;

    card.innerHTML = `
        <div class="book-image">
            ${book.img ? 
                `<img src="/assets/items/${book.img}" alt="${book.name}" loading="lazy">` : 
                '<div class="book-placeholder">📚</div>'
            }
            <div class="availability-badge ${available ? 'available' : 'unavailable'}">
                ${available ? 'Disponible' : 'Prestado'}
            </div>
        </div>
        <div class="book-info">
            <h3 class="book-title">${book.name || 'Sin título'}</h3>
            <p class="book-author">${book.author || 'Autor desconocido'}</p>
            <div class="book-footer">
                <span class="book-genre">${book.gender || 'Sin género'}</span>
                ${book.review ? `<span class="book-rating">⭐ ${book.review}</span>` : ''}
            </div>
        </div>
    `;

    card.addEventListener('click', () => {
        openBookModal(book);
    });

    return card;
}

/**
 * Abre el modal de filtros avanzados
 */
function openFiltersModal() {
    console.log('[MODAL] Abriendo filtros avanzados');
    
    const modal = document.getElementById('filters-modal');
    const filtersForm = document.getElementById('filters-form');
    
    filtersForm.innerHTML = `
        <div class="filter-group">
            <label class="filter-group-label">Autor</label>
            <input 
                type="text" 
                class="filter-input" 
                id="filter-author" 
                placeholder="Buscar por autor"
                value="${appState.currentFilters.author}"
            >
        </div>
        
        <div class="filter-group">
            <label class="filter-group-label">Editorial</label>
            <input 
                type="text" 
                class="filter-input" 
                id="filter-editorial" 
                placeholder="Buscar por editorial"
                value="${appState.currentFilters.editorial}"
            >
        </div>
        
        <div class="filter-group">
            <label class="filter-group-label">Calificación Mínima</label>
            <select class="filter-select" id="filter-review">
                <option value="0" ${appState.currentFilters.minReview === 0 ? 'selected' : ''}>Todas</option>
                <option value="1" ${appState.currentFilters.minReview === 1 ? 'selected' : ''}>⭐ 1+</option>
                <option value="2" ${appState.currentFilters.minReview === 2 ? 'selected' : ''}>⭐ 2+</option>
                <option value="3" ${appState.currentFilters.minReview === 3 ? 'selected' : ''}>⭐ 3+</option>
                <option value="4" ${appState.currentFilters.minReview === 4 ? 'selected' : ''}>⭐ 4+</option>
            </select>
        </div>
        
        <div class="filter-group">
            <label class="filter-group-label">Nivel de Lectura</label>
            <select class="filter-select" id="filter-readlevel">
                <option value="" ${!appState.currentFilters.readLevel ? 'selected' : ''}>Todos</option>
                <option value="1" ${appState.currentFilters.readLevel === 1 ? 'selected' : ''}>Nivel 1 - Infantil</option>
                <option value="2" ${appState.currentFilters.readLevel === 2 ? 'selected' : ''}>Nivel 2 - Juvenil</option>
                <option value="3" ${appState.currentFilters.readLevel === 3 ? 'selected' : ''}>Nivel 3 - Adulto</option>
                <option value="4" ${appState.currentFilters.readLevel === 4 ? 'selected' : ''}>Nivel 4 - Avanzado</option>
            </select>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Cierra el modal de filtros
 */
function closeFiltersModal() {
    const modal = document.getElementById('filters-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Aplica los filtros del modal
 */
function applyFilters() {
    appState.currentFilters.author = document.getElementById('filter-author').value;
    appState.currentFilters.editorial = document.getElementById('filter-editorial').value;
    appState.currentFilters.minReview = parseFloat(document.getElementById('filter-review').value);
    appState.currentFilters.readLevel = document.getElementById('filter-readlevel').value ? 
        parseInt(document.getElementById('filter-readlevel').value) : null;
    
    closeFiltersModal();
    applyAllFilters();
    
    console.log('[FILTERS] Filtros aplicados:', appState.currentFilters);
}

/**
 * Limpia todos los filtros
 */
function clearFilters() {
    appState.currentFilters = {
        searchQuery: '',
        selectedGenre: null,
        likesOnly: false,
        author: '',
        editorial: '',
        minReview: 0,
        readLevel: null
    };
    
    // Resetear UI
    document.getElementById('search-input').value = '';
    document.getElementById('likes-filter').classList.remove('active');
    document.querySelectorAll('.genre-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    
    closeFiltersModal();
    applyAllFilters();
    
    console.log('[FILTERS] Filtros limpiados');
}

/**
 * Abre el modal con información del libro
 */
function openBookModal(book) {
    console.log('[MODAL] Abriendo modal para libro:', book.name);
    
    const modal = document.getElementById('book-modal');
    const modalBody = document.getElementById('book-modal-body');

    const available = !book.borrowed;

    modalBody.innerHTML = `
        <div class="modal-book-image">
            ${book.img ? 
                `<img src="/assets/items/${book.img}" alt="${book.name}">` : 
                '<div class="modal-book-placeholder">📚</div>'
            }
        </div>
        
        <h2 class="book-detail-title">${book.name || 'Sin título'}</h2>
        <p class="book-detail-author">Por ${book.author || 'Autor desconocido'}</p>
        
        <div class="book-sinopsis">
            <h3 class="sinopsis-title">Sinopsis</h3>
            <p class="sinopsis-text">${book.sinopsis || 'No hay sinopsis disponible.'}</p>
        </div>
        
        <div class="book-detail-row">
            <span class="detail-label">Editorial:</span>
            <span class="detail-value">${book.editorial || 'No especificada'}</span>
        </div>
        
        <div class="book-detail-row">
            <span class="detail-label">Género:</span>
            <span class="detail-value">${book.gender || 'Sin género'}</span>
        </div>
        
        <div class="book-detail-row">
            <span class="detail-label">Calificación:</span>
            <span class="detail-value">${book.review ? `⭐ ${book.review}/5` : 'Sin calificación'}</span>
        </div>
        
        <div class="book-detail-row">
            <span class="detail-label">Nivel:</span>
            <span class="detail-value">Nivel ${book.readLevel || 'N/A'}</span>
        </div>
        
        <div class="book-detail-row">
            <span class="detail-label">Páginas:</span>
            <span class="detail-value">${book.length || 'No especificado'}</span>
        </div>
        
        <div class="book-detail-row">
            <span class="detail-label">Estado:</span>
            <span class="detail-value" style="color: ${available ? '#4caf50' : '#f44336'}; font-weight: 600;">
                ${available ? '✅ Disponible' : '❌ Prestado actualmente'}
            </span>
        </div>
        
        <button 
            class="rent-button" 
            onclick="rentBook(${book.id}, '${book.name.replace(/'/g, "\\'")}')"
            ${!available ? 'disabled' : ''}
        >
            ${available ? '📖 Solicitar Préstamo' : '❌ No Disponible'}
        </button>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Cierra el modal de libro
 */
function closeBookModal() {
    const modal = document.getElementById('book-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Solicita el préstamo de un libro
 */
async function rentBook(bookId, bookName) {
    console.log('[RENT] Solicitando préstamo para libro:', bookName);

    try {
        const userResponse = await fetch('/api/users/me', {
            method: 'GET',
            credentials: 'include'
        });

        if (!userResponse.ok) {
            alert('⚠️ Debes iniciar sesión para solicitar un préstamo');
            window.location.href = '/login';
            return;
        }

        // Usar función unificada
        const result = await requestLoan(bookId, 'book', bookName);

        if (result.success) {
            closeBookModal();
        }
        await loadAllBooks();
        applyAllFilters();

    } catch (error) {
        console.error('[RENT] Error solicitando préstamo:', error);
        alert('❌ Error al solicitar el préstamo. Por favor, intenta de nuevo.');
    }
}

// Cerrar modales con tecla Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeFiltersModal();
        closeBookModal();
    }
});

console.log('[SEARCH] Script cargado correctamente');
