document.addEventListener('DOMContentLoaded', function() {
    // Redirigir si ya hay sesión activa
    if (redirectIfAuthenticated()) {
        return;
    }

    const loginForm = document.querySelector('.loginForm');
    const forgotForm = document.querySelector('.forgotPass');
    const messageDiv = document.getElementById('msg');
    const recoverMsgDiv = document.getElementById('recoverMsg');
    const forgotPassLink = document.getElementById('forgotPassLink');
    const backToLoginBtn = document.getElementById('backToLogin');
    const loginSection = document.getElementById('loginSection');
    const recoverSection = document.getElementById('recoverSection');

    // Verificar que los elementos existan
    if (!loginForm) {
        console.error('[LOGIN] No se encontró el formulario de login');
        return;
    }

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const pass = document.getElementById('loginPass').value;

        if (validateLoginForm(email, pass)) {
            await loginUser(email, pass);
        }
    });

    // ... el resto del código de login que ya tienes
});