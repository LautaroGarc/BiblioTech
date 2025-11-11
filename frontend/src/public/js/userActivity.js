let currentFilter = 'todas';
let currentUser = null;
let notifications = [];

// Inicializar usuario
document.addEventListener('DOMContentLoaded', async function() {
  // Obtener datos del usuario
  const userData = JSON.parse(localStorage.getItem('userData'));
  if (!userData) {
    console.error('[ACTIVITY] No hay datos de usuario');
    window.location.href = '/login';
    return;
  }
  
  currentUser = userData;
  console.log('[ACTIVITY] Usuario cargado:', currentUser.email);
  
  // Cargar notificaciones
  await loadUserNotifications();
  
  // Event listeners para los filtros
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', async () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      await renderNotifications(currentFilter);
    });
  });
  
  // Renderizar notificaciones iniciales
  await renderNotifications(currentFilter);
});

// Función para cargar notificaciones del usuario desde localStorage y API
async function loadUserNotifications() {
  try {
    notifications = [];
    
    // Cargar notificaciones del localStorage (solicitudes recientes)
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      if (userData.notifications && Array.isArray(userData.notifications)) {
        userData.notifications.forEach(localNotif => {
          const state = localNotif.state || 'espera';
          let icon, badge;
          
          if (state === 'no aprobado') {
            icon = '⏳';
            badge = 'Por Aprobar';
          } else if (state === 'espera') {
            icon = '📦';
            badge = 'Listo';
          } else {
            icon = '📚';
            badge = 'Activo';
          }
          
          notifications.push({
            id: `local-${localNotif.id}`,
            type: 'alquileres',
            icon: icon,
            iconClass: 'icon-alquiler',
            title: localNotif.title || 'Préstamo',
            description: localNotif.message || localNotif.itemName,
            date: getTimeAgo(new Date(localNotif.timestamp).getTime()),
            badge: badge,
            unread: !localNotif.read,
            timestamp: new Date(localNotif.timestamp).getTime()
          });
        });
      }
    } catch (error) {
      console.error('[ACTIVITY] Error cargando notificaciones de localStorage:', error);
    }
    
    // Cargar préstamos del usuario desde la API
    const loansResponse = await fetch('/api/loans/me', {
      credentials: 'include'
    });
    
    if (loansResponse.ok) {
      const loansData = await loansResponse.json();
      const loans = loansData.data || loansData.loans || [];
      
      console.log('[ACTIVITY] Préstamos cargados desde API:', loans.length);
      
      // Generar notificaciones desde los préstamos
      loans.forEach(loan => {
        const itemName = loan.itemName || loan.item_name || loan.book_name || 'Item';
        const itemType = loan.type || loan.item_type || (loan.book_name ? 'libro' : 'útil');
        const loanState = loan.state || loan.status || 'espera';
        const dateIn = loan.dateIn || loan.created_at;
        
        // Notificación de préstamo no aprobado (pendiente de aprobación)
        if (loanState === 'no aprobado') {
          notifications.push({
            id: `loan-pending-${loan.id}`,
            type: 'alquileres',
            icon: '⏳',
            iconClass: 'icon-alquiler',
            title: 'Préstamo por aceptar',
            description: `${itemType === 'book' ? 'Libro' : 'Útil'}: "${itemName}" - En espera de aprobación`,
            date: getTimeAgo(new Date(dateIn).getTime()),
            badge: 'Por Aprobar',
            unread: true,
            timestamp: new Date(dateIn).getTime()
          });
        }
        
        // Notificación de préstamo en espera (aprobado, esperando retiro)
        else if (loanState === 'espera') {
          notifications.push({
            id: `loan-${loan.id}`,
            type: 'alquileres',
            icon: '📦',
            iconClass: 'icon-alquiler',
            title: 'Préstamo aprobado',
            description: `${itemType === 'book' ? 'Libro' : 'Útil'}: "${itemName}" - Listo para retirar`,
            date: getTimeAgo(new Date(dateIn).getTime()),
            badge: 'Listo',
            unread: true,
            timestamp: new Date(dateIn).getTime()
          });
        }
        
        // Notificación de préstamo activo
        else if (loanState === 'en prestamo') {
          notifications.push({
            id: `loan-${loan.id}`,
            type: 'alquileres',
            icon: '📚',
            iconClass: 'icon-alquiler',
            title: 'Préstamo activo',
            description: `${itemType === 'book' ? 'Libro' : 'Útil'}: "${itemName}"`,
            date: getTimeAgo(new Date(dateIn).getTime()),
            badge: 'Activo',
            unread: false,
            timestamp: new Date(dateIn).getTime()
          });
        }
        
        // Notificación de devolución
        if (loanState === 'devuelto') {
          notifications.push({
            id: `return-${loan.id}`,
            type: 'devoluciones',
            icon: '✅',
            iconClass: 'icon-devolucion',
            title: 'Devolución completada',
            description: `Has devuelto "${itemName}"`,
            date: getTimeAgo(new Date(loan.dateOut).getTime()),
            badge: 'Completado',
            unread: false,
            timestamp: new Date(loan.dateOut).getTime()
          });
        }
        
        // Notificación de recordatorio (si está próximo a vencer)
        if (loanState === 'en prestamo' && loan.dateOut) {
          const daysUntilDue = Math.ceil((new Date(loan.dateOut).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          if (daysUntilDue <= 3 && daysUntilDue > 0) {
            notifications.push({
              id: `reminder-${loan.id}`,
              type: 'recordatorios',
              icon: '⏰',
              iconClass: 'icon-recordatorio',
              title: 'Recordatorio de devolución',
              description: `"${itemName}" debe devolverse en ${daysUntilDue} día${daysUntilDue > 1 ? 's' : ''}`,
              date: 'Recordatorio',
              badge: 'Urgente',
              unread: true,
              timestamp: Date.now()
            });
          } else if (daysUntilDue <= 0) {
            notifications.push({
              id: `overdue-${loan.id}`,
              type: 'recordatorios',
              icon: '⚠️',
              iconClass: 'icon-recordatorio',
              title: 'Préstamo vencido',
              description: `"${itemName}" debió devolverse hace ${Math.abs(daysUntilDue)} día${Math.abs(daysUntilDue) > 1 ? 's' : ''}`,
              date: 'Vencido',
              badge: 'Atrasado',
              unread: true,
              timestamp: Date.now()
            });
          }
        }
        
        // Notificación de préstamo atrasado
        if (loanState === 'atrasado') {
          const daysOverdue = Math.ceil((Date.now() - new Date(loan.dateOut).getTime()) / (1000 * 60 * 60 * 24));
          notifications.push({
            id: `overdue-${loan.id}`,
            type: 'recordatorios',
            icon: '⚠️',
            iconClass: 'icon-recordatorio',
            title: 'Préstamo atrasado',
            description: `"${itemName}" debió devolverse hace ${daysOverdue} día${daysOverdue > 1 ? 's' : ''}`,
            date: 'Atrasado',
            badge: 'Urgente',
            unread: true,
            timestamp: Date.now()
          });
        }
      });
    }
    
    // Ordenar por timestamp (más reciente primero)
    notifications.sort((a, b) => b.timestamp - a.timestamp);
    
    console.log('[ACTIVITY] Notificaciones cargadas:', notifications.length);
    
  } catch (error) {
    console.error('[ACTIVITY] Error cargando notificaciones:', error);
    notifications = [];
  }
}

// Función para guardar notificaciones (ya no necesaria con API)
async function saveUserNotifications(notifications) {
  // Ya no guardamos en localStorage, todo viene de la API
  console.log('[ACTIVITY] Las notificaciones se gestionan desde la API');
}

// Función para agregar una nueva notificación manualmente (para testing)
async function addNotification(type, title, description, badge = 'Nuevo') {
  const newNotification = {
    id: `manual-${Date.now()}`,
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

  notifications.unshift(newNotification);
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
  
  if (!container || !emptyState) return;
  
  // Actualizar fechas relativas
  const updatedNotifications = notifications.map(n => ({
    ...n,
    date: getTimeAgo(n.timestamp)
  }));

  let filteredNotifications = updatedNotifications;
  if (filter !== 'todas') {
    filteredNotifications = updatedNotifications.filter(n => n.type === filter);
  }

  if (filteredNotifications.length === 0) {
    container.style.display = 'none';
    emptyState.style.display = 'flex';
    return;
  }

  container.style.display = 'flex';
  emptyState.style.display = 'none';

  container.innerHTML = filteredNotifications.map(notification => `
    <div class="notification-card ${notification.unread ? 'unread' : ''}" onclick="markAsRead('${notification.id}')">
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
  const notification = notifications.find(n => n.id === id);
  if (notification && notification.unread) {
    notification.unread = false;
    await renderNotifications(currentFilter);
  }
}

// Función para recargar notificaciones
async function reloadNotifications() {
  await loadUserNotifications();
  await renderNotifications(currentFilter);
}

// Actualizar notificaciones cada 30 segundos
setInterval(reloadNotifications, 30000);

// Función global para agregar notificaciones desde otras páginas (ya no es necesaria pero la mantenemos para compatibilidad)
window.BiblioTechNotifications = {
  reload: reloadNotifications,
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

