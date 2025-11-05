function togglePopup() {
    const popup = document.getElementById('popupEditarPerfil');
    const body = document.body;
    
    if (popup.classList.contains('active')) {
        popup.classList.remove('active');
        body.style.overflow = '';
    } else {
        popup.classList.add('active');
        body.style.overflow = 'hidden';
    }
}

// Cerrar popup al hacer click fuera del contenido
document.getElementById('popupEditarPerfil').addEventListener('click', function(e) {
    if (e.target === this) {
        togglePopup();
    }
});

// Manejar envío del formulario
document.querySelector('.edit-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    
    if (nombre && email) {
        // Actualizar el nombre en el header
        document.querySelector('.nombre-usuario').textContent = nombre;
        
        // Mostrar mensaje de éxito
        alert('Perfil actualizado correctamente');
        
        // Cerrar popup
        togglePopup();
        
        // Resetear formulario
        this.reset();
    }
});

// Cerrar popup con Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const popup = document.getElementById('popupEditarPerfil');
        if (popup.classList.contains('active')) {
            togglePopup();
        }
    }
});

