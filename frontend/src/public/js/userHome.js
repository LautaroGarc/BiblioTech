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

        const result = await response.json();
        console.log('[BOOKS] Respuesta completa:', result);

        // La API devuelve { success: true, data: [...] }
        const books = result.data || [];
        
        const carouselContainer = document.querySelector('.carousel-container-books');
        
        if (!carouselContainer) {
            console.error('[BOOKS] No se encontró el contenedor de libros');
            return;
        }

        // Limpiar contenedor
        carouselContainer.innerHTML = '';

        if (books.length === 0) {
            showEmptyState('.carousel-container-books', 'libros');
            return;
        }

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
        <div class="book-cover">
            ${book.img ? 
                `<img src="${book.img}" alt="${book.name}" loading="lazy">` : 
                '<div class="book-placeholder">📚</div>'
            }
        </div>
        <div class="book-info">
            <h3 class="book-title">${book.name || 'Sin título'}</h3>
            <p class="book-author">${book.author || 'Autor desconocido'}</p>
            ${book.review ? `<p class="book-rating">⭐ ${book.review}/5</p>` : ''}
        </div>
    `;
    
    // Agregar evento click
    bookDiv.addEventListener('click', () => {
        console.log('[BOOK] Libro clickeado:', book.id);
        window.location.href = `/books?id=${book.id}`;
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

        const result = await response.json();
        console.log('[SUPPLIES] Respuesta completa:', result);

        // La API devuelve { success: true, data: [...] }
        const supplies = result.data || [];

        const carouselContainer = document.querySelector('.carousel-container-items');
        
        if (!carouselContainer) {
            console.error('[SUPPLIES] No se encontró el contenedor de supplies');
            return;
        }

        // Limpiar contenedor
        carouselContainer.innerHTML = '';

        if (supplies.length === 0) {
            showEmptyState('.carousel-container-items', 'materiales');
            return;
        }

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
    
    const available = (supply.total_quantity - supply.borrowed) > 0;
    
    supplyDiv.innerHTML = `
        <div class="supply-cover">
            ${supply.img ? 
                `<img src="${supply.img}" alt="${supply.name}" loading="lazy">` : 
                '<div class="supply-placeholder">📦</div>'
            }
        </div>
        <div class="supply-info">
            <h3 class="supply-name">${supply.name || 'Sin nombre'}</h3>
            <p class="supply-available ${available ? 'available' : 'unavailable'}">
                ${available ? `✅ ${supply.total_quantity - supply.borrowed} disponibles` : '❌ No disponible'}
            </p>
        </div>
    `;
    
    // Agregar evento click
    supplyDiv.addEventListener('click', () => {
        console.log('[SUPPLY] Supply clickeado:', supply.id);
        window.location.href = `/books?supply=${supply.id}`;
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
    
    // Obtener todos los botones de control
    const controls = document.querySelectorAll('.carousel-controls');
    
    controls.forEach(controlGroup => {
        const prevBtn = controlGroup.querySelector('.carousel-prev');
        const nextBtn = controlGroup.querySelector('.carousel-next');
        
        // Encontrar el contenedor del carrusel asociado
        const section = controlGroup.closest('.carousel-section');
        const container = section.querySelector('.carousel-container-books, .carousel-container-items');
        
        if (prevBtn && nextBtn && container) {
            prevBtn.addEventListener('click', () => scrollCarousel(container, -300));
            nextBtn.addEventListener('click', () => scrollCarousel(container, 300));
            console.log('[CAROUSEL] Controles configurados para:', section.id);
        }
    });
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