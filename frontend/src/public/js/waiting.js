document.addEventListener('DOMContentLoaded', function() {
    // Verificar que tenga sesión pero NO esté aceptado
    if (!requireWaiting()) {
        return; // Ya redirigió
    }
    
    // Mostrar info del usuario desde CACHÉ
    displayUserInfo();
    
    // Auto-verificar aprobación cada 30 segundos
    setInterval(checkApproval, 30000);
});

/**
 * Mostrar información del usuario desde caché
 * NO hace request, solo lee localStorage
 */
function displayUserInfo() {
    const userInfo = getUserInfo();
    
    if (!userInfo) {
        console.error('[WAITING] No hay usuario en caché');
        logout();
        return;
    }
    
    document.getElementById('userName').textContent = userInfo.fullName;
    document.getElementById('userEmail').textContent = userInfo.email;
    
    console.log('[WAITING] Mostrando info desde caché:', userInfo.email);
}

/**
 * Verificar si el usuario fue aprobado
 * Hace request al backend y actualiza caché si cambió
 */
async function checkApproval() {
    try {
        showMessage('Verificando estado...', 'info');
        
        const response = await authenticatedFetch('/api/users/me');
        
        if (response.ok) {
            const data = await response.json();
            
            // Actualizar caché con datos frescos del backend
            updateUser(data.user);
            markCacheUpdate('user_last_check');
            
            console.log('[WAITING] Datos actualizados desde backend:', data.user);
            
            // Si fue aceptado, redirigir
            if (data.user.accepted) {
                showMessage('¡Tu cuenta ha sido aprobada! Redirigiendo...', 'success');
                
                setTimeout(() => {
                    window.location.href = '/home';
                }, 2000);
            } else {
                showMessage('Aún no has sido aprobado. Seguiremos verificando...', 'info');
                
                setTimeout(() => {
                    clearStatusMessage();
                }, 3000);
            }
        } else {
            showMessage('Error al verificar el estado', 'error');
        }
        
    } catch (error) {
        console.error('[WAITING] Error verificando aprobación:', error);
        showMessage('Error de conexión', 'error');
    }
}

function showMessage(message, type) {
    // Remover mensaje anterior si existe
    clearStatusMessage();
    
    // Crear nuevo mensaje
    const msgDiv = document.createElement('div');
    msgDiv.className = `status-message ${type}`;
    msgDiv.id = 'statusMessage';
    msgDiv.textContent = message;
    
    const container = document.querySelector('.waiting-content');
    const checkBtn = container.querySelector('.btn-check');
    container.insertBefore(msgDiv, checkBtn);
}

function clearStatusMessage() {
    const existingMsg = document.getElementById('statusMessage');
    if (existingMsg) {
        existingMsg.remove();
    }
}