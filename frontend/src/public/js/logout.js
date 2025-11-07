document.addEventListener('DOMContentLoaded', function() {
    console.log('[LOGOUT] Iniciando proceso de logout...');
    performLogout();
});

/**
 * Función principal que realiza el logout completo
 */
function performLogout() {
    try {
        console.log('[LOGOUT] Limpiando sesión...');
        
        // 1. Limpiar localStorage - ESPECÍFICAMENTE userData
        localStorage.removeItem('userData');
        localStorage.removeItem('userSession');
        localStorage.clear();
        console.log('[LOGOUT] localStorage limpiado');
        
        // 2. Limpiar sessionStorage
        sessionStorage.clear();
        console.log('[LOGOUT] sessionStorage limpiado');
        
        // 3. Limpiar TODAS las cookies
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            
            // Eliminar cookie en todas las rutas posibles
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/admin;`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api;`;
        }
        
        // Eliminar token específicamente
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        console.log('[LOGOUT] Cookies eliminadas');
        
        // 4. Redirigir a login
        setTimeout(() => {
            window.location.href = '/login';
        }, 500);
        
    } catch (error) {
        console.error('[LOGOUT ERROR]', error);
        window.location.href = '/login';
    }
}

// Función global para logout desde cualquier parte
window.logout = performLogout;

// Exportar las funciones para testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        clearAllCookies,
        clearLocalStorage,
        clearSessionStorage,
        logout,
        performLogout
    };
}