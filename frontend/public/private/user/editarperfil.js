// Función para cerrar popup (para editarperfil.html)
function cerrarPopup() {
    const popup = document.getElementById('popupEditarPerfil');
    const body = document.body;
    
    popup.classList.remove('active');
    body.style.overflow = '';
}

// Función para abrir popup (para editarperfil.html)
function abrirPopup() {
    const popup = document.getElementById('popupEditarPerfil');
    const body = document.body;
    
    popup.classList.add('active');
    body.style.overflow = 'hidden';
}

// Cerrar popup al hacer click fuera del contenido
document.addEventListener('DOMContentLoaded', function() {
    const popup = document.getElementById('popupEditarPerfil');
    if (popup) {
        popup.addEventListener('click', function(e) {
            if (e.target === this) {
                cerrarPopup();
            }
        });
    }
    
    // Manejar envío del formulario de edición
    const editForm = document.querySelector('.edit-form');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nombre = document.getElementById('nombre').value;
            const email = document.getElementById('email').value;
            
            if (nombre && email) {
                // Aquí iría la lógica para guardar los cambios
                alert('Perfil actualizado correctamente');
                cerrarPopup();
            }
        });
    }
});