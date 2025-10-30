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
    fetch('/api/forums/sections')
        .then(response => response.json())
        .then(sections => {
            displaySections(sections);
        });
}

// seleccionar seccion
function loadForumChat(sectionId) {
    fetch(`/api/forums/chat/${sectionId}`)
        .then(response => response.json())
        .then(messages => {
            displayChat(messages);
        });
}