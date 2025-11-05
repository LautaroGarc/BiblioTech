document.addEventListener('DOMContentLoaded', function() {
    // Verificar que tenga sesión pero NO esté aceptado
    if (!requireWaiting()) {
        return; // Ya redirigió
    }
});
