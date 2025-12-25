/**
 * Verifica si hay sesión activa y redirige si no la hay
 */
function checkAuth() {
    // Verificar si existe userData en localStorage
    const userData = localStorage.getItem('userData');
    
    // Verificar si existe token en cookies
    const hasToken = document.cookie.split(';').some(cookie => 
        cookie.trim().startsWith('token=')
    );
    
    console.log('[AUTH CHECK]', {
        hasUserData: !!userData,
        hasToken: hasToken,
        currentPath: window.location.pathname
    });
    
    // Si no hay datos O no hay token, redirigir a login
    if (!userData || !hasToken) {
        console.log('[AUTH CHECK] No hay sesión activa, redirigiendo a /login');
        window.location.href = '/login';
        return false;
    }
    
    return true;
}

// Ejecutar al cargar cualquier página protegida
if (window.location.pathname !== '/login' && 
    window.location.pathname !== '/register' && 
    window.location.pathname !== '/logout') {
    checkAuth();
}