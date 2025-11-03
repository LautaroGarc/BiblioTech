const forumsSections = document.getElementById("forums");

forumsSections.addEventListener('DOMContentLoaded', function() {
    loadForums();
});


//mostrar foros
function displaySections(sections) {
    const container = document.getElementById('forums');
    container.innerHTML = sections.map(section => `
        <div class="section" onclick="loadForumChat(${section.id})">
            <h3>${section.nombre}</h3>
        </div>
    `).join('');
}

// mostrar mensajes y respuestas

function displayChat(messages) {

    document.getElementById('chat-box').style.display = 'inline-block';

    const chatContainer = document.getElementById('forum-chat');
    
  
    const mainMessages = messages.filter(msg => !msg.reply);
    const replies = messages.filter(msg => msg.reply === true);
    
    chatContainer.innerHTML = mainMessages.map(message => {
        
        const messageReplies = replies.filter(reply => reply.replyId === message.id);
        
        const htmlmsg = `
            <div class="message main-message">
                <strong>${message.users.name}:</strong><br>
                <p>${message.text}</p><br>
                <p class="date">${message.date}</p>
                <button class="reply-btn" onclick="setupReply(${message.id}, '${message.users.name}')">Responder</button>
            </div>
        `;
        
        
        const repliesHtml = messageReplies.map(reply => `
            <div class="message reply">
                <strong>${reply.users.name}:</strong><br>
                <p>${reply.text}</p><br>
                <p class="date">${reply.date}</p>
            </div>
        `).join('');
        
        return htmlmsg + repliesHtml;
        
    }).join('');
}





// cargar secciones
function loadForums() {
    fetch('/api/forums')
        .then(response => response.json())
        .then(sections => {
            displaySections(sections);
        });
}

// seleccionar seccion
function loadForumChat(sectionId) {
    fetch(`/api/forums/${sectionId}/messages`)
        .then(response => response.json())
        .then(messages => {
            displayChat(messages);
        });
}



let currentForumId = null;
let currentUserId = null;
let replyingTo = null;

// init formulario
function initCommentForm(forumId, userId) {
    currentForumId = forumId;
    currentUserId = userId;
    
    // establecer valores en campos ocultos
    document.getElementById('forumId').value = forumId;
    
    setupFormEvents();
}

// configurar eventos del formulario
function setupFormEvents() {
    const form = document.getElementById('comment-form');

    const cancelReplyBtn = document.getElementById('cancel-reply');
    
    // envio
    form.addEventListener('submit', handleFormSubmit);
    
    // cancelar respuesta
    cancelReplyBtn.addEventListener('click', cancelReply);
}

// responder a un mensaje
function setupReply(messageId, userName) {
    replyingTo = messageId;
    
    // actualizar campos ocultos
    document.getElementById('replyId').value = messageId;

    document.getElementById('isReply').value = 'true';
    
    // mostrar indicador de respuesta
    const textarea = document.getElementById('comment-text');

    textarea.placeholder = `Respondiendo a ${userName}...`;
    textarea.focus();

    // mostrar botón cancelar
    document.getElementById('cancel-reply').style.display = 'inline-block';
}

// cancelar respuesta / resetear
function cancelReply() {
    replyingTo = null;
    
    document.getElementById('replyId').value = '';
    
    document.getElementById('isReply').value = 'false';

    const textarea = document.getElementById('comment-text');
    
    textarea.placeholder = 'Escribe tu comentario (máximo 150 caracteres)';
    
    document.getElementById('cancel-reply').style.display = 'none';
}

// manejar envio de formulario
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);

    const commentData = {
        userId: parseInt(formData.get('userId')),

        forumId: parseInt(formData.get('forumId')),

        reply: formData.get('isReply') === 'true',

        replyId: formData.get('replyId') ? parseInt(formData.get('replyId')) : null,

        text: formData.get('text').trim()
    };
    

    if (!commentData.text) {
        alert('Por favor escribe un comentario');
        return;
    }
    
    if (commentData.reply && !commentData.replyId) {
        alert('Error: Respuesta sin mensaje de referencia');
        return;
    }
    
    try {
        const submitBtn = document.getElementById('submit-btn');

        submitBtn.disabled = true;

        submitBtn.textContent = 'Publicando...';
        

        const response = await fetch('/api/forums/comments', {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
            },

            body: JSON.stringify(commentData)
        });
        
        if (response.ok) {
           
            event.target.reset();
          
            if (replyingTo) {
                cancelReply();
            }
       
            loadForumChat(currentForumId);
        
            showNotification('Comentario publicado exitosamente', 'success');
            
        } else {
            throw new Error('Error al publicar comentario');
        }
        
    } catch (error) {
        console.error('Error:', error);
        
        showNotification('Error al publicar el comentario', 'error');

    } finally {
        const submitBtn = document.getElementById('submit-btn');

        submitBtn.disabled = false;

        submitBtn.textContent = 'Publicar comentario';
    }
}