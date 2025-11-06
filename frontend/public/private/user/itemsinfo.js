// Funciones para el popup
function abrirPopup(titulo, descripcion) {
    const popup = document.getElementById('popup');
    const popupTitulo = document.getElementById('popup-titulo');
    const popupDescripcion = document.getElementById('popup-descripcion');
    
    popupTitulo.textContent = titulo;
    popupDescripcion.textContent = descripcion;
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function cerrarPopup() {
    const popup = document.getElementById('popup');
    popup.classList.remove('active');
    document.body.style.overflow = '';
}

// Cerrar popup al hacer click fuera del contenido
document.getElementById('popup').addEventListener('click', function(e) {
    if (e.target === this) {
        cerrarPopup();
    }
});

// Manejar envío del formulario
document.querySelector('.book-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nombre = this.querySelector('input[type="text"]').value;
    const email = this.querySelector('input[type="email"]').value;
    const fecha = this.querySelector('input[type="date"]').value;
    
    if (nombre && email && fecha) {
        alert(`¡Solicitud enviada con éxito!\n\nNombre: ${nombre}\nEmail: ${email}\nFecha: ${fecha}\n\nTe contactaremos pronto.`);
        this.reset();
        cerrarPopup();
    }
});

// Búsqueda en tiempo real
document.querySelector('.search-bar').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const items = document.querySelectorAll('.item');
    
    items.forEach(item => {
        const itemName = item.querySelector('h3').textContent.toLowerCase();
        if (itemName.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
});