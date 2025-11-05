/**
 * Helper de Autenticación - Frontend
 * Gestiona tokens, caché y redirecciones del lado del cliente
 */

// ========== GESTIÓN DE SESIÓN ==========

/**
 * Verificar si hay sesión activa (usa caché)
 */
function isAuthenticated() {
    const token = getToken();
    const user = getUser();
    
    if (!token || !user) {
        return false;
    }
    
    // Verificar si el token no expiró
    if (isTokenExpired(token)) {
        clearSession();
        return false;
    }
    
    return true;
}

/**
 * Verificar si el token está expirado
 */
function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch (error) {
        console.error('Error verificando expiración del token:', error);
        return true; // Si hay error, considerar expirado
    }
}

/**
 * Obtener token del caché
 */
function getToken() {
    return localStorage.getItem('token');
}

/**
 * Obtener usuario del caché
 */
function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

/**
 * Guardar token en caché
 */
function setToken(token) {
    localStorage.setItem('token', token);
}

/**
 * Guardar usuario en caché
 */
function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Actualizar datos del usuario en caché
 */
function updateUser(updates) {
    const currentUser = getUser();
    if (!currentUser) return null;
    
    const updatedUser = { ...currentUser, ...updates };
    setUser(updatedUser);
    return updatedUser;
}

/**
 * Verificar si usuario está aceptado (usa caché)
 */
function isAccepted() {
    const user = getUser();
    return user ? user.accepted === true : false;
}

/**
 * Obtener tipo de usuario (usa caché)
 */
function getUserType() {
    const user = getUser();
    return user ? user.type : null;
}

/**
 * Limpiar sesión (borrar caché)
 */
function clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

// ========== PROTECCIÓN DE RUTAS ==========

/**
 * Proteger página privada (requiere sesión + aceptación)
 * Llamar al inicio de páginas como home, profile, etc.
 */
function requireAuth() {
    if (!isAuthenticated()) {
        console.log('[AUTH] No hay sesión activa, redirigiendo a login');
        window.location.href = '/login';
        return false;
    }
    
    if (!isAccepted()) {
        console.log('[AUTH] Usuario no aceptado, redirigiendo a waiting');
        window.location.href = '/waiting';
        return false;
    }
    
    return true;
}

/**
 * Redirigir si ya hay sesión (para login/register)
 * Llamar al inicio de páginas públicas
 */
function redirectIfAuthenticated() {
    if (!isAuthenticated()) {
        return false; // No hay sesión, permitir acceso
    }
    
    if (isAccepted()) {
        console.log('[AUTH] Usuario autenticado y aceptado, redirigiendo a home');
        window.location.href = '/home';
    } else {
        console.log('[AUTH] Usuario autenticado pero no aceptado, redirigiendo a waiting');
        window.location.href = '/waiting';
    }
    
    return true;
}

/**
 * Verificar que solo usuarios NO aceptados accedan (para /waiting)
 */
function requireWaiting() {
    if (!isAuthenticated()) {
        console.log('[AUTH] No hay sesión activa, redirigiendo a login');
        window.location.href = '/login';
        return false;
    }
    
    if (isAccepted()) {
        console.log('[AUTH] Usuario ya aceptado, redirigiendo a home');
        window.location.href = '/home';
        return false;
    }
    
    return true;
}

// ========== ACCIONES ==========

/**
 * Guardar sesión después de login/register
 */
function saveSession(token, user) {
    setToken(token);
    setUser(user);
    console.log('[AUTH] Sesión guardada:', user.email);
}

/**
 * Logout
 */
function logout() {
    console.log('[AUTH] Cerrando sesión');
    clearSession();
    window.location.href = '/login';
}

// ========== FETCH CON AUTENTICACIÓN ==========

/**
 * Hacer fetch con token automático
 * Siempre incluye el token en los headers
 */
async function authenticatedFetch(url, options = {}) {
    const token = getToken();
    
    if (!token) {
        throw new Error('No hay sesión activa');
    }
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    // Si el token expiró o es inválido, limpiar sesión
    if (response.status === 401 || response.status === 403) {
        console.log('[AUTH] Token inválido/expirado, limpiando sesión');
        clearSession();
        window.location.href = '/login';
        throw new Error('Sesión expirada');
    }
    
    return response;
}

// ========== UTILIDADES DE CACHÉ ==========

/**
 * Verificar si los datos en caché son recientes
 * @param {string} key - Clave del timestamp en localStorage
 * @param {number} maxAge - Edad máxima en milisegundos
 */
function isCacheFresh(key, maxAge = 300000) { // 5 minutos por defecto
    const timestamp = localStorage.getItem(key);
    if (!timestamp) return false;
    
    return Date.now() - parseInt(timestamp) < maxAge;
}

/**
 * Marcar timestamp de actualización de caché
 */
function markCacheUpdate(key) {
    localStorage.setItem(key, Date.now().toString());
}

/**
 * Obtener información del usuario desde caché
 * NO hace request, solo lee localStorage
 */
function getUserInfo() {
    const user = getUser();
    if (!user) return null;
    
    return {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        type: user.type,
        lvl: user.lvl,
        img: user.img,
        accepted: user.accepted,
        fullName: `${user.name} ${user.lastName}`
    };
}

// ========== LOG DE DEBUG ==========

/**
 * Mostrar estado actual de la sesión (para debug)
 */
function debugSession() {
    console.group('🔍 Estado de Sesión');
    console.log('Token:', getToken() ? '✓ Presente' : '✗ Ausente');
    console.log('Usuario:', getUser() || '✗ No hay usuario');
    console.log('Autenticado:', isAuthenticated() ? '✓ Sí' : '✗ No');
    console.log('Aceptado:', isAccepted() ? '✓ Sí' : '✗ No');
    console.log('Tipo:', getUserType() || 'N/A');
    console.groupEnd();
}