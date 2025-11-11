let currentUser = null;
let allLoans = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async function() {
    console.log('[HISTORY] Inicializando página de historial...');
    await init();
    setupFilters();
});

async function init() {
    try {
        await loadUserData();
        await loadLoans();
    } catch (error) {
        console.error('[HISTORY] Error inicializando página:', error);
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
        
        console.log('[HISTORY] Usuario cargado:', currentUser);
        
    } catch (error) {
        console.error('[HISTORY] Error cargando usuario:', error);
    }
}

async function loadLoans() {
    try {
        const response = await fetch('/api/loans/user', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar préstamos');
        }
        
        const data = await response.json();
        allLoans = data.loans || [];
        
        console.log('[HISTORY] Préstamos cargados:', allLoans);
        
        if (allLoans.length === 0) {
            document.getElementById('loans-list').style.display = 'none';
            document.getElementById('empty-state').style.display = 'block';
        } else {
            renderLoans();
        }
        
    } catch (error) {
        console.error('[HISTORY] Error cargando préstamos:', error);
        document.getElementById('loans-list').style.display = 'none';
        document.getElementById('empty-state').style.display = 'block';
    }
}

function setupFilters() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Actualizar tabs activos
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Aplicar filtro
            currentFilter = tab.dataset.filter;
            renderLoans();
        });
    });
}

function renderLoans() {
    const loansList = document.getElementById('loans-list');
    loansList.innerHTML = '';
    
    // Filtrar préstamos
    let filteredLoans = allLoans;
    if (currentFilter !== 'all') {
        filteredLoans = allLoans.filter(loan => loan.state === currentFilter);
    }
    
    if (filteredLoans.length === 0) {
        loansList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">No hay préstamos en esta categoría</p>';
        return;
    }
    
    // Ordenar por fecha (más recientes primero)
    filteredLoans.sort((a, b) => new Date(b.dateIn) - new Date(a.dateIn));
    
    filteredLoans.forEach(loan => {
        const loanCard = document.createElement('div');
        loanCard.className = 'loan-card';
        
        const statusClass = `status-${loan.state.replace(' ', '-')}`;
        const statusText = translateStatus(loan.state);
        const itemType = loan.bookId ? 'Libro' : 'Suministro';
        
        loanCard.innerHTML = `
            <div class="loan-header">
                <div class="loan-title">
                    <h3>${loan.itemName || 'Préstamo'}</h3>
                    <p class="loan-type">${itemType}</p>
                </div>
                <span class="loan-status ${statusClass}">${statusText}</span>
            </div>
            <div class="loan-dates">
                <div class="date-item">
                    <span class="date-label">Solicitado</span>
                    <span class="date-value">${formatDate(loan.dateIn)}</span>
                </div>
                <div class="date-item">
                    <span class="date-label">Devolución</span>
                    <span class="date-value">${formatDate(loan.dateOut)}</span>
                </div>
                ${loan.returned_at ? `
                    <div class="date-item">
                        <span class="date-label">Devuelto</span>
                        <span class="date-value">${formatDate(loan.returned_at)}</span>
                    </div>
                ` : ''}
            </div>
        `;
        
        loansList.appendChild(loanCard);
    });
}

function translateStatus(status) {
    const translations = {
        'espera': 'En Espera',
        'en prestamo': 'En Préstamo',
        'devuelto': 'Devuelto',
        'atrasado': 'Atrasado',
        'no aprobado': 'No Aprobado'
    };
    return translations[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    };
    
    return date.toLocaleDateString('es-ES', options);
}
