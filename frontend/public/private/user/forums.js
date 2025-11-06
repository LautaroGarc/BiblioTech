// JavaScript mínimo para funcionalidades básicas del CSS
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar/ocultar chat-box cuando se selecciona un foro
    const forumItems = document.getElementById('forums');
    const chatBox = document.getElementById('chat-box');
    
    // Función para simular la selección de un foro (para demostración)
    function selectForum(forumId) {
        // Mostrar chat-box
        chatBox.style.display = 'block';
        
        // Actualizar forumId en el formulario
        document.getElementById('forumId').value = forumId;
        
        // Simular carga de mensajes
        loadSampleMessages();
        
        // Scroll suave al chat
        chatBox.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Función para cargar mensajes de ejemplo
    function loadSampleMessages() {
        const forumChat = document.getElementById('forum-chat');
        forumChat.innerHTML = `
            <div class="chat-message">
                <strong>Usuario Ejemplo:</strong>
                <p>¡Este es un mensaje de ejemplo en el foro!</p>
                <button class="reply-btn" onclick="setReplyMode(1)">Responder</button>
            </div>
            <div class="chat-message reply">
                <strong>Respuesta:</strong>
                <p>Esta es una respuesta de ejemplo.</p>
                <button class="reply-btn" onclick="setReplyMode(2)">Responder</button>
            </div>
        `;
    }
    
    // Función global para modo respuesta
    window.setReplyMode = function(replyId) {
        document.getElementById('replyId').value = replyId;
        document.getElementById('isReply').value = 'true';
        document.getElementById('cancel-reply').style.display = 'inline-block';
        document.getElementById('comment').focus();
    };
    
    // Cancelar respuesta
    document.getElementById('cancel-reply').addEventListener('click', function() {
        document.getElementById('replyId').value = '';
        document.getElementById('isReply').value = 'false';
        this.style.display = 'none';
    });
    
    // Manejar envío del formulario
    document.getElementById('comment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const comment = document.getElementById('comment').value;
        const isReply = document.getElementById('isReply').value === 'true';
        
        if (comment.trim()) {
            alert(isReply ? 'Respuesta enviada: ' + comment : 'Comentario enviado: ' + comment);
            document.getElementById('comment').value = '';
            document.getElementById('cancel-reply').click(); // Resetear modo respuesta
        }
    });
    
    // Simular foros de ejemplo (para demostración visual)
    setTimeout(() => {
        document.getElementById('forums').innerHTML = `
            <div class="forum-item" onclick="selectForum(1)">
                <h3>📚 Recomendaciones de Libros</h3>
                <p>Comparte tus libros favoritos y descubre nuevas lecturas</p>
            </div>
            <div class="forum-item" onclick="selectForum(2)">
                <h3>💬 Club de Lectura</h3>
                <p>Discute el libro del mes con otros lectores</p>
            </div>
            <div class="forum-item" onclick="selectForum(3)">
                <h3>🆕 Novedades Literarias</h3>
                <p>Mantente al día con los últimos lanzamientos</p>
            </div>
        `;
    }, 500);
});