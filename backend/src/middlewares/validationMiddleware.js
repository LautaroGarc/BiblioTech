const { body, validationResult } = require('express-validator');

class ValidationMiddleware {
    static validateRegister = [
        body('name')
            .trim()
            .notEmpty().withMessage('El nombre es requerido')
            .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres'),

        body('lastName')
            .trim()
            .notEmpty().withMessage('El apellido es requerido')
            .isLength({ min: 2, max: 50 }).withMessage('El apellido debe tener entre 2 y 50 caracteres'),

        body('email')
            .trim()
            .notEmpty().withMessage('El email es requerido')
            .isEmail().withMessage('Email inválido')
            .normalizeEmail(),

        body('pass')
            .notEmpty().withMessage('La contraseña es requerida')
            .isLength({ min: 6, max: 20 }).withMessage('La contraseña debe tener entre 6 y 20 caracteres'),

        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array()
                });
            }
            next();
        }
    ];

    static validateLogin = [
        body('email')
            .trim()
            .notEmpty().withMessage('El email es requerido')
            .isEmail().withMessage('Email inválido')
            .normalizeEmail(),

        body('pass')
            .notEmpty().withMessage('La contraseña es requerida'),

        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array()
                });
            }
            next();
        }
    ];
}

module.exports = ValidationMiddleware;