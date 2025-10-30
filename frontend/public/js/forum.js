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

// mostrar mensajes
function displayChat(messages) {
    const chatContainer = document.getElementById('forum-chat');
    chatContainer.innerHTML = messages.map(message => `
        <div class="message">
            <strong>${message.users.name}:</strong> <br>
            <p>${message.text}</p> <br>
            <p>${message.date}</p>
        </div>
    `).join('');
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