document.addEventListener('DOMContentLoaded', function() {
    console.log('[USER HOME] Inicializando página de inicio...');
    
    // Inicializar la página
    initHomePage();
});

/**
 * Función principal que inicializa toda la página
 */
async function initHomePage() {
    try {
        // Cargar datos en paralelo
        await Promise.all([
            loadBooksCarousel(),
            loadSuppliesCarousel()
        ]);
        
        // Inicializar controles de carrusel
        initCarouselControls();
        
        console.log('[USER HOME] Página inicializada correctamente');
        
    } catch (error) {
        console.error('[USER HOME] Error inicializando página:', error);
    }
}

/**
 * Carga los libros en el carrusel
 */
async function loadBooksCarousel() {
    try {
        console.log('[BOOKS] Cargando libros del carrusel...');
        
        const response = await fetch('/api/books/carrousel', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const books = await response.json();
        console.log('[BOOKS] Libros recibidos:', books);

        const carouselContainer = document.querySelector('.carousel-container-books');
        
        if (!carouselContainer) {
            console.error('[BOOKS] No se encontró el contenedor de libros');
            return;
        }

        // Limpiar contenedor
        carouselContainer.innerHTML = '';

        // Crear elementos para cada libro
        books.forEach(book => {
            const bookElement = createBookElement(book);
            carouselContainer.appendChild(bookElement);
        });

        console.log(`[BOOKS] ${books.length} libros cargados en el carrusel`);

    } catch (error) {
        console.error('[BOOKS] Error cargando libros:', error);
        showEmptyState('.carousel-container-books', 'libros');
    }
}

/**
 * Crea un elemento HTML para un libro
 */
function createBookElement(book) {
    const bookDiv = document.createElement('div');
    bookDiv.className = 'book-item';
    bookDiv.setAttribute('data-book-id', book.id);
    
    bookDiv.innerHTML = `
        <div class="book-content">
            <div class="book-cover">
                ${book.imagen ? 
                    `<img src="${book.imagen}" alt="${book.titulo}" loading="lazy">` : 
                    '📚'
                }
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.titulo || 'Sin título'}</h3>
                <p class="book-author">${book.autor || 'Autor desconocido'}</p>
                ${book.anio ? `<p class="book-year">${book.anio}</p>` : ''}
            </div>
        </div>
    `;
    
    // Agregar evento click si es necesario
    bookDiv.addEventListener('click', () => {
        console.log('[BOOK] Libro clickeado:', book.id);
        // Aquí puedes redirigir a la página del libro o mostrar detalles
        // window.location.href = `/book/${book.id}`;
    });

    return bookDiv;
}

/**
 * Carga los supplies en el carrusel
 */
async function loadSuppliesCarousel() {
    try {
        console.log('[SUPPLIES] Cargando supplies del carrusel...');
        
        const response = await fetch('/api/supps/carrousel', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const supplies = await response.json();
        console.log('[SUPPLIES] Supplies recibidos:', supplies);

        const carouselContainer = document.querySelector('.carousel-container-items');
        
        if (!carouselContainer) {
            console.error('[SUPPLIES] No se encontró el contenedor de supplies');
            return;
        }

        // Limpiar contenedor
        carouselContainer.innerHTML = '';

        // Crear elementos para cada supply
        supplies.forEach(supply => {
            const supplyElement = createSupplyElement(supply);
            carouselContainer.appendChild(supplyElement);
        });

        console.log(`[SUPPLIES] ${supplies.length} supplies cargados en el carrusel`);

    } catch (error) {
        console.error('[SUPPLIES] Error cargando supplies:', error);
        showEmptyState('.carousel-container-items', 'materiales');
    }
}

/**
 * Crea un elemento HTML para un supply
 */
function createSupplyElement(supply) {
    const supplyDiv = document.createElement('div');
    supplyDiv.className = 'item-item';
    supplyDiv.setAttribute('data-supply-id', supply.id);
    
    // Icono según el tipo de material
    const getSupplyIcon = (type) => {
        const icons = {
            'electronico': '💻',
            'laboratorio': '🔬',
            'audio': '🎧',
            'video': '📹',
            'herramienta': '🛠️',
            'default': '📦'
        };
        return icons[type?.toLowerCase()] || icons.default;
    };

    supplyDiv.innerHTML = `
        <div class="supply-content">
            <div class="supply-icon">
                ${getSupplyIcon(supply.tipo)}
            </div>
            <div class="supply-info">
                <h3 class="supply-name">${supply.nombre || 'Sin nombre'}</h3>
                <p class="supply-type">${supply.tipo || 'Material'}</p>
                ${supply.disponible !== undefined ? 
                    `<p class="supply-available ${supply.disponible ? 'available' : 'unavailable'}">
                        ${supply.disponible ? '✅ Disponible' : '❌ No disponible'}
                    </p>` : ''
                }
            </div>
        </div>
    `;
    
    // Agregar evento click
    supplyDiv.addEventListener('click', () => {
        console.log('[SUPPLY] Supply clickeado:', supply.id);
        // Aquí puedes redirigir a la página del supply o mostrar detalles
        // window.location.href = `/supply/${supply.id}`;
    });

    return supplyDiv;
}

/**
 * Muestra estado vacío cuando no hay datos
 */
function showEmptyState(containerSelector, type) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">📭</div>
            <p class="empty-message">No hay ${type} disponibles en este momento</p>
        </div>
    `;
}

/**
 * Inicializa los controles de navegación del carrusel
 */
function initCarouselControls() {
    console.log('[CAROUSEL] Inicializando controles...');
    
    // Controles para libros
    const booksPrev = document.querySelector('.carousel-prev[data-carousel="books"]');
    const booksNext = document.querySelector('.carousel-next[data-carousel="books"]');
    const booksContainer = document.querySelector('.carousel-container-books');
    
    // Controles para supplies
    const suppsPrev = document.querySelector('.carousel-prev[data-carousel="supplies"]');
    const suppsNext = document.querySelector('.carousel-next[data-carousel="supplies"]');
    const suppsContainer = document.querySelector('.carousel-container-items');
    
    // Configurar eventos
    if (booksPrev && booksNext && booksContainer) {
        booksPrev.addEventListener('click', () => scrollCarousel(booksContainer, -300));
        booksNext.addEventListener('click', () => scrollCarousel(booksContainer, 300));
        console.log('[CAROUSEL] Controles de libros configurados');
    }
    
    if (suppsPrev && suppsNext && suppsContainer) {
        suppsPrev.addEventListener('click', () => scrollCarousel(suppsContainer, -300));
        suppsNext.addEventListener('click', () => scrollCarousel(suppsContainer, 300));
        console.log('[CAROUSEL] Controles de supplies configurados');
    }
}

/**
 * Función para desplazar el carrusel
 */
function scrollCarousel(container, amount) {
    container.scrollBy({
        left: amount,
        behavior: 'smooth'
    });
    
    console.log(`[CAROUSEL] Desplazamiento: ${amount}px`);
}

/**
 * Función para recargar los datos (útil para actualizaciones)
 */
async function reloadCarousels() {
    console.log('[USER HOME] Recargando carruseles...');
    await loadBooksCarousel();
    await loadSuppliesCarousel();
}

// Hacer funciones disponibles globalmente si es necesario
window.reloadCarousels = reloadCarousels;

console.log('[USER HOME] Script cargado correctamente');