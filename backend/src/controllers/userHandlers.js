const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');
const { addUser, getUsers, getUser } = require('../../models/users');

async function register(req, res) {
    try {
        const { name, lastName, email, pass } = req.body;
        
        const users = await getUsers();
        const existingUser = users.find(u => u.email === email);
        
        if (existingUser) {
            return res.status(400).json({ 
                message: 'El email ya está registrado' 
            });
        }

        const hashedPassword = await bcrypt.hash(pass, 10);

        const newUser = {
            
        };

        const result = await addUser(newUser);

        const token = jwt.sign(
            { 
                
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                
            }
        });

    } catch (error) {
        console.error('[ REGISTER ] ', error);
        res.status(500).json({ 
            message: 'Error al registrar usuario' 
        });
    }
}

async function login(req, res) {
    try {
        const { email, pass } = req.body;

        const users = await getUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(401).json({ 
                message: 'Credenciales inválidas' 
            });
        }

        const validPassword = await bcrypt.compare(pass, user.pass);
        
        if (!validPassword) {
            return res.status(401).json({ 
                message: 'Credenciales inválidas' 
            });
        }

        const token = jwt.sign(
            { 
                
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            message: 'Error al iniciar sesión' 
        });
    }
}

async function getMe(req, res) {
    try {
        const userId = req.user.id;
        const users = await getUsers();
        const user = users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({ 
                message: 'Usuario no encontrado' 
            });
        }

        const { pass, ...userWithoutPassword } = user;

        res.json({ user: userWithoutPassword });

    } catch (error) {
        console.error('Error en getMe:', error);
        res.status(500).json({ 
            message: 'Error al obtener perfil' 
        });
    }
}

async function getUser(req, res) {
    try {
        const userId = req.userId;
        const user = await getUser(userId);

        if (!user) {
            return res.status(404).json({ 
                message: 'Usuario no encontrado' 
            });
        }

        const { pass, ...userWithoutPassword } = user;

        res.json({ user: userWithoutPassword });

    } catch (error) {
        console.error('Error en getUser:', error);
        res.status(500).json({ 
            message: 'Error al obtener perfil del usuario' 
        });
    }   
}

async function checkEmail(req, res) {
    try {
        const { email } = req.body;
        const users = await getUsers();
        const exists = users.some(u => u.email === email);

        res.json({ exists });

    } catch (error) {
        console.error('[ CHECK EMAIL ERROR ] ', error);
        res.status(500).json({ 
            message: 'Error al verificar email' 
        });
    }
}

async function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        // 1. Generar token temporal
        // 2. Enviar email con link de recuperación
        // 3. Guardar token en DB con expiración

        console.log('[ LOGIN ] Solicitud de recuperación para:', email);

        res.json({ 
            ok: true,
            msgType: 'success',
            msg: 'Se ha enviado un correo con instrucciones' 
        });

    } catch (error) {
        console.error('Error en forgotPassword:', error);
        res.status(500).json({ 
            msgType: 'error',
            message: 'Error al recuperar contraseña' 
        });
    }
}

function chooseImg() {
    return null;
}

module.exports = {
    register,
    login,
    logout,
    getMe,
    checkEmail,
    forgotPassword
};