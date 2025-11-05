const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { JWT_SECRET } = require('../config/config');
const { addUser, getUsers, getUser } = require('../models/users');

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
            name: name,
            lastName: lastName,
            email: email,
            pass: hashedPassword,
            img: chooseImg(),
            lvl: 1,
            nReads: 0,
            type: 'user', // por defecto todos son 'user'
            warning: 0,
            accepted: false // requiere aprobación de admin
        };

        const result = await addUser(newUser);
        const userId = result.insertId;

        // Token incluye accepted: false
        const token = jwt.sign(
            { 
                id: userId,
                email: email,
                type: 'user',
                accepted: false
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente. Esperando aprobación del administrador.',
            token,
            user: {
                id: userId,
                name: name,
                lastName: lastName,
                email: email,
                type: 'user',
                lvl: 1,
                accepted: false
            }
        });

    } catch (error) {
        console.error('[ REGISTER ERROR ]', error);
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
                id: user.id,
                email: user.email,
                type: user.type,
                accepted: user.accepted
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                type: user.type,
                lvl: user.lvl,
                img: user.img,
                accepted: user.accepted
            }
        });

    } catch (error) {
        console.error('[ LOGIN ERROR ]', error);
        res.status(500).json({ 
            message: 'Error al iniciar sesión' 
        });
    }
}

async function getMe(req, res) {
    try {
        const userId = req.user.id; // viene del token decodificado
        const user = await getUser(userId);

        if (!user) {
            return res.status(404).json({ 
                message: 'Usuario no encontrado' 
            });
        }

        const { pass, ...userWithoutPassword } = user;

        res.json({ user: userWithoutPassword });

    } catch (error) {
        console.error('[ GET ME ERROR ]', error);
        res.status(500).json({ 
            message: 'Error al obtener perfil' 
        });
    }
}

async function getUserById(req, res) {
    try {
        const userId = req.params.id; // viene de la URL /api/users/:id
        const user = await getUser(userId);

        if (!user) {
            return res.status(404).json({ 
                message: 'Usuario no encontrado' 
            });
        }

        const { pass, ...userWithoutPassword } = user;

        res.json({ user: userWithoutPassword });

    } catch (error) {
        console.error('[ GET USER ERROR ]', error);
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
        console.error('[ CHECK EMAIL ERROR ]', error);
        res.status(500).json({ 
            message: 'Error al verificar email' 
        });
    }
}

async function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        // Verificar que el email existe
        const users = await getUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(404).json({ 
                msgType: 'error',
                msg: 'Email no registrado' 
            });
        }

        // TODO: 
        // 1. Generar token temporal de recuperación
        // 2. Enviar email con link de recuperación
        // 3. Guardar token en DB con expiración

        console.log('[ FORGOT PASSWORD ] Solicitud de recuperación para:', email);

        res.json({ 
            ok: true,
            msgType: 'success',
            msg: 'Se ha enviado un correo con instrucciones' 
        });

    } catch (error) {
        console.error('[ FORGOT PASSWORD ERROR ]', error);
        res.status(500).json({ 
            msgType: 'error',
            msg: 'Error al recuperar contraseña' 
        });
    }
}

function chooseImg() {
    try {
        const photos = fs.readdirSync(path.join(__dirname, '..','..','frontend','src','public','assets'))
        return photos[Math.floor(Math.random() * photos.lenght)]
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return null;
    }
}

module.exports = {
    register,
    login,
    getUsers,
    getMe,
    getUserById,
    checkEmail,
    forgotPassword
};