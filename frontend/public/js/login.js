

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementsByClassName('loginForm');
    const forgotForm = document.getElementsByClassName('forgotPass');
    const messageDiv = document.getElementById('msg');

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const pass = document.getElementById('pass').value;

        if (validateForm(email, pass)) {
            await loginUser(email, pass);
        };
    })

    loginForm.addEventListener('forgot-pass', forgotPass())

    forgotForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = document.getElementById('email').value;

        recoverPass();
    })
})

function forgotPass(email){
    //oculta el formulario original y muestra el oculto (forgotForm)
}

function emailValidator(email) {
    //llama a la ruta para preguntarle si el email existe o está registrado dentro de la db
}

function recoverPass(email){
    if (!email || !('@' in email) || !emailValidator(emailValidator)) {
        showMessage('Correo electrónico no registrado.', 'error');
        return false;
    } 

}

function validateForm(email, pass) {
    if (!email || !('@' in email)) {
        showMessage('Correo electrónico no válido.', 'error');
        return false;
    }
    if (!pass || pass.lenght < 6) {
        showMessage('Contraseña no válida.', 'error');
        return false;
    }
    return true;
}

function showMessage(message, type) {
    messageDiv.textContent = message;
    messageDiv.className = type + '-message';
}

async function loginUser(email, pass) {
    a
}