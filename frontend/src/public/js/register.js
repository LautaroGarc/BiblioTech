document.addEventListener('DOMContentLoaded', function() {
    // Redirigir si ya hay sesión activa
    if (redirectIfAuthenticated()) {
        return;
    }

    const registerForm = document.querySelector('.registerForm');
    const messageDiv = document.getElementById('msg');

    if (!registerForm) {
        console.error('[REGISTER] No se encontró el formulario de registro');
        return;
    }

    registerForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validar formulario
        if (!validateRegisterForm(firstName, lastName, email, password, confirmPassword)) {
            return;
        }

        // Registrar usuario
        await registerUser(firstName, lastName, email, password);
    });

    function validateRegisterForm(firstName, lastName, email, password, confirmPassword) {
        // Validar nombre
        if (!firstName || firstName.length < 2) {
            showMessage('El nombre debe tener al menos 2 caracteres', 'error');
            return false;
        }

        if (firstName.length > 50) {
            showMessage('El nombre no puede superar los 50 caracteres', 'error');
            return false;
        }

        // Validar apellido
        if (!lastName || lastName.length < 2) {
            showMessage('El apellido debe tener al menos 2 caracteres', 'error');
            return false;
        }

        if (lastName.length > 50) {
            showMessage('El apellido no puede superar los 50 caracteres', 'error');
            return false;
        }

        // Validar email
        if (!email || !email.includes('@')) {
            showMessage('Correo electrónico no válido', 'error');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Formato de email inválido', 'error');
            return false;
        }

        // Validar contraseña
        if (!password || password.length < 6) {
            showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
            return false;
        }

        if (password.length > 20) {
            showMessage('La contraseña no puede superar los 20 caracteres', 'error');
            return false;
        }

        // Validar confirmación de contraseña
        if (password !== confirmPassword) {
            showMessage('Las contraseñas no coinciden', 'error');
            return false;
        }

        return true;
    }

    function showMessage(message, type) {
        if (!messageDiv) return;
        
        messageDiv.textContent = message;
        messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
        
        // Scroll al mensaje
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function clearMessage() {
        if (messageDiv) {
            messageDiv.textContent = '';
            messageDiv.className = '';
        }
    }

    async function registerUser(firstName, lastName, email, password) {
        try {
            console.log('[REGISTER] Registrando usuario:', email);

            // Verificar si el email ya existe
            const emailExists = await checkEmailExists(email);
            
            if (emailExists) {
                showMessage('Este email ya está registrado. ¿Querés iniciar sesión?', 'error');
                return;
            }

            showMessage('Registrando...', 'info');

            // Realizar registro
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: firstName,
                    lastName: lastName,
                    email: email,
                    pass: password
                })
            });

            const data = await response.json();
            console.log('[REGISTER] Respuesta del servidor:', data);

            if (response.ok) {
                // Registro exitoso
                showMessage('¡Registro exitoso! Esperando aprobación...', 'success');
                
                // Guardar sesión
                saveSession(data.token, data.user);
                
                console.log('[REGISTER] Sesión guardada:', {
                    email: data.user.email,
                    accepted: data.user.accepted,
                    type: data.user.type
                });
                
                // Redirigir a página de espera después de 2 segundos
                setTimeout(() => {
                    window.location.href = '/home';
                }, 2000);

            } else {
                // Error en el registro
                if (data.errors && Array.isArray(data.errors)) {
                    // Errores de validación del backend
                    const errorMessages = data.errors.map(err => err.msg).join('. ');
                    showMessage(errorMessages, 'error');
                } else {
                    showMessage(data.message || 'Error al registrar usuario', 'error');
                }
            }

        } catch (error) {
            console.error('[REGISTER ERROR]', error);
            showMessage('Error de conexión con el servidor. Intentá nuevamente.', 'error');
        }
    }

    async function checkEmailExists(email) {
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
            console.error('[CHECK EMAIL ERROR]', error);
            return false;
        }
    }

    // Limpiar mensaje cuando el usuario empieza a escribir
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', clearMessage);
    });
});