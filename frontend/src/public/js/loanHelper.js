/**
 * Helper para gestionar préstamos de manera unificada
 */

/**
 * Solicitar préstamo de un item (libro o útil)
 * @param {number} itemId - ID del item a solicitar
 * @param {string} type - Tipo de item: 'book' o 'supply'
 * @param {string} itemName - Nombre del item (para mostrar en el mensaje)
 * @returns {Promise<Object>} - Resultado de la solicitud
 */
async function requestLoan(itemId, type, itemName = '') {
    try {
        console.log('[LOAN REQUEST]', { itemId, type, itemName });

        const response = await fetch('/api/loans/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                itemId: itemId,
                type: type
            })
        });

        const result = await response.json();

        if (response.ok) {
            console.log('[LOAN REQUEST] ✅ Préstamo solicitado:', result);
            
            // Mostrar alerta de éxito
            const typeLabel = type === 'book' ? 'libro' : 'útil';
            const displayName = itemName || `${typeLabel} #${itemId}`;
            
            showLoanSuccessAlert(displayName, result.data);
            
            // Agregar notificación al carrusel
            addLoanNotification(displayName, result.data);
            
            return {
                success: true,
                data: result.data,
                message: result.message
            };
        } else {
            console.error('[LOAN REQUEST] ❌ Error:', result.message);
            
            // Mostrar alerta de error
            showLoanErrorAlert(result.message);
            
            return {
                success: false,
                message: result.message
            };
        }
    } catch (error) {
        console.error('[LOAN REQUEST] ❌ Error de conexión:', error);
        showLoanErrorAlert('Error de conexión. Intenta de nuevo.');
        
        return {
            success: false,
            message: 'Error de conexión'
        };
    }
}

/**
 * Mostrar alerta de éxito
 */
function showLoanSuccessAlert(itemName, loanData) {
    const message = `✅ Préstamo solicitado correctamente

📦 Item: ${itemName}
📅 Fecha límite de devolución: ${formatDate(loanData.dateOut)}
⏰ Plazo: 14 días
📋 Estado: Listo para retirar

Puedes pasar por la biblioteca a retirar tu préstamo.`;

    alert(message);
}

/**
 * Mostrar alerta de error
 */
function showLoanErrorAlert(message) {
    alert(`❌ Error al solicitar préstamo\n\n${message}`);
}

/**
 * Agregar notificación al carrusel de notificaciones del usuario
 */
async function addLoanNotification(itemName, loanData) {
    try {
        // Obtener notificaciones actuales del localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        const notification = {
            id: Date.now(),
            type: 'loan_request',
            title: 'Préstamo Listo',
            message: `Tu préstamo de "${itemName}" está listo para retirar en la biblioteca.`,
            itemName: itemName,
            loanId: loanData.loanId,
            state: loanData.state || 'espera',
            dateOut: loanData.dateOut,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        // Guardar en userData (si existe el campo de notificaciones)
        if (!userData.notifications) {
            userData.notifications = [];
        }
        
        userData.notifications.unshift(notification);
        
        // Limitar a las últimas 20 notificaciones
        if (userData.notifications.length > 20) {
            userData.notifications = userData.notifications.slice(0, 20);
        }
        
        localStorage.setItem('userData', JSON.stringify(userData));
        
        console.log('[NOTIFICATION] ✅ Notificación agregada:', notification);
        
        // Disparar evento personalizado para actualizar UI si está escuchando
        window.dispatchEvent(new CustomEvent('newNotification', { detail: notification }));
        
    } catch (error) {
        console.error('[NOTIFICATION] ❌ Error al agregar notificación:', error);
    }
}

/**
 * Formatear fecha para mostrar
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
}

/**
 * Obtener notificaciones de préstamos del usuario
 */
function getLoanNotifications() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        return userData.notifications || [];
    } catch (error) {
        console.error('[NOTIFICATIONS] Error al obtener notificaciones:', error);
        return [];
    }
}

/**
 * Marcar notificación como leída
 */
function markNotificationAsRead(notificationId) {
    try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (userData.notifications) {
            const notification = userData.notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.read = true;
                localStorage.setItem('userData', JSON.stringify(userData));
                console.log('[NOTIFICATION] ✅ Notificación marcada como leída:', notificationId);
            }
        }
    } catch (error) {
        console.error('[NOTIFICATION] Error al marcar como leída:', error);
    }
}

// Exportar funciones para uso global
window.requestLoan = requestLoan;
window.getLoanNotifications = getLoanNotifications;
window.markNotificationAsRead = markNotificationAsRead;

console.log('[LOAN HELPER] ✅ Módulo cargado');
