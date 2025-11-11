let currentUser = null;
let allMedals = [];

document.addEventListener('DOMContentLoaded', async function() {
    console.log('[MEDALS] Inicializando página de medallas...');
    await init();
});

async function init() {
    try {
        await loadUserData();
        await loadMedals();
    } catch (error) {
        console.error('[MEDALS] Error inicializando página:', error);
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
        
        console.log('[MEDALS] Usuario cargado:', currentUser);
        
    } catch (error) {
        console.error('[MEDALS] Error cargando usuario:', error);
    }
}

async function loadMedals() {
    try {
        const response = await fetch('/api/users/medals', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar medallas');
        }
        
        const data = await response.json();
        allMedals = data.medals || [];
        
        console.log('[MEDALS] Medallas disponibles:', allMedals);
        
        const userMedals = currentUser.medals ? JSON.parse(currentUser.medals) : [];
        
        if (userMedals.length === 0) {
            document.getElementById('medals-grid').style.display = 'none';
            document.getElementById('empty-state').style.display = 'block';
        } else {
            renderMedals(userMedals);
        }
        
    } catch (error) {
        console.error('[MEDALS] Error cargando medallas:', error);
        document.getElementById('medals-grid').style.display = 'none';
        document.getElementById('empty-state').style.display = 'block';
    }
}

function renderMedals(userMedals) {
    const medalsGrid = document.getElementById('medals-grid');
    medalsGrid.innerHTML = '';
    
    allMedals.forEach(medal => {
        const hasMedal = userMedals.includes(medal.id);
        
        const medalCard = document.createElement('div');
        medalCard.className = `medal-card ${!hasMedal ? 'medal-locked' : ''}`;
        
        medalCard.innerHTML = `
            <div class="medal-icon">
                <img src="${medal.img}" alt="${medal.tag}">
            </div>
            <div class="medal-info">
                <h3>${medal.tag}</h3>
                <p>${hasMedal ? 'Medalla obtenida' : 'Medalla bloqueada'}</p>
            </div>
        `;
        
        medalsGrid.appendChild(medalCard);
    });
}
