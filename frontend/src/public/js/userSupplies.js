document.addEventListener('DOMContentLoaded', function() {
    initSuppliesPage();
});

/**
 * Función principal que inicializa la página de supplies
 */
async function initSuppliesPage() {
    console.log('[SUPPLIES] Inicializando página...');
    
    try {
        await loadSupplies();
        console.log('[SUPPLIES] Página inicializada correctamente');
    } catch (error) {
        console.error('[SUPPLIES] Error inicializando página:', error);
    }
}

/**
 * Carga todos los supplies desde la API
 */
async function loadSupplies() {
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const suppliesGrid = document.getElementById('supplies-grid');

    try {
        console.log('[SUPPLIES] Cargando supplies...');
        
        const response = await fetch('/api/items/supps', {
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
        console.log('[SUPPLIES] Respuesta:', result);

        const supplies = result.data || [];

        // Ocultar estado de carga
        loadingState.style.display = 'none';

        if (supplies.length === 0) {
            emptyState.style.display = 'flex';
            suppliesGrid.style.display = 'none';
            return;
        }

        // Renderizar supplies
        suppliesGrid.innerHTML = '';
        supplies.forEach(supply => {
            const supplyCard = createSupplyCard(supply);
            suppliesGrid.appendChild(supplyCard);
        });

        console.log(`[SUPPLIES] ${supplies.length} útiles cargados`);

    } catch (error) {
        console.error('[SUPPLIES] Error cargando supplies:', error);
        loadingState.style.display = 'none';
        emptyState.style.display = 'flex';
    }
}

/**
 * Crea una tarjeta de supply
 */
function createSupplyCard(supply) {
    const card = document.createElement('div');
    card.className = 'supply-card';
    card.setAttribute('data-supply-id', supply.id);

    const available = (supply.total_quantity - supply.borrowed) > 0;
    const availableCount = supply.total_quantity - supply.borrowed;

    card.innerHTML = `
        <div class="supply-image">
            ${supply.img ? 
                `<img src="/assets/items/${supply.img}" alt="${supply.name}" loading="lazy">` : 
                '<div class="supply-placeholder">📦</div>'
            }
        </div>
        <div class="supply-info">
            <h3 class="supply-name">${supply.name || 'Sin nombre'}</h3>
            <div class="supply-availability ${available ? 'available' : 'unavailable'}">
                <span class="availability-icon">${available ? '✅' : '❌'}</span>
                <span>${available ? `${availableCount} disponibles` : 'No disponible'}</span>
            </div>
        </div>
    `;

    // Evento click para abrir modal
    card.addEventListener('click', () => {
        openSupplyModal(supply);
    });

    return card;
}

/**
 * Abre el modal con información del supply
 */
function openSupplyModal(supply) {
    console.log('[MODAL] Abriendo modal para:', supply.name);
    
    const modal = document.getElementById('supply-modal');
    const modalBody = document.getElementById('modal-body');

    const available = (supply.total_quantity - supply.borrowed) > 0;
    const availableCount = supply.total_quantity - supply.borrowed;

    modalBody.innerHTML = `
        <div class="modal-image">
            ${supply.img ? 
                `<img src="/assets/items/${supply.img}" alt="${supply.name}">` : 
                '<div class="modal-image-placeholder">📦</div>'
            }
        </div>
        
        <h2 class="modal-title">${supply.name || 'Sin nombre'}</h2>
        
        <div class="modal-info-row">
            <span class="info-label">Código de Barras:</span>
            <span class="info-value">${supply.barCode || 'No disponible'}</span>
        </div>
        
        <div class="modal-info-row">
            <span class="info-label">Total:</span>
            <span class="info-value">${supply.total_quantity} unidades</span>
        </div>
        
        <div class="modal-info-row">
            <span class="info-label">Prestados:</span>
            <span class="info-value">${supply.borrowed} unidades</span>
        </div>
        
        <div class="modal-info-row">
            <span class="info-label">Disponibles:</span>
            <span class="info-value ${available ? 'available' : 'unavailable'}">
                ${available ? `${availableCount} unidades` : 'No disponible'}
            </span>
        </div>
        
        <button 
            class="rent-button" 
            onclick="rentSupply(${supply.id}, '${supply.name}')"
            ${!available ? 'disabled' : ''}
        >
            ${available ? '🛒 Solicitar Préstamo' : '❌ No Disponible'}
        </button>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Cierra el modal de supply
 */
function closeSupplyModal() {
    const modal = document.getElementById('supply-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    console.log('[MODAL] Modal cerrado');
}

/**
 * Solicita el préstamo de un supply
 */
async function rentSupply(supplyId, supplyName) {
    console.log('[RENT] Solicitando préstamo para:', supplyName);

    try {
        // Obtener datos del usuario desde el token/sesión
        const userResponse = await fetch('/api/users/me', {
            method: 'GET',
            credentials: 'include'
        });

        if (!userResponse.ok) {
            alert('⚠️ Debes iniciar sesión para solicitar un préstamo');
            window.location.href = '/login';
            return;
        }

        const userData = await userResponse.json();
        const userId = userData.user.id;

        // Usar función unificada (supplyName ya viene como parámetro)
        const result = await requestLoan(supplyId, 'supply', supplyName);

        if (result.success) {
            console.log('[RENT] Préstamo creado:', result.data);
            closeSupplyModal();
            
            // Recargar supplies para actualizar disponibilidad
            await loadSupplies();
        }

    } catch (error) {
        console.error('[RENT] Error solicitando préstamo:', error);
        alert('❌ Error al solicitar el préstamo. Por favor, intenta de nuevo.');
    }
}

// Cerrar modal con tecla Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeSupplyModal();
    }
});

console.log('[SUPPLIES] Script cargado correctamente');
