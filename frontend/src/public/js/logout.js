document.addEventListener('DOMContentLoaded', function() {
    console.log('[LOGOUT] Iniciando proceso de logout...');
    
    // Ejecutar logout inmediatamente
    performLogout();
});

/**
 * Función principal que realiza el logout completo
 */
function performLogout() {
    try {
        // 1. Borrar todas las cookies
        clearAllCookies();
        
        // 2. Borrar localStorage
        clearLocalStorage();
        
        // 3. Borrar sessionStorage
        clearSessionStorage();
        
        // 4. Redirigir a login
        redirectToLogin();
        
    } catch (error) {
        console.error('[LOGOUT ERROR]', error);
        // Asegurar redirección incluso si hay error
        setTimeout(() => {
            window.location.href = '/login';
        }, 1000);
    }
}

/**
 * Borra todas las cookies del dominio
 */
function clearAllCookies() {
    try {
        const cookies = document.cookie.split(';');
        
        console.log('[LOGOUT] Cookies encontradas:', cookies.length);
        
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            
            // Borrar cada cookie estableciendo fecha de expiración en el pasado
            document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            
            // También borrar para subrutas específicas
            document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/admin;';
            document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api;';
            
            console.log('[LOGOUT] Cookie eliminada:', name);
        }
        
        // Borrar cookies comunes específicamente
        const commonCookies = ['token', 'session', 'user', 'auth', 'refreshToken'];
        commonCookies.forEach(cookieName => {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/admin;`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api;`;
        });
        
    } catch (error) {
        console.error('[LOGOUT] Error borrando cookies:', error);
    }
}

/**
 * Borra todo el localStorage
 */
function clearLocalStorage() {
    try {
        const itemsCount = localStorage.length;
        console.log('[LOGOUT] Elementos en localStorage:', itemsCount);
        
        // Borrar elementos específicos primero
        const importantKeys = ['token', 'userSession', 'authToken', 'user', 'session'];
        importantKeys.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                console.log('[LOGOUT] localStorage eliminado:', key);
            }
        });
        
        // Borrar todo el localStorage
        localStorage.clear();
        console.log('[LOGOUT] localStorage completamente limpiado');
        
    } catch (error) {
        console.error('[LOGOUT] Error borrando localStorage:', error);
    }
}

/**
 * Borra todo el sessionStorage
 */
function clearSessionStorage() {
    try {
        const itemsCount = sessionStorage.length;
        console.log('[LOGOUT] Elementos en sessionStorage:', itemsCount);
        
        sessionStorage.clear();
        console.log('[LOGOUT] sessionStorage completamente limpiado');
        
    } catch (error) {
        console.error('[LOGOUT] Error borrando sessionStorage:', error);
    }
}

/**
 * Redirige a la página de login con mensaje
 */
function redirectToLogin() {
    console.log('[LOGOUT] Redirigiendo a login...');
    
    // Pequeño delay para asegurar que todo se borró
    setTimeout(() => {
        // Agregar parámetro para mostrar mensaje de logout exitoso
        window.location.href = '/login?logout=success';
    }, 500);
}

/**
 * Función para hacer logout desde cualquier parte de la aplicación
 * (Útil para llamar desde otros archivos JS)
 */
function logout() {
    console.log('[LOGOUT] Ejecutando logout global...');
    performLogout();
}

// Hacer la función disponible globalmente
window.logout = logout;