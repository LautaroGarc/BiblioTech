function saveSession(token, user) {
    try {
        const sessionData = {
            token: token,
            user: user,
            timestamp: Date.now(),
            expiresIn: 24 * 60 * 60 * 1000 
        };
        
        localStorage.setItem('userSession', JSON.stringify(sessionData));
        console.log('[SESSION] Sesión guardada en caché:', { 
            user: user.email, 
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000) 
        });
        
        document.cookie = `token=${token}; max-age=${24 * 60 * 60}; path=/; samesite=strict`;
        
    } catch (error) {
        console.error('[SESSION ERROR] Error al guardar sesión:', error);
    }
}

function getSession() {
    try {
        const sessionData = localStorage.getItem('userSession');
        if (!sessionData) return null;
        
        const session = JSON.parse(sessionData);
        const now = Date.now();
        
        if (now - session.timestamp > session.expiresIn) {
            clearSession();
            return null;
        }
        
        return session;
    } catch (error) {
        console.error('[SESSION ERROR] Error al obtener sesión:', error);
        return null;
    }
}

function clearSession() {
    try {
        localStorage.removeItem('userSession');
        document.cookie = 'token=; max-age=0; path=/;';
        console.log('[SESSION] Sesión limpiada');
    } catch (error) {
        console.error('[SESSION ERROR] Error al limpiar sesión:', error);
    }
}

function getAuthToken() {
    const session = getSession();
    return session ? session.token : null;
}

function isTokenExpiringSoon() {
    const session = getSession();
    if (!session) return true;
    
    const timeLeft = (session.timestamp + session.expiresIn) - Date.now();
    return timeLeft < (2 * 60 * 60 * 1000);
}

window.sessionManager = {
    saveSession,
    getSession,
    clearSession,
    getAuthToken,
    isTokenExpiringSoon
};