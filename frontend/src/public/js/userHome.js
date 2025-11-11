/**
 * Función auxiliar para normalizar rutas de imágenes
 * Maneja casos donde la ruta puede venir con o sin el prefijo /assets/items/
 */
function normalizeImagePath(imgPath) {
    if (!imgPath) return null;
    
    // Si ya incluye /assets/, usar tal cual
    if (imgPath.startsWith('/assets/')) {
        return imgPath;
    }
    
    // Si incluye assets/ sin la barra inicial, agregar la barra
    if (imgPath.startsWith('assets/')) {
        return '/' + imgPath;
    }
    
    // Si es solo el nombre del archivo, agregar el prefijo completo
    return `/assets/items/${imgPath}`;
}

document.addEventListener('DOMContentLoaded', function() {
    initHomePage();
});

/**
 * Función principal que inicializa toda la página
 */
async function initHomePage() {
    try {
        // Cargar información del usuario primero
        await loadUserInfo();
        
        await Promise.all([
            loadLoansCarousel(),
            loadBooksCarousel(),
            loadSuppliesCarousel(),
            loadPopups()
        ]);
        
        initCarouselControls();
        initPopups();
        
        console.log('[USER HOME] Página inicializada correctamente');
        
    } catch (error) {
        console.error('[USER HOME] Error inicializando página:', error);
    }
}

/**
 * Carga los popups desde components
 */
async function loadPopups() {
    try {
        console.log('[POPUPS] Cargando popups desde components...');
        
        const [bookPopupHtml, suppPopupHtml] = await Promise.all([
            fetch('/components/infoBook.html').then(r => r.text()),
            fetch('/components/infoSupp.html').then(r => r.text())
        ]);
        
        const bookPlaceholder = document.getElementById('book-popup-placeholder');
        const suppPlaceholder = document.getElementById('supp-popup-placeholder');
        
        if (bookPlaceholder) {
            bookPlaceholder.innerHTML = bookPopupHtml;
            console.log('[POPUPS] Book popup HTML insertado');
        } else {
            console.error('[POPUPS] No se encontró book-popup-placeholder');
        }
        
        if (suppPlaceholder) {
            suppPlaceholder.innerHTML = suppPopupHtml;
            console.log('[POPUPS] Supply popup HTML insertado');
        } else {
            console.error('[POPUPS] No se encontró supp-popup-placeholder');
        }
        
        // Esperar un momento para que el DOM se actualice
        await new Promise(resolve => setTimeout(resolve, 50));
        
        console.log('[POPUPS] Popups cargados correctamente');
        
    } catch (error) {
        console.error('[POPUPS] Error cargando popups:', error);
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
        const loansSection = document.getElementById('loans-carousel');
        
        if (!carouselContainer) {
            console.error('[LOANS] No se encontró el contenedor de préstamos');
            return;
        }

        // Limpiar contenedor
        carouselContainer.innerHTML = '';

        if (loans.length === 0) {
            // Ocultar la sección completa cuando no hay préstamos
            loansSection.classList.add('hidden');
            console.log('[LOANS] No hay préstamos activos, sección oculta');
            return;
        }

        // Mostrar la sección cuando hay préstamos
        loansSection.classList.remove('hidden');
        
        // Crear elementos para cada préstamo
        loans.forEach(loan => {
            const loanElement = createLoanElement(loan);
            carouselContainer.appendChild(loanElement);
        });

        console.log(`[LOANS] ${loans.length} préstamos cargados en el carrusel`);

    } catch (error) {
        console.error('[LOANS] Error cargando préstamos:', error);
        // Ocultar la sección en caso de error
        const loansSection = document.getElementById('loans-carousel');
        if (loansSection) {
            loansSection.classList.add('hidden');
        }
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
    
    // Crear estructura del estado
    const loanStatus = document.createElement('div');
    loanStatus.className = `loan-status ${state.class}`;
    loanStatus.innerHTML = `
        <span class="status-icon">${state.icon}</span>
        <span class="status-text">${state.text}</span>
    `;
    
    // Crear estructura de la imagen
    const loanImage = document.createElement('div');
    loanImage.className = 'loan-image';
    
    if (loan.img) {
        const img = document.createElement('img');
        const imgSrc = normalizeImagePath(loan.img);
        img.src = imgSrc;
        img.alt = loan.itemName || 'Item';
        img.loading = 'lazy';
        
        console.log(`[LOAN IMG] Valor original: "${loan.img}"`);
        console.log(`[LOAN IMG] Intentando cargar: ${imgSrc}`);
        
        // Manejar error de carga de imagen
        img.onerror = function() {
            console.error(`[LOAN] ❌ ERROR cargando imagen: ${imgSrc}`);
            loanImage.innerHTML = '<div class="loan-placeholder">📦</div>';
        };
        
        img.onload = function() {
            console.log(`[LOAN] ✅ Imagen cargada correctamente: ${imgSrc}`);
        };
        
        loanImage.appendChild(img);
    } else {
        loanImage.innerHTML = '<div class="loan-placeholder">📦</div>';
    }
    
    // Crear detalles del préstamo
    const loanDetails = document.createElement('div');
    loanDetails.className = 'loan-details';
    loanDetails.innerHTML = `
        <h3 class="loan-item-name">${loan.itemName || 'Sin nombre'}</h3>
        <p class="loan-type">${loan.type === 'book' ? '📖 Libro' : '✏️ Material'}</p>
        <p class="loan-dates">
            <span class="date-label">Solicitado:</span> ${dateIn}<br>
            <span class="date-label">Devolución:</span> ${dateOut}
        </p>
    `;
    
    // Crear contenedor de info
    const loanItemInfo = document.createElement('div');
    loanItemInfo.className = 'loan-item-info';
    loanItemInfo.appendChild(loanImage);
    loanItemInfo.appendChild(loanDetails);
    
    // Agregar todo al elemento principal
    loanDiv.appendChild(loanStatus);
    loanDiv.appendChild(loanItemInfo);
    
    return loanDiv;
}

/**
 * Carga los libros en el carrusel
 */
async function loadBooksCarousel() {
    try {
        console.log('[BOOKS] Cargando libros del carrusel...');
        
        const response = await fetch('/api/items/books/carrousel', {
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
        
        // Debug: mostrar los primeros libros con sus imágenes
        if (books.length > 0) {
            console.log('[BOOKS] Primer libro ejemplo:', books[0]);
            console.log('[BOOKS] Imagen del primer libro:', books[0].img);
        }
        
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
            console.log(`[BOOKS] Creando elemento para libro: ${book.name}, img: ${book.img}`);
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
    
    // Crear estructura del libro
    const bookCover = document.createElement('div');
    bookCover.className = 'book-cover';
    
    if (book.img) {
        const img = document.createElement('img');
        const imgSrc = normalizeImagePath(book.img);
        img.src = imgSrc;
        img.alt = book.name || 'Libro';
        img.loading = 'lazy';
        
        console.log(`[BOOK IMG] Valor original: "${book.img}"`);
        console.log(`[BOOK IMG] Intentando cargar: ${imgSrc} para libro: ${book.name}`);
        
        // Manejar error de carga de imagen
        img.onerror = function() {
            console.error(`[BOOK] ❌ ERROR cargando imagen: ${imgSrc}`);
            console.error(`[BOOK] URL completa: ${window.location.origin}${imgSrc}`);
            bookCover.innerHTML = '<div class="book-placeholder">📚</div>';
        };
        
        img.onload = function() {
            console.log(`[BOOK] ✅ Imagen cargada correctamente: ${imgSrc}`);
        };
        
        bookCover.appendChild(img);
    } else {
        console.warn(`[BOOK] Sin imagen para libro: ${book.name}`);
        bookCover.innerHTML = '<div class="book-placeholder">📚</div>';
    }
    
    const bookInfo = document.createElement('div');
    bookInfo.className = 'book-info';
    bookInfo.innerHTML = `
        <h3 class="book-title">${book.name || 'Sin título'}</h3>
        <p class="book-author">${book.author || 'Autor desconocido'}</p>
        ${book.review ? `<p class="book-rating">⭐ ${book.review}/5</p>` : ''}
    `;
    
    bookDiv.appendChild(bookCover);
    bookDiv.appendChild(bookInfo);
    
    // Variables para detectar arrastre vs click
    let isDragging = false;
    let startX, startY;
    
    // Agregar evento mousedown/touchstart
    bookDiv.addEventListener('mousedown', (e) => {
        isDragging = false;
        startX = e.clientX;
        startY = e.clientY;
    });
    
    bookDiv.addEventListener('touchstart', (e) => {
        isDragging = false;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    // Detectar movimiento
    bookDiv.addEventListener('mousemove', (e) => {
        if (startX !== undefined) {
            const diffX = Math.abs(e.clientX - startX);
            const diffY = Math.abs(e.clientY - startY);
            if (diffX > 5 || diffY > 5) {
                isDragging = true;
            }
        }
    });
    
    bookDiv.addEventListener('touchmove', (e) => {
        if (startX !== undefined) {
            const diffX = Math.abs(e.touches[0].clientX - startX);
            const diffY = Math.abs(e.touches[0].clientY - startY);
            if (diffX > 5 || diffY > 5) {
                isDragging = true;
            }
        }
    });
    
    // Agregar evento click - solo si no hubo arrastre
    bookDiv.addEventListener('click', (e) => {
        if (!isDragging) {
            e.preventDefault();
            console.log('[BOOK] Libro clickeado:', book.id);
            openBookPopup(book.id);
        }
    });

    return bookDiv;
}

/**
 * Carga los supplies en el carrusel
 */
async function loadSuppliesCarousel() {
    try {
        console.log('[SUPPLIES] Cargando supplies del carrusel...');
        
        const response = await fetch('/api/items/supps/carrousel', {
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
        
        // Debug: mostrar los primeros supplies con sus imágenes
        if (supplies.length > 0) {
            console.log('[SUPPLIES] Primer supply ejemplo:', supplies[0]);
            console.log('[SUPPLIES] Imagen del primer supply:', supplies[0].img);
        }
        
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
    
    // Crear estructura del supply
    const supplyCover = document.createElement('div');
    supplyCover.className = 'supply-cover';
    
    if (supply.img) {
        const img = document.createElement('img');
        const imgSrc = normalizeImagePath(supply.img);
        img.src = imgSrc;
        img.alt = supply.name || 'Material';
        img.loading = 'lazy';
        
        console.log(`[SUPPLY IMG] Valor original: "${supply.img}"`);
        console.log(`[SUPPLY IMG] Intentando cargar: ${imgSrc} para supply: ${supply.name}`);
        
        // Manejar error de carga de imagen
        img.onerror = function() {
            console.error(`[SUPPLY] ❌ ERROR cargando imagen: ${imgSrc}`);
            console.error(`[SUPPLY] URL completa: ${window.location.origin}${imgSrc}`);
            supplyCover.innerHTML = '<div class="supply-placeholder">📦</div>';
        };
        
        img.onload = function() {
            console.log(`[SUPPLY] ✅ Imagen cargada correctamente: ${imgSrc}`);
        };
        
        supplyCover.appendChild(img);
    } else {
        console.warn(`[SUPPLY] Sin imagen para supply: ${supply.name}`);
        supplyCover.innerHTML = '<div class="supply-placeholder">📦</div>';
    }
    
    const supplyInfo = document.createElement('div');
    supplyInfo.className = 'supply-info';
    supplyInfo.innerHTML = `
        <h3 class="supply-name">${supply.name || 'Sin nombre'}</h3>
        <p class="supply-available ${available ? 'available' : 'unavailable'}">
            ${available ? `✅ ${supply.total_quantity - supply.borrowed} disponibles` : '❌ No disponible'}
        </p>
    `;
    
    supplyDiv.appendChild(supplyCover);
    supplyDiv.appendChild(supplyInfo);
    
    // Variables para detectar arrastre vs click
    let isDragging = false;
    let startX, startY;
    
    // Agregar evento mousedown/touchstart
    supplyDiv.addEventListener('mousedown', (e) => {
        isDragging = false;
        startX = e.clientX;
        startY = e.clientY;
    });
    
    supplyDiv.addEventListener('touchstart', (e) => {
        isDragging = false;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    // Detectar movimiento
    supplyDiv.addEventListener('mousemove', (e) => {
        if (startX !== undefined) {
            const diffX = Math.abs(e.clientX - startX);
            const diffY = Math.abs(e.clientY - startY);
            if (diffX > 5 || diffY > 5) {
                isDragging = true;
            }
        }
    });
    
    supplyDiv.addEventListener('touchmove', (e) => {
        if (startX !== undefined) {
            const diffX = Math.abs(e.touches[0].clientX - startX);
            const diffY = Math.abs(e.touches[0].clientY - startY);
            if (diffX > 5 || diffY > 5) {
                isDragging = true;
            }
        }
    });
    
    // Agregar evento click - solo si no hubo arrastre
    supplyDiv.addEventListener('click', (e) => {
        if (!isDragging) {
            e.preventDefault();
            console.log('[SUPPLY] Supply clickeado:', supply.id);
            openSupplyPopup(supply.id);
        }
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
            prevBtn.addEventListener('click', () => {
                closePopupsIfOpen();
                scrollCarousel(container, -300);
            });
            nextBtn.addEventListener('click', () => {
                closePopupsIfOpen();
                scrollCarousel(container, 300);
            });
            console.log('[CAROUSEL] Controles configurados para:', section.id);
        }
    });
}

/**
 * Cierra popups si están abiertos
 */
function closePopupsIfOpen() {
    if (bookPopup && bookPopup.classList.contains('active')) {
        closeBookPopup();
    }
    if (supplyPopup && supplyPopup.classList.contains('active')) {
        closeSupplyPopup();
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

// Variables para elementos del DOM (se inicializan en initPopups)
let bookPopup, supplyPopup, closeBookPopupBtn, closeSupplyPopupBtn, reserveBookBtn, reserveSupplyBtn;

// Inicializar popups
function initPopups() {
    console.log('[POPUPS] Inicializando popups...');
    console.log('[POPUPS] DOM actual:', {
        bookPlaceholder: document.getElementById('book-popup-placeholder'),
        suppPlaceholder: document.getElementById('supp-popup-placeholder')
    });
    
    // Obtener elementos del DOM
    bookPopup = document.getElementById('bookPopup');
    supplyPopup = document.getElementById('suppPopup');
    
    console.log('[POPUPS] Elementos popup encontrados:', {
        bookPopup: bookPopup,
        supplyPopup: supplyPopup
    });
    
    closeBookPopupBtn = document.querySelector('#bookPopup .close-btn');
    closeSupplyPopupBtn = document.querySelector('#suppPopup .close-btn');
    reserveBookBtn = document.getElementById('reserveBookBtn');
    reserveSupplyBtn = document.getElementById('reserveSuppBtn');
    
    console.log('[POPUPS] Botones encontrados:', {
        closeBookPopupBtn: closeBookPopupBtn,
        closeSupplyPopupBtn: closeSupplyPopupBtn,
        reserveBookBtn: reserveBookBtn,
        reserveSupplyBtn: reserveSupplyBtn
    });
    
    // Asegurar que los popups estén completamente ocultos al inicio
    if (bookPopup) {
        bookPopup.classList.remove('active');
        console.log('[POPUPS] Book popup inicializado correctamente');
    } else {
        console.error('[POPUPS] ❌ No se encontró el elemento bookPopup en el DOM');
    }
    
    if (supplyPopup) {
        supplyPopup.classList.remove('active');
        console.log('[POPUPS] Supply popup inicializado correctamente');
    } else {
        console.error('[POPUPS] ❌ No se encontró el elemento supplyPopup en el DOM');
    }
    
    if (closeBookPopupBtn) {
        closeBookPopupBtn.addEventListener('click', closeBookPopup);
        console.log('[POPUPS] Event listener agregado a closeBookPopupBtn');
    }
    if (closeSupplyPopupBtn) {
        closeSupplyPopupBtn.addEventListener('click', closeSupplyPopup);
        console.log('[POPUPS] Event listener agregado a closeSupplyPopupBtn');
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
    
    console.log('[POPUPS] ✅ Inicialización completada');
}

/**
 * Función para abrir popup de libro
 */
function openBookPopup(bookId) {
    console.log('[POPUP] Intentando abrir popup de libro, ID:', bookId);
    console.log('[POPUP] bookPopup elemento:', bookPopup);
    
    const book = booksData.find(b => b.id === bookId);
    if (!book) {
        console.error('[POPUP] Libro no encontrado:', bookId);
        return;
    }

    console.log('[POPUP] Libro encontrado:', book);
    console.log('[POPUP] Imagen del libro:', book.img);
    currentBookId = bookId;

    // Verificar que los elementos existan
    const elements = {
        image: document.getElementById('bookPopupImage'),
        title: document.getElementById('bookPopupTitle'),
        author: document.getElementById('bookPopupAuthor'),
        sinopsis: document.getElementById('bookPopupSinopsis'),
        editorial: document.getElementById('bookPopupEditorial'),
        gender: document.getElementById('bookPopupGender'),
        length: document.getElementById('bookPopupLength'),
        stock: document.getElementById('bookPopupStock')
    };

    console.log('[POPUP] Elementos del popup:', elements);

    // Rellenar datos - IMAGEN
    if (elements.image) {
        const imgSrc = book.img ? normalizeImagePath(book.img) : '/assets/icons/book-placeholder.png';
        elements.image.src = imgSrc;
        console.log('[POPUP BOOK] Valor original:', book.img);
        console.log('[POPUP BOOK] Asignando imagen del popup:', imgSrc);
        
        elements.image.onerror = function() {
            console.error('[POPUP BOOK] ❌ ERROR cargando imagen del popup:', imgSrc);
            elements.image.src = '/assets/icons/book-placeholder.png';
        };
        
        elements.image.onload = function() {
            console.log('[POPUP BOOK] ✅ Imagen del popup cargada:', imgSrc);
        };
    }
    
    if (elements.title) elements.title.textContent = book.name;
    if (elements.author) elements.author.textContent = `Por ${book.author}`;
    if (elements.sinopsis) elements.sinopsis.textContent = book.sinopsis || 'Sin sinopsis disponible';
    if (elements.editorial) elements.editorial.textContent = book.editorial || 'N/A';
    if (elements.gender) elements.gender.textContent = book.gender || 'N/A';
    if (elements.length) elements.length.textContent = book.length ? `${book.length} páginas` : 'N/A';
    if (elements.stock) elements.stock.textContent = book.quant > 0 ? `${book.quant} disponibles` : 'No disponible';

    if (reserveBookBtn) {
        if (book.quant > 0) {
            reserveBookBtn.disabled = false;
            reserveBookBtn.textContent = 'Reservar Libro';
        } else {
            reserveBookBtn.disabled = true;
            reserveBookBtn.textContent = 'No Disponible';
        }
    }

    // Abrir popup
    if (bookPopup) {
        console.log('[POPUP] Abriendo popup de libro...');
        bookPopup.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('[POPUP] ✅ Popup de libro abierto');
    } else {
        console.error('[POPUP] ❌ Elemento bookPopup no encontrado!');
    }
}

/**
 * Función para abrir popup de suministro
 */
function openSupplyPopup(supplyId) {
    console.log('[POPUP] Intentando abrir popup de supply, ID:', supplyId);
    console.log('[POPUP] supplyPopup elemento:', supplyPopup);
    
    const supply = suppliesData.find(s => s.id === supplyId);
    if (!supply) {
        console.error('[POPUP] Supply no encontrado:', supplyId);
        return;
    }

    console.log('[POPUP] Supply encontrado:', supply);
    console.log('[POPUP] Imagen del supply:', supply.img);
    currentSupplyId = supplyId;

    // Verificar que los elementos existan
    const elements = {
        image: document.getElementById('suppPopupImage'),
        title: document.getElementById('suppPopupTitle'),
        description: document.getElementById('suppPopupDescription'),
        stock: document.getElementById('suppPopupStock'),
        barcode: document.getElementById('suppPopupBarcode')
    };

    console.log('[POPUP] Elementos del popup:', elements);

    // Rellenar datos - IMAGEN
    if (elements.image) {
        const imgSrc = supply.img ? normalizeImagePath(supply.img) : '/assets/icons/supply-placeholder.png';
        elements.image.src = imgSrc;
        console.log('[POPUP SUPPLY] Valor original:', supply.img);
        console.log('[POPUP SUPPLY] Asignando imagen del popup:', imgSrc);
        
        elements.image.onerror = function() {
            console.error('[POPUP SUPPLY] ❌ ERROR cargando imagen del popup:', imgSrc);
            elements.image.src = '/assets/icons/supply-placeholder.png';
        };
        
        elements.image.onload = function() {
            console.log('[POPUP SUPPLY] ✅ Imagen del popup cargada:', imgSrc);
        };
    }
    
    if (elements.title) elements.title.textContent = supply.name;
    if (elements.description) elements.description.textContent = supply.description || 'Sin descripción disponible';
    if (elements.stock) elements.stock.textContent = (supply.total_quantity - supply.borrowed) > 0 ? `${supply.total_quantity - supply.borrowed} disponibles` : 'No disponible';
    if (elements.barcode) elements.barcode.textContent = supply.barCode || 'N/A';

    if (reserveSupplyBtn) {
        if ((supply.total_quantity - supply.borrowed) > 0) {
            reserveSupplyBtn.disabled = false;
            reserveSupplyBtn.textContent = 'Reservar Material';
        } else {
            reserveSupplyBtn.disabled = true;
            reserveSupplyBtn.textContent = 'No Disponible';
        }
    }

    // Abrir popup
    if (supplyPopup) {
        console.log('[POPUP] Abriendo popup de supply...');
        supplyPopup.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('[POPUP] ✅ Popup de supply abierto');
    } else {
        console.error('[POPUP] ❌ Elemento supplyPopup no encontrado!');
    }
}

/**
 * Función para cerrar popup de libro
 */
function closeBookPopup() {
    if (bookPopup) {
        bookPopup.classList.remove('active');
        document.body.style.overflow = 'auto';
        currentBookId = null;
        console.log('[POPUP] ✅ Popup de libro cerrado');
    }
}

/**
 * Función para cerrar popup de suministro
 */
function closeSupplyPopup() {
    if (supplyPopup) {
        supplyPopup.classList.remove('active');
        document.body.style.overflow = 'auto';
        currentSupplyId = null;
        console.log('[POPUP] ✅ Popup de supply cerrado');
    }
}

/**
 * Función para manejar reserva de libro
 */
async function handleBookReserve() {
    if (!currentBookId) return;

    try {
        reserveBookBtn.disabled = true;
        reserveBookBtn.textContent = 'Procesando...';

        // Obtener nombre del libro del popup
        const bookName = document.getElementById('bookPopupTitle')?.textContent || '';

        // Usar función unificada
        const result = await requestLoan(currentBookId, 'book', bookName);

        if (result.success) {
            closeBookPopup();
            // Recargar carruseles para actualizar datos
            await reloadCarousels();
        } else {
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

        // Obtener nombre del supply del popup
        const supplyName = document.getElementById('suppPopupTitle')?.textContent || '';

        // Usar función unificada
        const result = await requestLoan(currentSupplyId, 'supply', supplyName);

        if (result.success) {
            closeSupplyPopup();
            // Recargar carruseles para actualizar datos
            await reloadCarousels();
        } else {
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
 * Carga la información del usuario
 */
async function loadUserInfo() {
    try {
        console.log('[USER] Cargando información del usuario...');
        
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData) {
            console.error('[USER] No hay datos de usuario en localStorage');
            window.location.href = '/login';
            return;
        }

        // Si tenemos datos básicos, mostrarlos
        if (userData.name) {
            updateUserDisplay(userData);
        }

        // Cargar información completa del usuario desde la API
        const response = await fetch(`/api/users/${userData.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (response.ok) {
            const result = await response.json();
            if (result.user) {
                // Actualizar localStorage con datos frescos
                const updatedUserData = { ...userData, ...result.user };
                localStorage.setItem('userData', JSON.stringify(updatedUserData));
                updateUserDisplay(updatedUserData);
                console.log('[USER] Información del usuario cargada');
            }
        } else {
            console.warn('[USER] No se pudo cargar info completa, usando datos básicos');
        }

    } catch (error) {
        console.error('[USER] Error cargando información del usuario:', error);
    }
}

/**
 * Actualiza la visualización de la información del usuario
 */
function updateUserDisplay(userData) {
    // Aquí puedes agregar lógica para mostrar el nombre del usuario en la página
    // Por ejemplo, en un elemento de bienvenida o en el header
    
    const welcomeElement = document.getElementById('user-welcome');
    if (welcomeElement && userData.name) {
        welcomeElement.textContent = `¡Bienvenido, ${userData.name} ${userData.lastName || ''}!`;
    }
    
    console.log('[USER] Display actualizado:', userData.name, userData.lastName);
}

console.log('[USER HOME] Script cargado correctamente');