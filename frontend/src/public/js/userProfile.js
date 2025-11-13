let currentUser = null;
let selectedPhoto = null;
const BASE_LEVEL_XP = 100;
const LEVEL_STEP_XP = 50;

document.addEventListener('DOMContentLoaded', async function() {
    console.log('[PROFILE] Inicializando perfil...');
    await init();
    setupEventListeners();
});

async function init() {
    try {
        await loadUserData();
        await loadProfilePhotos();
        await loadPreviewData();
    } catch (error) {
        console.error('[PROFILE] Error inicializando página:', error);
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
    currentUser.lvl = Number(currentUser.lvl) || 1;
    currentUser.xp = Number(currentUser.xp) || 0;
        
        // Normalizar img si es inválida
        const validPhotos = ['user-yellow.jpg', 'user-blue.jpg', 'user-lblue.jpg', 'user-default.jpg', 'user-pink.jpg', 'user-purple.jpg', 'user-red.jpg', 'user-green.jpg'];
        if (currentUser.img && (!validPhotos.includes(currentUser.img) || currentUser.img.includes('.png'))) {
            currentUser.img = 'user-default.jpg';
        }
        
        console.log('[PROFILE] Usuario cargado:', currentUser);

        updateLevelDisplay();
        syncLocalUserData(currentUser);
        
        // Actualizar información en la página
        document.getElementById('user-fullname').textContent = `${currentUser.name} ${currentUser.lastName}`;
        document.getElementById('user-email').textContent = currentUser.email;
        const avatarSrc = currentUser.img ? (currentUser.img.startsWith('/assets/') ? currentUser.img : `/assets/profiles/${currentUser.img}`) : '/assets/profiles/user-default.jpg';
        document.getElementById('user-avatar').src = avatarSrc;
        
        // Pre-llenar formulario
        document.getElementById('edit-name').value = currentUser.name;
        document.getElementById('edit-lastname').value = currentUser.lastName;
        
    } catch (error) {
        console.error('[PROFILE] Error cargando usuario:', error);
    }
}

async function loadProfilePhotos() {
    try {
        const photoGrid = document.getElementById('photo-selector');
        const photos = ['user-yellow.jpg', 'user-blue.jpg', 'user-lblue.jpg', 'user-default.jpg', 'user-pink.jpg', 'user-purple.jpg', 'user-red.jpg', 'user-green.jpg'];
        
        photoGrid.innerHTML = '';
        
        photos.forEach(photo => {
            const photoOption = document.createElement('div');
            photoOption.className = 'photo-option';
            const photoPath = `/assets/profiles/${photo}`;
            
            const filename = currentUser && currentUser.img ? (currentUser.img.startsWith('/assets/') ? currentUser.img.split('/').pop() : currentUser.img) : null;
            if (filename === photo) {
                photoOption.classList.add('selected');
                selectedPhoto = photoPath;
            }
            
            photoOption.innerHTML = `<img src="${photoPath}" alt="${photo}">`;
            photoOption.onclick = () => selectPhoto(photoOption, photoPath);
            photoGrid.appendChild(photoOption);
        });
        
    } catch (error) {
        console.error('[PROFILE] Error cargando fotos:', error);
    }
}

function selectPhoto(element, photoPath) {
    document.querySelectorAll('.photo-option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    selectedPhoto = photoPath;
}

function getNextLevelXp(level) {
    const safeLevel = Number.isFinite(level) && level > 0 ? level : 1;
    return BASE_LEVEL_XP + (safeLevel - 1) * LEVEL_STEP_XP;
}

function updateLevelDisplay() {
    if (!currentUser) return;

    const level = Number(currentUser.lvl) || 1;
    const xp = Number(currentUser.xp) || 0;
    const nextLevelXp = getNextLevelXp(level);
    const progressPercent = Math.min(100, Math.round((xp / nextLevelXp) * 100));

    const levelLabel = document.getElementById('user-level-label');
    const progressLabel = document.getElementById('level-progress-label');
    const progressBar = document.getElementById('level-progress-bar');
    const progressWrapper = document.querySelector('.level-progress');

    if (levelLabel) {
        levelLabel.textContent = `Nivel ${level}`;
    }

    if (progressLabel) {
        progressLabel.textContent = `${xp} / ${nextLevelXp} XP`;
    }

    if (progressBar) {
        progressBar.style.width = `${progressPercent}%`;
    }

    if (progressWrapper) {
        progressWrapper.setAttribute('aria-valuenow', progressPercent.toString());
    }
}

function syncLocalUserData(user) {
    if (!user) return;

    try {
        const storedRaw = localStorage.getItem('userData');
        const stored = storedRaw ? JSON.parse(storedRaw) : {};

        if (stored.id && Number(stored.id) !== Number(user.id)) {
            return;
        }

        const updated = {
            ...stored,
            id: user.id,
            name: user.name,
            lastName: user.lastName,
            nombre: user.name,
            apellido: user.lastName,
            img: user.img,
            fotoPerfil: user.img,
            lvl: user.lvl,
            xp: user.xp,
            email: user.email
        };

        localStorage.setItem('userData', JSON.stringify(updated));
    } catch (error) {
        console.error('[PROFILE] Error sincronizando userData:', error);
    }
}

async function loadPreviewData() {
    try {
        // Cargar preview de medallas
        const medalsResponse = await fetch('/api/users/medals', {
            credentials: 'include'
        });
        
        if (medalsResponse.ok) {
            const medalsData = await medalsResponse.json();
            const userMedals = currentUser.medals ? JSON.parse(currentUser.medals) : [];
            const medalsCount = userMedals.length;
            
            document.getElementById('medals-preview').textContent = 
                medalsCount > 0 ? `${medalsCount} medalla${medalsCount !== 1 ? 's' : ''}` : 'Aún no tienes medallas';
        }
        
        // Cargar preview de libros likeados
        const booksResponse = await fetch('/api/items/books', {
            credentials: 'include'
        });
        
        if (booksResponse.ok) {
            const booksData = await booksResponse.json();
            const likedBooks = booksData.data ? booksData.data.filter(book => {
                if (!book.likes) return false;
                const likes = JSON.parse(book.likes);
                return likes.includes(currentUser.id);
            }) : [];
            
            document.getElementById('likes-preview').textContent = 
                likedBooks.length > 0 ? `${likedBooks.length} libro${likedBooks.length !== 1 ? 's' : ''}` : 'Sin libros guardados';
        }
        
        // Cargar preview de historial
        const loansResponse = await fetch(`/api/loans/history?userId=${currentUser.id}`, {
            credentials: 'include'
        });

        if (loansResponse.ok) {
            const loansData = await loansResponse.json();
            const history = Array.isArray(loansData.data) ? loansData.data : [];

            document.getElementById('history-preview').textContent = 
                history.length > 0 ? `${history.length} préstamo${history.length !== 1 ? 's' : ''}` : 'No tienes reservas aún';
        }
        
    } catch (error) {
        console.error('[PROFILE] Error cargando previews:', error);
    }
}

function setupEventListeners() {
    // Cerrar popup al hacer click fuera
    document.getElementById('popupEditarPerfil').addEventListener('click', function(e) {
        if (e.target === this) {
            togglePopup();
        }
    });
    
    // Manejar envío del formulario
    document.getElementById('editForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await updateProfile();
    });
    
    // Cerrar popup con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const popup = document.getElementById('popupEditarPerfil');
            if (popup.classList.contains('active')) {
                togglePopup();
            }
        }
    });
}

function togglePopup() {
    const popup = document.getElementById('popupEditarPerfil');
    const body = document.body;
    
    if (popup.classList.contains('active')) {
        popup.classList.remove('active');
        body.style.overflow = '';
    } else {
        popup.classList.add('active');
        body.style.overflow = 'hidden';
    }
}

async function updateProfile() {
    try {
        const name = document.getElementById('edit-name').value.trim();
        const lastName = document.getElementById('edit-lastname').value.trim();
        
        if (!name || !lastName) {
            alert('Por favor completa todos los campos');
            return;
        }
        
        // Actualizar nombre
        if (name !== currentUser.name) {
            const nameResponse = await fetch('/api/users/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ field: 'name', data: name })
            });
            
            if (!nameResponse.ok) throw new Error('Error al actualizar nombre');
        }
        
        // Actualizar apellido
        if (lastName !== currentUser.lastName) {
            const lastNameResponse = await fetch('/api/users/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ field: 'lastName', data: lastName })
            });
            
            if (!lastNameResponse.ok) throw new Error('Error al actualizar apellido');
        }
        
        // Actualizar foto si cambió
        const currentAvatarSrc = currentUser.img ? (currentUser.img.startsWith('/assets/') ? currentUser.img : `/assets/profiles/${currentUser.img}`) : '/assets/profiles/user-default.jpg';
        if (selectedPhoto && selectedPhoto !== currentAvatarSrc) {
            const imgResponse = await fetch('/api/users/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ field: 'img', data: selectedPhoto.split('/').pop() })
            });
            
            if (!imgResponse.ok) throw new Error('Error al actualizar imagen');
        }
        
        console.log('[PROFILE] Perfil actualizado exitosamente');
        
        // Recargar datos del usuario
        await loadUserData();
        
        alert('Perfil actualizado correctamente');
        togglePopup();
        
    } catch (error) {
        console.error('[PROFILE] Error actualizando perfil:', error);
        alert('Error al actualizar perfil. Intenta de nuevo.');
    }
}

