const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { JWT_SECRET } = require('../config/config');
const { addUser, getUsers, getUser } = require('../models/users');

const { generateToken } = require('../middlewares/authMiddleware.js')

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
            img: chooseImg()
        };

        const result = await addUser(newUser);
        newUser.id = result.insertId;
        newUser.type = 'user'
        newUser.accepted = false

        const token = generateToken(newUser);

        res.status(201).json({
            message: 'Usuario registrado exitosamente. Esperando aprobación del administrador.',
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                lastName: newUser.lastName,
                email: newUser.email,
                type: newUser.type,
                img: newUser.img,
                accepted: newUser.accepted
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

        const token = generateToken(user);

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                type: user.type,
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
        const assetsPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'public', 'assets','profiles');
        
        // Verificar si el directorio existe
        if (!fs.existsSync(assetsPath)) {
            console.warn('[CHOOSE IMG] Directorio de assets no encontrado, usando imagen por defecto');
            return '/assets/default-avatar.png';
        }
        
        // Leer archivos del directorio
        const files = fs.readdirSync(assetsPath);
        
        // Filtrar solo imágenes
        const imageFiles = files.filter(file => 
            /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)
        );
        
        // Si no hay imágenes, retornar default
        if (imageFiles.length === 0) {
            console.warn('[CHOOSE IMG] No hay imágenes disponibles, usando imagen por defecto');
            return '/assets/default-avatar.png';
        }
        
        // Elegir una imagen aleatoria
        const randomIndex = Math.floor(Math.random() * imageFiles.length);
        const selectedImage = `/assets/${imageFiles[randomIndex]}`;
        
        console.log('[CHOOSE IMG] Imagen seleccionada:', selectedImage);
        return selectedImage;
        
    } catch (error) {
        console.error('[CHOOSE IMG ERROR]', error.message);
        return '/assets/default-avatar.png';
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