document.addEventListener('DOMContentLoaded', function() {
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
            
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: pass
                })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('¡Login exitoso! Redirigiendo...', 'success', messageDiv);
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                setTimeout(() => {
                    window.location.href = '/home';
                }, 2000);
            } else {
                showMessage(data.message || 'Error en el login', 'error', messageDiv);
            }

        } catch (error) {
            console.error('Error:', error);
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
                showMessage('Hemos enviado los pasos para recuperar tu contraseña, revisa la casilla "spam".', 'success', recoverMsgDiv);
                
                setTimeout(() => {
                    showLoginForm();
                }, 3000);
                
            } else {
                showMessage(data.message || 'Error al recuperar la contraseña', 'error', recoverMsgDiv);
            }

        } catch (error) {
            console.error('Error:', error);
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
            return data.exists; //backend responde con { exists: true/false }
            
        } catch (error) {
            console.error('Error validando email:', error);
            return false;
        }
    }
});