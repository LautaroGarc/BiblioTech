let currentFilter = 'todas';
let currentUserId = 'user123'; // En producción, esto vendría de la sesión del usuario

// Función para cargar notificaciones del usuario
async function loadUserNotifications() {
  try {
    const result = await window.storage.get(`notifications:${currentUserId}`);
    if (result && result.value) {
      return JSON.parse(result.value);
    }
    return [];
  } catch (error) {
    console.log('No hay notificaciones previas, iniciando con array vacío');
    return [];
  }
}

// Función para guardar notificaciones
async function saveUserNotifications(notifications) {
  try {
    await window.storage.set(`notifications:${currentUserId}`, JSON.stringify(notifications));
  } catch (error) {
    console.error('Error guardando notificaciones:', error);
  }
}

// Función para agregar una nueva notificación
async function addNotification(type, title, description, badge = 'Nuevo') {
  const notifications = await loadUserNotifications();
  
  const newNotification = {
    id: Date.now(),
    type: type,
    icon: getIconForType(type),
    iconClass: getIconClassForType(type),
    title: title,
    description: description,
    date: 'Ahora',
    badge: badge,
    unread: true,
    timestamp: Date.now()
  };

  notifications.unshift(newNotification); // Agregar al inicio
  await saveUserNotifications(notifications);
  await renderNotifications(currentFilter);
}

// Obtener icono según tipo
function getIconForType(type) {
  const icons = {
    'alquileres': '📚',
    'devoluciones': '✅',
    'clubes': '👥',
    'recordatorios': '⏰',
    'reserva': '📅'
  };
  return icons[type] || '📋';
}

// Obtener clase de icono según tipo
function getIconClassForType(type) {
  const classes = {
    'alquileres': 'icon-alquiler',
    'devoluciones': 'icon-devolucion',
    'clubes': 'icon-club',
    'recordatorios': 'icon-recordatorio',
    'reserva': 'icon-reserva'
  };
  return classes[type] || 'icon-alquiler';
}

// Calcular tiempo transcurrido
function getTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  
  if (seconds < 60) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  if (days < 7) return days === 1 ? 'Ayer' : `Hace ${days} días`;
  return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
}

// Función para renderizar notificaciones
async function renderNotifications(filter = 'todas') {
  const container = document.getElementById('notificationsList');
  const emptyState = document.getElementById('emptyState');
  
  let notifications = await loadUserNotifications();
  
  // Actualizar fechas relativas
  notifications = notifications.map(n => ({
    ...n,
    date: getTimeAgo(n.timestamp)
  }));

  let filteredNotifications = notifications;
  if (filter !== 'todas') {
    filteredNotifications = notifications.filter(n => n.type === filter);
  }

  if (filteredNotifications.length === 0) {
    container.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  container.style.display = 'flex';
  emptyState.style.display = 'none';

  container.innerHTML = filteredNotifications.map(notification => `
    <div class="notification-card ${notification.unread ? 'unread' : ''}" onclick="markAsRead(${notification.id})">
      <div class="notification-top">
        <div class="notification-icon ${notification.iconClass}">
          ${notification.icon}
        </div>
        <div class="notification-content">
          <div class="notification-header">
            <div>
              <div class="notification-title">${notification.title}</div>
              <div class="notification-description">${notification.description}</div>
              <div class="notification-date">${notification.date}</div>
            </div>
            <span class="notification-badge">${notification.badge}</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Función para marcar como leída
async function markAsRead(id) {
  const notifications = await loadUserNotifications();
  const notification = notifications.find(n => n.id === id);
  if (notification && notification.unread) {
    notification.unread = false;
    await saveUserNotifications(notifications);
    await renderNotifications(currentFilter);
  }
}

// Event listeners para los filtros
document.querySelectorAll('.filter-tab').forEach(tab => {
  tab.addEventListener('click', async () => {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    await renderNotifications(currentFilter);
  });
});

// Renderizar al cargar la página
renderNotifications();

// Función global para agregar notificaciones desde otras páginas
window.BiblioTechNotifications = {
  addAlquiler: async (itemName, itemType = 'libro') => {
    await addNotification(
      'alquileres',
      'Alquiler confirmado',
      `Has alquilado "${itemName}"`,
      'Activo'
    );
  },
  addDevolucion: async (itemName) => {
    await addNotification(
      'devoluciones',
      'Devolución completada',
      `Has devuelto "${itemName}" correctamente`,
      'Completado'
    );
  },
  addClub: async (clubName) => {
    await addNotification(
      'clubes',
      'Club de Lectura',
      `Te has unido al club "${clubName}"`,
      'Nuevo'
    );
  },
  addRecordatorio: async (itemName, dias) => {
    await addNotification(
      'recordatorios',
      'Recordatorio de devolución',
      `El ${dias === 1 ? 'libro' : 'item'} "${itemName}" debe ser devuelto en ${dias} día${dias > 1 ? 's' : ''}`,
      'Pendiente'
    );
  }
  
};


