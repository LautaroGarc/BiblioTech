document.addEventListener('DOMContentLoaded', function() {
    initPlusPage();
});

/**
 * Función principal que inicializa la página plus
 */
function initPlusPage() {
    console.log('[USER PLUS] Inicializando página...');
    
    createBookButton();
    createSuppButton();
    
    console.log('[USER PLUS] Página inicializada correctamente');
}

/**
 * Crea el botón de búsqueda de libros
 */
function createBookButton() {
    const bookButton = document.getElementById('book-button');
    
    if (!bookButton) {
        console.error('[PLUS] No se encontró el contenedor book-button');
        return;
    }
    
    bookButton.innerHTML = `
        <div class="button-icon">📚</div>
        <div class="button-content">
            <h2 class="button-title">Buscar Libros</h2>
            <p class="button-description">Explora nuestra colección completa de libros</p>
        </div>
    `;
    
    bookButton.addEventListener('click', () => {
        console.log('[PLUS] Redirigiendo a búsqueda de libros...');
        window.location.href = '/search';
    });
    
    console.log('[PLUS] Botón de libros creado');
}

/**
 * Crea el botón de búsqueda de útiles
 */
function createSuppButton() {
    const suppButton = document.getElementById('supp-button');
    
    if (!suppButton) {
        console.error('[PLUS] No se encontró el contenedor supp-button');
        return;
    }
    
    suppButton.innerHTML = `
        <div class="button-icon">✏️</div>
        <div class="button-content">
            <h2 class="button-title">Útiles Escolares</h2>
            <p class="button-description">Descubre los materiales disponibles</p>
        </div>
    `;
    
    suppButton.addEventListener('click', () => {
        console.log('[PLUS] Redirigiendo a útiles escolares...');
        window.location.href = '/supplies';
    });
    
    console.log('[PLUS] Botón de útiles creado');
}

console.log('[USER PLUS] Script cargado correctamente');
