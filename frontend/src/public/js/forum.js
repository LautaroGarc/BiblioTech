document.addEventListener('DOMContentLoaded', function() {
    initForum();
});

/**
 * Variables globales
 */
let currentForumId = null;
let currentPage = 1;
let isLoading = false;
let hasMoreMessages = true;
let lastMessageTime = null;
let liveUpdateInterval = null;

/**
 * Función principal de inicialización
 */
async function initForum() {
    try {
        // Verificar autenticación
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData) {
            console.error('[FORUM] No hay datos de usuario');
            window.location.href = '/login';
            return;
        }

        // Inicializar event listeners
        initEventListeners();

        // Cargar lista de foros
        await loadForums();

        console.log('[FORUM] Módulo inicializado correctamente');

    } catch (error) {
        console.error('[FORUM] Error inicializando:', error);
    }
}

/**
 * Inicializar event listeners
 */
function initEventListeners() {
    // Botón de ranking
    document.getElementById('ranking-btn').addEventListener('click', () => {
        window.location.href = '/ranking';
    });

    // Botón volver
    document.getElementById('back-to-forums').addEventListener('click', showForumsList);

    // Formulario de mensaje
    document.getElementById('message-form').addEventListener('submit', handleSendMessage);

    // Input de mensaje
    const messageInput = document.getElementById('message-input');
    messageInput.addEventListener('input', updateCharCounter);
    messageInput.addEventListener('keydown', handleKeyPress);

    // Scroll infinito
    const messagesContainer = document.getElementById('messages-list');
    messagesContainer.addEventListener('scroll', handleScroll);
}

/**
 * Cargar lista de foros
 */
async function loadForums() {
    try {
        console.log('[FORUMS] Cargando foros...');

        const response = await fetch('/api/forums', {
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
        console.log('[FORUMS] Respuesta:', result);

        const forums = result.data || [];

        const forumsGrid = document.getElementById('forums-grid');
        forumsGrid.innerHTML = '';

        if (forums.length === 0) {
            forumsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💬</div>
                    <p class="empty-message">No hay foros disponibles</p>
                    <p class="empty-submessage">Vuelve más tarde</p>
                </div>
            `;
            return;
        }

        // Crear tarjetas de foros
        forums.forEach(forum => {
            const forumCard = createForumCard(forum);
            forumsGrid.appendChild(forumCard);
        });

        console.log(`[FORUMS] ${forums.length} foros cargados`);

    } catch (error) {
        console.error('[FORUMS] Error cargando foros:', error);
        showError('Error al cargar los foros. Intenta de nuevo.');
    }
}

/**
 * Crear tarjeta de foro
 */
function createForumCard(forum) {
    const card = document.createElement('div');
    card.className = 'forum-card';
    card.setAttribute('data-forum-id', forum.id);

    const messageCount = forum.messageCount || 0;
    const lastActivity = forum.lastActivity ? new Date(forum.lastActivity).toLocaleDateString('es-ES') : 'Sin actividad';

    card.innerHTML = `
        <div class="forum-card-header">
            <div>
                <h3 class="forum-name">${forum.name}</h3>
                <p class="forum-description">${forum.description || 'Sin descripción'}</p>
            </div>
            <div class="forum-stats">
                <span class="forum-message-count">${messageCount} mensajes</span>
                <span class="forum-last-activity">${lastActivity}</span>
            </div>
        </div>
    `;

    // Event listener
    card.addEventListener('click', () => openForum(forum.id, forum.name));

    return card;
}

/**
 * Abrir foro seleccionado
 */
async function openForum(forumId, forumName) {
    try {
        console.log('[FORUM] Abriendo foro:', forumId);

        currentForumId = forumId;
        currentPage = 1;
        hasMoreMessages = true;
        lastMessageTime = null;

        // Actualizar UI
        document.getElementById('forum-title').textContent = forumName;
        document.getElementById('forums-list').classList.remove('active');
        document.getElementById('forum-chat').classList.add('active');

        // Limpiar mensajes anteriores
        document.getElementById('messages-list').innerHTML = '';

        // Cargar mensajes iniciales
        await loadMessages(true);

        // Iniciar actualizaciones en vivo
        startLiveUpdates();

        // Scroll al final
        scrollToBottom();

    } catch (error) {
        console.error('[FORUM] Error abriendo foro:', error);
        showError('Error al abrir el foro');
    }
}

/**
 * Mostrar lista de foros
 */
function showForumsList() {
    // Detener actualizaciones en vivo
    stopLiveUpdates();

    // Limpiar estado
    currentForumId = null;
    currentPage = 1;
    hasMoreMessages = true;
    lastMessageTime = null;

    // Actualizar UI
    document.getElementById('forum-chat').classList.remove('active');
    document.getElementById('forums-list').classList.add('active');
}

/**
 * Cargar mensajes del foro
 */
async function loadMessages(isInitial = false) {
    if (isLoading || (!hasMoreMessages && !isInitial)) return;

    try {
        isLoading = true;
        console.log(`[MESSAGES] Cargando página ${currentPage}...`);

        // Mostrar indicador de carga
        if (!isInitial) {
            document.getElementById('loading-indicator').style.display = 'flex';
        }

        const response = await fetch(`/api/forums/${currentForumId}/messages?page=${currentPage}&limit=15`, {
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
        const messages = result.data || [];
        const pagination = result.pagination || {};

        console.log(`[MESSAGES] ${messages.length} mensajes cargados`);

        // Ocultar indicador de carga
        document.getElementById('loading-indicator').style.display = 'none';

        if (messages.length === 0 && isInitial) {
            showEmptyMessages();
            return;
        }

        // Agregar mensajes a la UI
        const messagesList = document.getElementById('messages-list');
        const wasAtBottom = isNearBottom();

        if (isInitial) {
            // Para carga inicial, agregar al final
            messages.reverse().forEach(message => {
                const messageElement = createMessageElement(message);
                messagesList.appendChild(messageElement);
            });
        } else {
            // Para carga infinita, agregar al inicio
            const fragment = document.createDocumentFragment();
            messages.forEach(message => {
                const messageElement = createMessageElement(message);
                fragment.appendChild(messageElement);
            });
            messagesList.insertBefore(fragment, messagesList.firstChild);
        }

        // Actualizar estado de paginación
        currentPage++;
        hasMoreMessages = currentPage <= pagination.totalPages;

        // Actualizar timestamp del último mensaje
        if (messages.length > 0) {
            lastMessageTime = messages[messages.length - 1].created_at;
        }

        // Mantener scroll si no estaba al final
        if (!isInitial && !wasAtBottom) {
            // El scroll se mantiene automáticamente al insertar al inicio
        }

        isLoading = false;

    } catch (error) {
        console.error('[MESSAGES] Error cargando mensajes:', error);
        document.getElementById('loading-indicator').style.display = 'none';
        isLoading = false;
        showError('Error al cargar mensajes');
    }
}

/**
 * Crear elemento de mensaje
 */
function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-item';
    messageDiv.setAttribute('data-message-id', message.id);

    const userImg = message.userImg || '/assets/icons/user-default.png';
    const createdAt = new Date(message.created_at).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    messageDiv.innerHTML = `
        <div class="message-content">
            <img src="/assets/profiles/${userImg}" alt="${message.userName}" class="message-avatar" loading="lazy">
            <div class="message-body">
                <div class="message-header">
                    <span class="message-author">${message.userName} ${message.userLastName || ''}</span>
                    <span class="message-level">Lv.${message.userLevel || 1}</span>
                    <span class="message-time">${createdAt}</span>
                </div>
                <div class="message-text">
                    <p>${formatMessageText(message.text)}</p>
                </div>
            </div>
        </div>
    `;

    return messageDiv;
}

/**
 * Formatear texto del mensaje
 */
function formatMessageText(text) {
    return text
        .replace(/\n/g, '<br>')
        .replace(/\s{2,}/g, ' ');
}

/**
 * Mostrar estado vacío de mensajes
 */
function showEmptyMessages() {
    const messagesList = document.getElementById('messages-list');
    messagesList.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">💭</div>
            <p class="empty-message">No hay mensajes aún</p>
            <p class="empty-submessage">¡Sé el primero en iniciar la conversación!</p>
        </div>
    `;
}

/**
 * Manejar envío de mensaje
 */
async function handleSendMessage(e) {
    e.preventDefault();

    const messageInput = document.getElementById('message-input');
    const text = messageInput.value.trim();

    if (!text) return;

    try {
        console.log('[MESSAGE] Enviando mensaje...');

        const response = await fetch(`/api/forums/${currentForumId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ text })
        });

        const result = await response.json();

        if (response.ok) {
            console.log('[MESSAGE] Mensaje enviado exitosamente');
            messageInput.value = '';
            updateCharCounter();

            // Recargar mensajes para mostrar el nuevo
            await loadLatestMessages();

            // Scroll al final
            scrollToBottom();
        } else {
            showError(result.message || 'Error al enviar mensaje');
        }

    } catch (error) {
        console.error('[MESSAGE] Error enviando mensaje:', error);
        showError('Error de conexión. Intenta de nuevo.');
    }
}

/**
 * Cargar mensajes más recientes (para actualizaciones en vivo)
 */
async function loadLatestMessages() {
    try {
        const response = await fetch(`/api/forums/${currentForumId}/messages?page=1&limit=10`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (!response.ok) return;

        const result = await response.json();
        const newMessages = result.data || [];

        const messagesList = document.getElementById('messages-list');
        const existingMessageIds = new Set();

        // Obtener IDs de mensajes existentes
        messagesList.querySelectorAll('.message-item').forEach(item => {
            existingMessageIds.add(parseInt(item.dataset.messageId));
        });

        // Agregar solo mensajes nuevos
        let hasNewMessages = false;
        newMessages.reverse().forEach(message => {
            if (!existingMessageIds.has(message.id)) {
                const messageElement = createMessageElement(message);
                messagesList.appendChild(messageElement);
                hasNewMessages = true;
            }
        });

        // Scroll al final si hay mensajes nuevos y estaba cerca del final
        if (hasNewMessages && isNearBottom()) {
            scrollToBottom();
        }

    } catch (error) {
        console.error('[LIVE UPDATE] Error cargando mensajes recientes:', error);
    }
}

/**
 * Manejar scroll infinito
 */
function handleScroll() {
    const messagesList = document.getElementById('messages-list');

    // Si está cerca del top (20px), cargar más mensajes
    if (messagesList.scrollTop <= 20) {
        loadMessages(false);
    }
}

/**
 * Verificar si el scroll está cerca del bottom
 */
function isNearBottom() {
    const messagesList = document.getElementById('messages-list');
    const threshold = 100; // 100px del bottom
    return messagesList.scrollHeight - messagesList.scrollTop - messagesList.clientHeight <= threshold;
}

/**
 * Scroll al final de los mensajes
 */
function scrollToBottom() {
    setTimeout(() => {
        const messagesList = document.getElementById('messages-list');
        messagesList.scrollTop = messagesList.scrollHeight;
    }, 100);
}

/**
 * Actualizar contador de caracteres
 */
function updateCharCounter() {
    const messageInput = document.getElementById('message-input');
    const charCounter = document.getElementById('char-counter');
    const sendBtn = document.getElementById('send-btn');

    const length = messageInput.value.length;
    charCounter.textContent = `${length}/500`;

    // Habilitar/deshabilitar botón
    sendBtn.disabled = length === 0 || length > 500;

    // Cambiar color del contador
    if (length > 450) {
        charCounter.style.color = '#ff5722';
    } else if (length > 400) {
        charCounter.style.color = '#ff9800';
    } else {
        charCounter.style.color = 'var(--text-muted)';
    }

    // Auto-resize del textarea
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
}

/**
 * Manejar tecla Enter en el input
 */
function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('message-form').dispatchEvent(new Event('submit'));
    }
}

/**
 * Iniciar actualizaciones en vivo
 */
function startLiveUpdates() {
    stopLiveUpdates(); // Asegurar que no haya intervalos previos

    liveUpdateInterval = setInterval(() => {
        if (document.getElementById('forum-chat').classList.contains('active')) {
            loadLatestMessages();
        }
    }, 5000); // Actualizar cada 5 segundos

    console.log('[LIVE UPDATE] Actualizaciones en vivo iniciadas');
}

/**
 * Detener actualizaciones en vivo
 */
function stopLiveUpdates() {
    if (liveUpdateInterval) {
        clearInterval(liveUpdateInterval);
        liveUpdateInterval = null;
        console.log('[LIVE UPDATE] Actualizaciones en vivo detenidas');
    }
}

/**
 * Mostrar error
 */
function showError(message) {
    // Crear toast de error
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: #f44336;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 1000;
        animation: slideDown 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Cleanup al salir de la página
window.addEventListener('beforeunload', () => {
    stopLiveUpdates();
});

console.log('[FORUM] Script cargado correctamente');