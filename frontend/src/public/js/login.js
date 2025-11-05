document.addEventListener('DOMContentLoaded', function() {
    // Redirigir si ya hay sesión activa
    if (redirectIfAuthenticated()) {
        return; // Ya redirigió, no continuar
    }

    const loginForm = document.querySelector('.loginForm');
    const forgotForm = document.querySelector('.forgotPass');
    const messageDiv = document.getElementById('msg');
    const recoverMsgDiv = document.getElementById('recoverMsg');
    const forgotPassLink = document.getElementById('forgotPassLink');
    const backToLoginBtn = document.getElementById('backToLogin');
    const loginSection = document.getElementById('loginSection');
    const recoverSection = document.getElementById('recoverSection');

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPass').value;

        if (validateLoginForm(email, pass)) {
            await loginUser(email, pass);
        }
    });

    forgotPassLink.addEventListener('click', function(event) {
        event.preventDefault();
        showRecoverForm();
    });

    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', function() {
            showLoginForm();
        });
    }

    forgotForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = document.getElementById('recoverEmail').value;

        if (validateRecoverForm(email)) {
            await recoverPassword(email);
        }
    });

    function showRecoverForm() {
        loginSection.classList.add('hidden');
        recoverSection.classList.remove('hidden');
        clearMessages();
    }

    function showLoginForm() {
        recoverSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
        clearMessages();
        forgotForm.reset();
    }   

    function clearMessages() {
        messageDiv.textContent = '';
        messageDiv.className = '';
        recoverMsgDiv.textContent = '';
        recoverMsgDiv.className = '';
    }

    function validateLoginForm(email, pass) {
        if (!email || !email.includes('@')) {
            showMessage('Correo electrónico no válido', 'error', messageDiv);
            return false;
        }
        if (!pass || pass.length < 6) {
            showMessage('La contraseña debe tener al menos 6 caracteres', 'error', messageDiv);
            return false;
        }
        return true;
    }

    function validateRecoverForm(email) {
        if (!email || !email.includes('@')) {
            showMessage('Correo electrónico no válido', 'error', recoverMsgDiv);
            return false;
        }
        return true;
    }

    function showMessage(message, type, container) {
        container.textContent = message;
        container.className = type + '-message';
    }

    async function loginUser(email, pass) {
        try {
            showMessage('Iniciando sesión...', 'info', messageDiv);
            
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    pass: pass
                })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('¡Login exitoso! Redirigiendo...', 'success', messageDiv);
                
                // CACHEAR: Guardar token y usuario en localStorage
                saveSession(data.token, data.user);
                
                console.log('[LOGIN] Sesión guardada en caché:', {
                    user: data.user.email,
                    accepted: data.user.accepted
                });
                
                // Redirigir según estado de aceptación
                setTimeout(() => {
                    if (data.user.accepted) {
                        window.location.href = '/home';
                    } else {
                        window.location.href = '/waiting';
                    }
                }, 1500);
                
            } else {
                showMessage(data.message || 'Error en el login', 'error', messageDiv);
            }

        } catch (error) {
            console.error('[LOGIN ERROR]', error);
            showMessage('Error de conexión con el servidor', 'error', messageDiv);
        }
    }

    async function recoverPassword(email) {
        try {     
            const emailExists = await emailValidator(email);
            
            if (!emailExists) {
                showMessage('Correo electrónico no registrado', 'error', recoverMsgDiv);
                return;
            }

            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(data.msg || 'Se ha enviado un correo', 'success', recoverMsgDiv);
                
                setTimeout(() => {
                    showLoginForm();
                }, 3000);
                
            } else {
                showMessage(data.msg || 'Error al recuperar la contraseña', 'error', recoverMsgDiv);
            }

        } catch (error) {
            console.error('[FORGOT PASSWORD ERROR]', error);
            showMessage('Error de conexión con el servidor', 'error', recoverMsgDiv);
        }
    }

    async function emailValidator(email) {
        try {
            const response = await fetch('/api/auth/check-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email })
            });

            const data = await response.json();
            return data.exists;
            
        } catch (error) {
            console.error('[EMAIL VALIDATOR ERROR]', error);
            return false;
        }
    }
});