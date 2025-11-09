document.addEventListener('DOMContentLoaded', function() {
    initHomePage();
});

/**
 * Función principal que inicializa toda la página
 */
async function initHomePage() {
    try {
        await Promise.all([
            loadLoansCarousel(),
            loadBooksCarousel(),
            loadSuppliesCarousel()
        ]);
        
        initCarouselControls();
        initPopups();
        
        console.log('[USER HOME] Página inicializada correctamente');
        
    } catch (error) {
        console.error('[USER HOME] Error inicializando página:', error);
    }
}

/**
 * Carga los préstamos activos del usuario
 */
async function loadLoansCarousel() {
    try {
        console.log('[LOANS] Cargando préstamos activos...');
        
        const response = await fetch('/api/loans/me', {
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
        console.log('[LOANS] Respuesta completa:', result);

        const loans = result.data || [];
        
        const carouselContainer = document.querySelector('.carousel-container-loans');
        
        if (!carouselContainer) {
            console.error('[LOANS] No se encontró el contenedor de préstamos');
            return;
        }

        // Limpiar contenedor
        carouselContainer.innerHTML = '';

        if (loans.length === 0) {
            showEmptyLoanState('.carousel-container-loans');
            return;
        }

        // Crear elementos para cada préstamo
        loans.forEach(loan => {
            const loanElement = createLoanElement(loan);
            carouselContainer.appendChild(loanElement);
        });

        console.log(`[LOANS] ${loans.length} préstamos cargados en el carrusel`);

    } catch (error) {
        console.error('[LOANS] Error cargando préstamos:', error);
        showEmptyLoanState('.carousel-container-loans');
    }
}

/**
 * Crea un elemento HTML para un préstamo
 */
function createLoanElement(loan) {
    const loanDiv = document.createElement('div');
    loanDiv.className = 'loan-item';
    loanDiv.setAttribute('data-loan-id', loan.id);
    loanDiv.setAttribute('data-loan-type', loan.type);
    
    // Mapeo de estados a clases CSS y textos
    const stateInfo = {
        'no aprobado': { class: 'not-approved', icon: '⏳', text: 'Pendiente de Aprobación' },
        'espera': { class: 'waiting', icon: '📦', text: 'Listo para Retiro' },
        'en prestamo': { class: 'borrowed', icon: '📚', text: 'En Préstamo' },
        'atrasado': { class: 'overdue', icon: '⚠️', text: 'Atrasado' },
        'devuelto': { class: 'returned', icon: '✅', text: 'Devuelto' }
    };
    
    const state = stateInfo[loan.state] || { class: 'unknown', icon: '❓', text: loan.state };
    
    // Formatear fechas
    const dateIn = new Date(loan.dateIn).toLocaleDateString('es-ES');
    const dateOut = new Date(loan.dateOut).toLocaleDateString('es-ES');
    
    loanDiv.innerHTML = `
        <div class="loan-status ${state.class}">
            <span class="status-icon">${state.icon}</span>
            <span class="status-text">${state.text}</span>
        </div>
        <div class="loan-item-info">
            <div class="loan-image">
                ${loan.img ? 
                    `<img src="/assets/items/${loan.img}" alt="${loan.itemName}" loading="lazy">` : 
                    '<div class="loan-placeholder">📦</div>'
                }
            </div>
            <div class="loan-details">
                <h3 class="loan-item-name">${loan.itemName || 'Sin nombre'}</h3>
                <p class="loan-type">${loan.type === 'book' ? '📖 Libro' : '✏️ Material'}</p>
                <p class="loan-dates">
                    <span class="date-label">Solicitado:</span> ${dateIn}<br>
                    <span class="date-label">Devolución:</span> ${dateOut}
                </p>
            </div>
        </div>
    `;
    
    return loanDiv;
}

/**
 * Muestra estado vacío cuando no hay préstamos
 */
function showEmptyLoanState(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">📚</div>
            <p class="empty-message">No tienes préstamos activos en este momento</p>
            <p class="empty-submessage">¡Explora nuestra biblioteca y solicita un préstamo!</p>
        </div>
    `;
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
        
        // Guardar datos para popups
        booksData = books;
        
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
                `<img src="/assets/items/${book.img}" alt="${book.name}" loading="lazy">` : 
                '<div class="book-placeholder"></div>'
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
        openBookPopup(book.id);
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
        
        // Guardar datos para popups
        suppliesData = supplies;

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
                `<img src="/assets/items/${supply.img}" alt="${supply.name}" loading="lazy">` : 
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
        openSupplyPopup(supply.id);
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
        const container = section.querySelector('.carousel-container-books, .carousel-container-items, .carousel-container-loans');
        
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
    await loadLoansCarousel();
    await loadBooksCarousel();
    await loadSuppliesCarousel();
}

// Hacer funciones disponibles globalmente si es necesario
window.reloadCarousels = reloadCarousels;

// Variables globales para popups
let booksData = [];
let suppliesData = [];
let currentBookId = null;
let currentSupplyId = null;

// Elementos del DOM para popups
const bookPopup = document.getElementById('bookPopup');
const supplyPopup = document.getElementById('suppPopup');
const closeBookPopupBtn = document.querySelector('#bookPopup .close-btn');
const closeSupplyPopupBtn = document.querySelector('#suppPopup .close-btn');
const reserveBookBtn = document.getElementById('reserveBookBtn');
const reserveSupplyBtn = document.getElementById('reserveSuppBtn');

// Inicializar popups
function initPopups() {
    if (closeBookPopupBtn) {
        closeBookPopupBtn.addEventListener('click', closeBookPopup);
    }
    if (closeSupplyPopupBtn) {
        closeSupplyPopupBtn.addEventListener('click', closeSupplyPopup);
    }
    if (bookPopup) {
        bookPopup.addEventListener('click', function(e) {
            if (e.target === bookPopup) {
                closeBookPopup();
            }
        });
    }
    if (supplyPopup) {
        supplyPopup.addEventListener('click', function(e) {
            if (e.target === supplyPopup) {
                closeSupplyPopup();
            }
        });
    }
    if (reserveBookBtn) {
        reserveBookBtn.addEventListener('click', handleBookReserve);
    }
    if (reserveSupplyBtn) {
        reserveSupplyBtn.addEventListener('click', handleSupplyReserve);
    }
}

/**
 * Función para abrir popup de libro
 */
function openBookPopup(bookId) {
    const book = booksData.find(b => b.id === bookId);
    if (!book) return;

    currentBookId = bookId;

    document.getElementById('bookPopupImage').src = book.img ? `/assets/items/${book.img}` : '/assets/icons/book-placeholder.png';
    document.getElementById('bookPopupTitle').textContent = book.name;
    document.getElementById('bookPopupAuthor').textContent = `Por ${book.author}`;
    document.getElementById('bookPopupSinopsis').textContent = book.sinopsis || 'Sin sinopsis disponible';
    document.getElementById('bookPopupEditorial').textContent = book.editorial || 'N/A';
    document.getElementById('bookPopupGender').textContent = book.gender || 'N/A';
    document.getElementById('bookPopupLength').textContent = book.length ? `${book.length} páginas` : 'N/A';
    document.getElementById('bookPopupStock').textContent = book.quant > 0 ? `${book.quant} disponibles` : 'No disponible';

    if (book.quant > 0) {
        reserveBookBtn.disabled = false;
        reserveBookBtn.textContent = 'Reservar Libro';
    } else {
        reserveBookBtn.disabled = true;
        reserveBookBtn.textContent = 'No Disponible';
    }

    bookPopup.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Función para abrir popup de suministro
 */
function openSupplyPopup(supplyId) {
    const supply = suppliesData.find(s => s.id === supplyId);
    if (!supply) return;

    currentSupplyId = supplyId;

    document.getElementById('suppPopupImage').src = supply.img ? `/assets/items/${supply.img}` : '/assets/icons/supply-placeholder.png';
    document.getElementById('suppPopupTitle').textContent = supply.name;
        document.getElementById('suppPopupDescription').textContent = supply.description || 'Sin descripción disponible';
    document.getElementById('suppPopupStock').textContent = (supply.total_quantity - supply.borrowed) > 0 ? `${supply.total_quantity - supply.borrowed} disponibles` : 'No disponible';

    if ((supply.total_quantity - supply.borrowed) > 0) {
        reserveSupplyBtn.disabled = false;
        reserveSupplyBtn.textContent = 'Reservar Material';
    } else {
        reserveSupplyBtn.disabled = true;
        reserveSupplyBtn.textContent = 'No Disponible';
    }

    supplyPopup.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Función para cerrar popup de libro
 */
function closeBookPopup() {
    bookPopup.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentBookId = null;
}

/**
 * Función para cerrar popup de suministro
 */
function closeSupplyPopup() {
    supplyPopup.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentSupplyId = null;
}

/**
 * Función para manejar reserva de libro
 */
async function handleBookReserve() {
    if (!currentBookId) return;

    try {
        reserveBookBtn.disabled = true;
        reserveBookBtn.textContent = 'Procesando...';

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
            closeBookPopup();
            // Recargar carruseles para actualizar datos
            await reloadCarousels();
        } else {
            alert(data.message || 'Error al realizar la reserva');
            reserveBookBtn.disabled = false;
            reserveBookBtn.textContent = 'Reservar Libro';
        }
    } catch (error) {
        console.error('[BOOK RESERVE ERROR]', error);
        alert('Error de conexión. Intenta de nuevo.');
        reserveBookBtn.disabled = false;
        reserveBookBtn.textContent = 'Reservar Libro';
    }
}

/**
 * Función para manejar reserva de suministro
 */
async function handleSupplyReserve() {
    if (!currentSupplyId) return;

    try {
        reserveSupplyBtn.disabled = true;
        reserveSupplyBtn.textContent = 'Procesando...';

        const response = await fetch('/api/loans/supply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                supplyId: currentSupplyId,
                dateOut: calculateReturnDate()
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('¡Reserva exitosa! Puedes retirar el material en la biblioteca.');
            closeSupplyPopup();
            // Recargar carruseles para actualizar datos
            await reloadCarousels();
        } else {
            alert(data.message || 'Error al realizar la reserva');
            reserveSupplyBtn.disabled = false;
            reserveSupplyBtn.textContent = 'Reservar Material';
        }
    } catch (error) {
        console.error('[SUPPLY RESERVE ERROR]', error);
        alert('Error de conexión. Intenta de nuevo.');
        reserveSupplyBtn.disabled = false;
        reserveSupplyBtn.textContent = 'Reservar Material';
    }
}

/**
 * Función auxiliar para calcular fecha de devolución (30 días)
 */
function calculateReturnDate() {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
}

console.log('[USER HOME] Script cargado correctamente');