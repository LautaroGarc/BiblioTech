let allLoans = [];
let filteredLoans = [];
let users = {};

// Cargar préstamos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadLoans();
    setupFilters();
});

async function loadLoans() {
    try {
        const container = document.getElementById('loansContainer');
        container.innerHTML = '<div class="loading">Cargando préstamos...</div>';

        console.log('[LOAD LOANS] Iniciando carga...');
        console.log('[LOAD LOANS] Cookies:', document.cookie);
        
        // Cargar préstamos y usuarios en paralelo (el token va en las cookies automáticamente)
        const [loansResponse, usersResponse] = await Promise.all([
            fetch('/api/loans/all?limit=200', {
                method: 'GET',
                credentials: 'include', // Esto envía las cookies automáticamente
                headers: { 
                    'Content-Type': 'application/json'
                }
            }),
            fetch('/api/admin/users', {
                method: 'GET',
                credentials: 'include', // Esto envía las cookies automáticamente
                headers: { 
                    'Content-Type': 'application/json'
                }
            })
        ]);

        console.log('[LOAD LOANS] Loans response status:', loansResponse.status);
        console.log('[LOAD LOANS] Users response status:', usersResponse.status);

        // Validar respuestas antes de parsear JSON
        if (!loansResponse.ok) {
            const errorText = await loansResponse.text();
            console.error('[LOAD LOANS] Error en loans:', loansResponse.status, errorText);
            if (loansResponse.status === 401 || loansResponse.status === 403) {
                window.location.href = '/login';
                return;
            }
            throw new Error(`Error al cargar préstamos: ${loansResponse.status}`);
        }

        if (!usersResponse.ok) {
            const errorText = await usersResponse.text();
            console.error('[LOAD LOANS] Error en users:', usersResponse.status, errorText);
            if (usersResponse.status === 401 || usersResponse.status === 403) {
                window.location.href = '/login';
                return;
            }
            throw new Error(`Error al cargar usuarios: ${usersResponse.status}`);
        }

        const loansData = await loansResponse.json();
        const usersData = await usersResponse.json();

        console.log('Loans data:', loansData);
        console.log('Users data:', usersData);

        if (loansData.success && Array.isArray(loansData.data)) {
            allLoans = loansData.data;
            console.log(`[LOAD LOANS] ✅ Loaded ${allLoans.length} loans`);
            
            // Debug: Mostrar todos los estados
            const stateCount = {};
            allLoans.forEach(loan => {
                stateCount[loan.state] = (stateCount[loan.state] || 0) + 1;
            });
            console.log('[LOAD LOANS] Estado de préstamos:', stateCount);
            
            // Mostrar préstamos en espera específicamente
            const esperaLoans = allLoans.filter(l => l.state === 'espera');
            console.log(`[LOAD LOANS] 🎯 Préstamos en ESPERA: ${esperaLoans.length}`);
            if (esperaLoans.length > 0) {
                console.log('[LOAD LOANS] Detalles de préstamos en espera:', esperaLoans);
            }
            
            // Crear mapa de usuarios para acceso rápido
            if (usersData.success && Array.isArray(usersData.data)) {
                users = {};
                usersData.data.forEach(user => {
                    users[user.id] = user;
                });
                console.log(`[LOAD LOANS] Loaded ${usersData.data.length} users`);
            } else {
                console.warn('No users data or invalid format');
                users = {};
            }

            filterLoans();
            updateStats();
        } else {
            console.error('Invalid loans data format:', loansData);
            container.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><p>Error al cargar préstamos</p></div>';
        }
    } catch (error) {
        console.error('Error loading loans:', error);
        const container = document.getElementById('loansContainer');
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><p>Error al cargar préstamos</p></div>';
    }
}

function setupFilters() {
    document.getElementById('filterState').addEventListener('change', filterLoans);
    document.getElementById('filterType').addEventListener('change', filterLoans);
    document.getElementById('searchUser').addEventListener('input', filterLoans);
    document.getElementById('refreshBtn').addEventListener('click', loadLoans);
}

function filterLoans() {
    const stateFilter = document.getElementById('filterState').value;
    const typeFilter = document.getElementById('filterType').value;
    const searchQuery = document.getElementById('searchUser').value.toLowerCase();

    console.log('[FILTER LOANS] Filtros aplicados:', { stateFilter, typeFilter, searchQuery });
    console.log('[FILTER LOANS] Total préstamos antes de filtrar:', allLoans.length);

    filteredLoans = allLoans.filter(loan => {
        // Filtro por estado
        if (stateFilter !== 'all' && loan.state !== stateFilter) {
            return false;
        }

        // Filtro por tipo
        if (typeFilter !== 'all' && loan.type !== typeFilter) {
            return false;
        }

        // Filtro por búsqueda de usuario
        if (searchQuery) {
            const fullName = `${loan.userName} ${loan.userLastName}`.toLowerCase();
            const email = (loan.userEmail || '').toLowerCase();
            if (!fullName.includes(searchQuery) && !email.includes(searchQuery)) {
                return false;
            }
        }

        return true;
    });

    console.log('[FILTER LOANS] Total préstamos después de filtrar:', filteredLoans.length);
    const esperaInFiltered = filteredLoans.filter(l => l.state === 'espera');
    console.log('[FILTER LOANS] 🎯 Préstamos en ESPERA después de filtrar:', esperaInFiltered.length);

    displayLoans();
}

function displayLoans() {
    const container = document.getElementById('loansContainer');

    console.log('Displaying loans:', filteredLoans.length);

    if (!container) {
        console.error('Container #loansContainer not found!');
        return;
    }

    if (filteredLoans.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <p class="empty-message">No se encontraron préstamos con los filtros seleccionados</p>
            </div>
        `;
        return;
    }

    // Separar préstamos por categoría
    const pendingLoans = filteredLoans.filter(l => l.state === 'no aprobado');
    const waitingLoans = filteredLoans.filter(l => l.state === 'espera');
    const activeLoans = filteredLoans.filter(l => l.state === 'en prestamo');
    const overdueLoans = filteredLoans.filter(l => l.state === 'atrasado');
    const returnedLoans = filteredLoans.filter(l => l.state === 'devuelto');

    console.log('[DISPLAY LOANS] ==========================================');
    console.log('[DISPLAY LOANS] Total filtered loans:', filteredLoans.length);
    console.log('[DISPLAY LOANS] Categorized:');
    console.log('  - Pending (no aprobado):', pendingLoans.length);
    console.log('  - Waiting (espera):', waitingLoans.length, waitingLoans);
    console.log('  - Active (en prestamo):', activeLoans.length);
    console.log('  - Overdue (atrasado):', overdueLoans.length);
    console.log('  - Returned (devuelto):', returnedLoans.length);

    // Debug: mostrar estados únicos
    const uniqueStates = [...new Set(filteredLoans.map(l => l.state))];
    console.log('[DISPLAY LOANS] Unique states found:', uniqueStates);
    console.log('[DISPLAY LOANS] ==========================================');

    let html = '';

    // PRIORIDAD 1: Listos para retirar (espera) - ARRIBA DE TODO
    if (waitingLoans.length > 0) {
        html += `<h2 class="loans-section-title" style="color: #4caf50; border-color: #4caf50;">🎯 Listos para Entregar (${waitingLoans.length})</h2>`;
        waitingLoans.forEach(loan => {
            html += renderLoanItem(loan, false, true); // tercer parámetro para mostrar botón de entrega
        });
    }

    // PRIORIDAD 2: Solicitudes pendientes
    if (pendingLoans.length > 0) {
        html += `<h2 class="loans-section-title">📋 Solicitudes Pendientes (${pendingLoans.length})</h2>`;
        pendingLoans.forEach(loan => {
            html += renderLoanItem(loan, true, false);
        });
    }

    // PRIORIDAD 3: Préstamos atrasados
    if (overdueLoans.length > 0) {
        html += `<h2 class="loans-section-title" style="color: #f44336; border-color: #f44336;">⚠️ Préstamos Atrasados (${overdueLoans.length})</h2>`;
        overdueLoans.forEach(loan => {
            html += renderLoanItem(loan, false, false);
        });
    }

    // En préstamo
    if (activeLoans.length > 0) {
        html += `<h2 class="loans-section-title">📚 En Préstamo (${activeLoans.length})</h2>`;
        activeLoans.forEach(loan => {
            html += renderLoanItem(loan, false, false);
        });
    }

    // Devueltos
    if (returnedLoans.length > 0) {
        html += `<h2 class="loans-section-title">✅ Devueltos (${returnedLoans.length})</h2>`;
        returnedLoans.forEach(loan => {
            html += renderLoanItem(loan, false, false);
        });
    }

    container.innerHTML = html;
}

function renderLoanItem(loan, showQuickApprove = false, showPickupButton = false) {
    const user = users[loan.userId] || {};
    const userWarning = user.warning > 0 ? 
        `<span class="user-warning">⚠️ ${user.warning} advertencia(s)</span>` : '';
    
    const overdueInfo = loan.state === 'atrasado' ? 
        `<span class="overdue-warning">⏰ Atrasado</span>` : '';

    // Botón de aprobación rápida para préstamos "no aprobado"
    const quickApproveButton = (showQuickApprove && loan.state === 'no aprobado') ? 
        `<button class="quick-approve-btn" onclick="quickApprove(${loan.id}, '${loan.type}')" title="Aprobar rápidamente">✓ Aprobar</button>` : '';

    // Botón de entrega para préstamos en estado "espera" (listos para retirar)
    const pickupButton = (showPickupButton || loan.state === 'espera') ? 
        `<button class="pickup-btn" onclick="event.stopPropagation(); markAsPickedUp(${loan.id}, '${loan.type}')" title="Marcar como entregado">🎯 Entregar</button>` : '';

    const itemClass = loan.state === 'no aprobado' ? 'pending' : 
                     loan.state === 'atrasado' ? 'overdue' : 
                     loan.state === 'espera' ? 'waiting' : '';
    
    console.log(`[RENDER] Loan #${loan.id}: state="${loan.state}", showPickup=${showPickupButton || loan.state === 'espera'}`);

    return `
        <div class="loan-item ${itemClass}" onclick="showLoanDetails(${loan.id})">
            <img src="${loan.img || '/assets/default-item.png'}" alt="${loan.itemName}" class="loan-item-img">
            
            <div class="loan-item-info">
                <div class="loan-item-title">${loan.itemName}</div>
                <div class="loan-item-meta">
                    <span class="loan-meta-item">
                        <span class="loan-meta-icon">👤</span>
                        ${loan.userName} ${loan.userLastName}
                    </span>
                    <span class="loan-meta-item">
                        <span class="loan-meta-icon">📅</span>
                        Solicitud: ${formatDate(loan.dateIn)}
                    </span>
                    <span class="loan-meta-item">
                        <span class="loan-meta-icon">📆</span>
                        Devolución: ${formatDate(loan.dateOut)}
                    </span>
                    <span class="loan-meta-item">
                        <span class="loan-meta-icon">${loan.type === 'book' ? '📚' : '✏️'}</span>
                        ${loan.type === 'book' ? 'Libro' : 'Útil'}
                    </span>
                    ${userWarning}
                    ${overdueInfo}
                </div>
            </div>

            <div class="loan-actions" onclick="event.stopPropagation()">
                <span class="loan-status-badge ${loan.state}">${getStatusText(loan.state)}</span>
                ${quickApproveButton}
                ${pickupButton}
            </div>
        </div>
    `;
}

function showLoanDetails(loanId) {
    const loan = allLoans.find(l => l.id === loanId);
    if (loan) {
        const user = users[loan.userId];
        // La función openLoanPopup está definida en infoLoan.html
        if (typeof openLoanPopup === 'function') {
            openLoanPopup(loan, user);
        }
    }
}

async function quickApprove(loanId, type) {
    event.stopPropagation();
    
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = '⏳';

    try {
        const response = await fetch(`/api/loans/${loanId}/approve`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type })
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Préstamo aprobado exitosamente');
            // Recargar préstamos
            await loadLoans();
        } else {
            showError(data.message || 'Error al aprobar préstamo');
            btn.disabled = false;
            btn.textContent = '✓';
        }
    } catch (error) {
        console.error('Error approving loan:', error);
        showError('Error al aprobar préstamo');
        btn.disabled = false;
        btn.textContent = '✓';
    }
}

async function markAsPickedUp(loanId, type) {
    const loan = allLoans.find(l => l.id === loanId);
    const userName = loan ? `${loan.userName} ${loan.userLastName}` : 'el usuario';
    
    if (!confirm(`¿Confirmar que ${userName} ha retirado el item?\n\nEl préstamo pasará a estado "En Préstamo".`)) {
        return;
    }

    console.log(`[PICKUP] Marking loan #${loanId} as picked up (type: ${type})`);

    try {
        const response = await fetch(`/api/loans/${loanId}/pickup`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type })
        });

        console.log(`[PICKUP] Response status:`, response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[PICKUP] Error response:', errorText);
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('[PICKUP] Success:', data);

        if (data.success) {
            showSuccess(`✅ Item entregado a ${userName}. Préstamo ahora está activo.`);
            await loadLoans();
        } else {
            showError(data.message || 'Error al marcar como entregado');
        }
    } catch (error) {
        console.error('[PICKUP] Error:', error);
        showError('Error al procesar la entrega: ' + error.message);
    }
}

function updateStats() {
    const pending = allLoans.filter(l => l.state === 'no aprobado').length;
    const active = allLoans.filter(l => l.state === 'en prestamo' || l.state === 'espera').length;
    const overdue = allLoans.filter(l => l.state === 'atrasado').length;
    
    // Préstamos de hoy
    const today = new Date().toISOString().split('T')[0];
    const todayLoans = allLoans.filter(l => {
        const loanDate = new Date(l.dateIn).toISOString().split('T')[0];
        return loanDate === today;
    }).length;

    document.getElementById('statPending').textContent = pending;
    document.getElementById('statActive').textContent = active;
    document.getElementById('statOverdue').textContent = overdue;
    document.getElementById('statToday').textContent = todayLoans;
}

function getStatusText(state) {
    const statusMap = {
        'no aprobado': 'Pendiente',
        'espera': 'Listo',
        'en prestamo': 'En Préstamo',
        'atrasado': 'Atrasado',
        'devuelto': 'Devuelto'
    };
    return statusMap[state] || state;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
    });
}

function showError(message) {
    // Implementar notificación de error
    alert('Error: ' + message);
}

function showSuccess(message) {
    // Implementar notificación de éxito
    alert(message);
}
