const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
//const nodemailer = require('nodemailer');
const { JWT_SECRET } = require('../config/config');
const { addUser, getUsers, getUser } = require('../models/users');

// Cookie configuration for JWT tokens
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    sameSite: 'strict'
};

async function register(req, res) {
    try {
        console.log('[REGISTER] Datos recibidos:', req.body);
        
        const { name, lastName, email, pass } = req.body;
        
        // Validar que los campos existan
        if (!name || !lastName || !email || !pass) {
            console.error('[REGISTER] Faltan campos requeridos');
            return res.status(400).json({ 
                message: 'Todos los campos son requeridos' 
            });
        }
        
        const users = await getUsers();
        const existingUser = users.find(u => u.email === email);
        
        if (existingUser) {
            console.log('[REGISTER] Email ya registrado:', email);
            return res.status(400).json({ 
                message: 'El email ya está registrado' 
            });
        }

        const hashedPassword = await bcrypt.hash(pass, 10);
        console.log('[REGISTER] Contraseña hasheada correctamente');

        const newUser = {
            name: name,
            lastName: lastName,
            email: email,
            pass: hashedPassword,
            img: chooseImg()
        };

        console.log('[REGISTER] Insertando usuario en BD:', { name, lastName, email });
        const result = await addUser(newUser);
        const userId = result.insertId;
        console.log('[REGISTER] Usuario creado con ID:', userId);

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

        console.log('[REGISTER] Token generado para usuario:', userId);

        // Establecer cookie con el token
        res.cookie('token', token, COOKIE_OPTIONS);

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
                xp: 0,
                img: newUser.img,
                accepted: false
            }
        });

        console.log('[REGISTER] Respuesta enviada exitosamente');

    } catch (error) {
        console.error('[ REGISTER ERROR ]', error);
        res.status(500).json({ 
            message: 'Error al registrar usuario',
            error: error.message 
        });
    }
}

async function login(req, res) {
    try {
        console.log('[LOGIN] Intento de login:', req.body.email);
        
        const { email, pass } = req.body;

        if (!email || !pass) {
            return res.status(400).json({ 
                message: 'Email y contraseña son requeridos' 
            });
        }

        const users = await getUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            console.log('[LOGIN] Usuario no encontrado:', email);
            return res.status(401).json({ 
                message: 'Credenciales inválidas' 
            });
        }

        console.log('[LOGIN] Usuario encontrado. Verificando contraseña...');
        const validPassword = await bcrypt.compare(pass, user.pass);
        
        if (!validPassword) {
            console.log('[LOGIN] Contraseña incorrecta para:', email);
            return res.status(401).json({ 
                message: 'Credenciales inválidas' 
            });
        }

        console.log('[LOGIN] Contraseña correcta. Generando token...');

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

        console.log('[LOGIN] Login exitoso para:', email, '| Accepted:', user.accepted);

        res.cookie('token', token, COOKIE_OPTIONS).json({
            message: 'Login exitoso',
            user: {
                id: user.id,
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                type: user.type,
                lvl: user.lvl,
                xp: user.xp || 0,
                img: user.img,
                accepted: user.accepted
            }
        });

    } catch (error) {
        console.error('[ LOGIN ERROR ]', error);
        res.status(500).json({ 
            message: 'Error al iniciar sesión',
            error: error.message 
        });
    }
}

async function getMe(req, res) {
    try {
        const userId = req.user.id;
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
        const userId = req.params.id;
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

async function getMyAd(req, res) {
    const userId = req.user.id;
    const user = await getUser(userId);

    if (!user) {
        return res.status(404).json({ 
            message: 'Usuario no encontrado' 
        });
    }

    const ok = true
    if (user.notifications == null) {
        ok = false
    }

    try {
        res.json({ 
            exists: ok,
            data: user.notifications
        });
    } catch(error) {
        console.error('[ ads ERROR ]', error);
        res.status(500).json({ 
            message: 'ads error',
            exists: false
        });
    }
}

async function checkEmail(req, res) {
    try {
        console.log('[CHECK EMAIL] Body recibido:', req.body);
        
        const { email } = req.body;
        
        if (!email) {
            console.error('[CHECK EMAIL] Email no proporcionado');
            return res.status(400).json({ 
                message: 'Email es requerido',
                exists: false 
            });
        }

        const users = await getUsers();
        const exists = users.some(u => u.email === email);

        console.log('[CHECK EMAIL] Email:', email, '| Existe:', exists);

        res.json({ exists });

    } catch (error) {
        console.error('[ CHECK EMAIL ERROR ]', error);
        res.status(500).json({ 
            message: 'Error al verificar email',
            exists: false
        });
    }
}

/*
async function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        const users = await getUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(404).json({ 
                msgType: 'error',
                msg: 'Email no registrado' 
            });
        }

        console.log('[ FORGOT PASSWORD ] Solicitud de recuperación para:', email);

        forgotPass(email);

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

*/



function chooseImg() {
    try {
        const assetsPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'public', 'assets', 'profiles');
        
        if (!fs.existsSync(assetsPath)) {
            console.log('[CHOOSE IMG] Directorio no existe, usando default');
            return '/assets/profiles/azul.png';
        }
        
        const photos = fs.readdirSync(assetsPath);
        const imageFiles = photos.filter(file => 
            /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)
        );
        
        if (imageFiles.length === 0) {
            console.log('[CHOOSE IMG] No hay imágenes, usando default');
            return '/assets/profiles/azul.png';
        }
        
        const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];
        console.log('[CHOOSE IMG] Imagen seleccionada:', randomImage);
        return `/assets/profiles/${randomImage}`;
        
    } catch (error) {
        console.error('[CHOOSE IMG ERROR]', error.message);
        return '/assets/profiles/azul.png';
    }
}

module.exports = {
    register,
    login,
    getUsers,
    getMe,
    getUserById,
    checkEmail,
    getMyAd
    //forgotPassword
};