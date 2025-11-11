let allUsers = [];
let allLoans = [];
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    setupFilters();
});

function setupFilters() {
    document.getElementById('warningFilter').addEventListener('change', filterUsers);
    document.getElementById('userSearch').addEventListener('input', filterUsers);
    document.getElementById('refreshUsers').addEventListener('click', loadUsers);
}

async function loadUsers() {
    try {
        const container = document.getElementById('usersContainer');
        container.innerHTML = '<div class="loading">Cargando usuarios...</div>';

        console.log('[LOAD USERS] Iniciando carga...');
        console.log('[LOAD USERS] Cookies:', document.cookie);
        
        // Cargar usuarios y préstamos en paralelo
        const [usersResponse, loansResponse] = await Promise.all([
            fetch('/api/admin/users', {
                method: 'GET',
                credentials: 'include', // Envía cookies automáticamente
                headers: { 
                    'Content-Type': 'application/json'
                }
            }),
            fetch('/api/loans/all', {
                method: 'GET',
                credentials: 'include', // Envía cookies automáticamente
                headers: { 
                    'Content-Type': 'application/json'
                }
            })
        ]);

        console.log('[LOAD USERS] Users response status:', usersResponse.status);
        console.log('[LOAD USERS] Loans response status:', loansResponse.status);

        // Validar respuestas antes de parsear JSON
        if (!usersResponse.ok) {
            const errorText = await usersResponse.text();
            console.error('[LOAD USERS] Error en users:', usersResponse.status, errorText);
            if (usersResponse.status === 401 || usersResponse.status === 403) {
                window.location.href = '/login';
                return;
            }
            throw new Error(`Error al cargar usuarios: ${usersResponse.status}`);
        }

        if (!loansResponse.ok) {
            const errorText = await loansResponse.text();
            console.error('[LOAD USERS] Error en loans:', loansResponse.status, errorText);
            if (loansResponse.status === 401 || loansResponse.status === 403) {
                window.location.href = '/login';
                return;
            }
            throw new Error(`Error al cargar préstamos: ${loansResponse.status}`);
        }

        const usersData = await usersResponse.json();
        const loansData = await loansResponse.json();

        console.log('Users data:', usersData);
        console.log('Loans data:', loansData);

        if (usersData.success && Array.isArray(usersData.data)) {
            allUsers = usersData.data.filter(u => u.type !== 'admin'); // No mostrar admins
            console.log(`Loaded ${allUsers.length} users (excluding admins)`);
            
            if (loansData.success && Array.isArray(loansData.data)) {
                allLoans = loansData.data;
                console.log(`Loaded ${allLoans.length} loans`);
            } else {
                console.warn('No loans data or invalid format');
                allLoans = [];
            }

            updateStats();
            filterUsers();
        } else {
            console.error('Invalid users data format:', usersData);
            container.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><p>Error al cargar usuarios</p></div>';
        }
    } catch (error) {
        console.error('Error loading users:', error);
        const container = document.getElementById('usersContainer');
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><p>Error al cargar usuarios</p></div>';
    }
}

function filterUsers() {
    const warningFilter = document.getElementById('warningFilter').value;
    const searchQuery = document.getElementById('userSearch').value.toLowerCase();

    let filtered = allUsers.filter(user => {
        // Filtro por advertencias
        if (warningFilter === 'clean' && user.warning > 0) return false;
        if (warningFilter === 'warned' && user.warning === 0) return false;
        if (warningFilter === 'high' && user.warning < 3) return false;

        // Filtro por búsqueda
        if (searchQuery) {
            const fullName = `${user.name} ${user.lastName}`.toLowerCase();
            const email = user.email.toLowerCase();
            if (!fullName.includes(searchQuery) && !email.includes(searchQuery)) {
                return false;
            }
        }

        return true;
    });

    displayUsers(filtered);
}

function displayUsers(users) {
    const container = document.getElementById('usersContainer');

    console.log('Displaying users:', users.length);

    if (!container) {
        console.error('Container #usersContainer not found!');
        return;
    }

    if (users.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👥</div>
                <p class="empty-message">No se encontraron usuarios</p>
            </div>
        `;
        return;
    }

    container.innerHTML = users.map(user => {
        const userLoans = allLoans.filter(l => l.userId === user.id);
        const activeLoans = userLoans.filter(l => 
            l.state === 'en prestamo' || l.state === 'espera' || l.state === 'atrasado'
        ).length;
        const overdueLoans = userLoans.filter(l => l.state === 'atrasado').length;
        const completedLoans = userLoans.filter(l => l.state === 'devuelto').length;

        const cardClass = user.warning >= 3 ? 'blacklisted' : '';
        const warningLevel = user.warning >= 3 ? 'level-3' : 
                            user.warning === 2 ? 'level-2' : 
                            user.warning === 1 ? 'level-1' : 'level-0';
        
        const warningText = user.warning >= 3 ? '⛔ Alta Advertencia' :
                           user.warning === 2 ? '⚠️ 2 Advertencias' :
                           user.warning === 1 ? '⚠️ 1 Advertencia' : '✅ Sin Advertencias';

        const initials = `${user.name.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

        return `
            <div class="user-card ${cardClass}" onclick="openUserModal(${user.id})">
                <div class="user-header">
                    <div class="user-avatar">${initials}</div>
                    <div class="user-info">
                        <div class="user-name">${user.name} ${user.lastName}</div>
                        <div class="user-email">${user.email}</div>
                    </div>
                </div>
                
                <div class="user-stats">
                    <div class="user-stat">
                        <div class="user-stat-value">${activeLoans}</div>
                        <div class="user-stat-label">Activos</div>
                    </div>
                    <div class="user-stat">
                        <div class="user-stat-value">${overdueLoans}</div>
                        <div class="user-stat-label">Atrasados</div>
                    </div>
                    <div class="user-stat">
                        <div class="user-stat-value">${completedLoans}</div>
                        <div class="user-stat-label">Completados</div>
                    </div>
                </div>
                
                <div class="user-warnings ${warningLevel}">${warningText}</div>
                <span class="user-type ${user.type}">${user.type === 'admin' ? 'ADMIN' : 'USUARIO'}</span>
            </div>
        `;
    }).join('');
}

function updateStats() {
    const totalUsers = allUsers.length;
    const usersWithWarnings = allUsers.filter(u => u.warning > 0).length;
    const blacklistedUsers = 0; // Implementar si tienes tabla de blacklist

    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('usersWithWarnings').textContent = usersWithWarnings;
    document.getElementById('blacklistedUsers').textContent = blacklistedUsers;
}

async function openUserModal(userId) {
    currentUser = allUsers.find(u => u.id === userId);
    if (!currentUser) return;

    // Cargar información del usuario
    const userLoans = allLoans.filter(l => l.userId === userId);
    const activeLoans = userLoans.filter(l => 
        l.state === 'en prestamo' || l.state === 'espera' || l.state === 'atrasado'
    ).length;
    const overdueLoans = userLoans.filter(l => l.state === 'atrasado').length;

    // Actualizar modal
    document.getElementById('modalUserImg').src = currentUser.profilepic || '/assets/profiles/default.png';
    document.getElementById('modalUserName').textContent = `${currentUser.name} ${currentUser.lastName}`;
    document.getElementById('modalUserEmail').textContent = currentUser.email;
    
    const warningBadge = document.getElementById('modalUserWarnings');
    if (currentUser.warning > 0) {
        warningBadge.textContent = `⚠️ ${currentUser.warning} advertencia(s)`;
        warningBadge.className = currentUser.warning >= 3 ? 'warning-badge high' : 'warning-badge';
        warningBadge.style.display = 'inline-block';
    } else {
        warningBadge.style.display = 'none';
    }

    document.getElementById('modalUserLoans').textContent = userLoans.length;
    document.getElementById('modalUserActiveLoans').textContent = activeLoans;
    document.getElementById('modalUserOverdue').textContent = overdueLoans;

    // Reset reason
    document.getElementById('warningReason').value = '';

    // Actualizar botón de blacklist (si implementas la funcionalidad)
    const blacklistBtn = document.getElementById('blacklistBtn');
    blacklistBtn.textContent = '🚫 Blacklistear Usuario';
    blacklistBtn.className = 'btn-danger';

    document.getElementById('userModal').classList.add('active');
}

function closeUserModal() {
    document.getElementById('userModal').classList.remove('active');
    currentUser = null;
}

async function addWarning() {
    if (!currentUser) return;

    const reason = document.getElementById('warningReason').value.trim();
    if (!reason) {
        alert('Por favor ingrese una razón para la advertencia');
        return;
    }

    try {
        const response = await fetch(`/api/admin/users/${currentUser.id}/warn`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                warningLevel: currentUser.warning + 1,
                reason: reason
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('Advertencia agregada exitosamente');
            closeUserModal();
            loadUsers();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error adding warning:', error);
        alert('Error al agregar advertencia');
    }
}

async function removeWarning() {
    if (!currentUser) return;

    if (currentUser.warning === 0) {
        alert('Este usuario no tiene advertencias');
        return;
    }

    if (!confirm('¿Desea quitar una advertencia de este usuario?')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/users/${currentUser.id}/warn`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                warningLevel: Math.max(0, currentUser.warning - 1),
                reason: 'Reducción manual de advertencias'
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('Advertencia removida exitosamente');
            closeUserModal();
            loadUsers();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error removing warning:', error);
        alert('Error al remover advertencia');
    }
}

async function resetWarnings() {
    if (!currentUser) return;

    if (!confirm('¿Desea resetear todas las advertencias de este usuario?')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/users/${currentUser.id}/warn`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                warningLevel: 0,
                reason: 'Reseteo manual de advertencias'
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('Advertencias reseteadas exitosamente');
            closeUserModal();
            loadUsers();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error resetting warnings:', error);
        alert('Error al resetear advertencias');
    }
}

async function toggleBlacklist() {
    if (!currentUser) return;

    const action = 'blacklist'; // Aquí deberías verificar si ya está blacklisteado
    const message = action === 'blacklist' 
        ? '¿Desea blacklistear a este usuario? No podrá solicitar préstamos.'
        : '¿Desea remover a este usuario del blacklist?';

    if (!confirm(message)) {
        return;
    }

    try {
        // Si tienes endpoint de blacklist, úsalo aquí
        // Por ahora, usamos el delete como ejemplo
        const response = await fetch(`/api/admin/users/${currentUser.id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            alert(action === 'blacklist' 
                ? 'Usuario blacklisteado exitosamente'
                : 'Usuario removido del blacklist');
            closeUserModal();
            loadUsers();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error toggling blacklist:', error);
        alert('Error al modificar blacklist');
    }
}

function showError(message) {
    alert('Error: ' + message);
}

// Cerrar modal al hacer click fuera
document.getElementById('userModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeUserModal();
    }
});
