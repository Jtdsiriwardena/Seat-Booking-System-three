const express = require('express');
const { body, validationResult } = require('express-validator');
const { signup, login, googleLogin, updateInternId } = require('../controllers/authController');
const router = express.Router();

router.post(
    '/signup',
    [
        body('internId').isString().trim().escape().notEmpty().withMessage('Intern ID is required'),
        body('firstName').isString().trim().escape().notEmpty().withMessage('First name is required'),
        body('lastName').isString().trim().escape().notEmpty().withMessage('Last name is required'),
        body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
        body('password').isString().trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    signup
);

router.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
        body('password').isString().trim().notEmpty().withMessage('Password is required'),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    login
);


router.post('/google-login', googleLogin);


router.post(
    '/update-intern-id',
    [
        body('internId').isString().trim().escape().notEmpty().withMessage('Intern ID is required'),
        body('newInternId').isString().trim().escape().notEmpty().withMessage('New Intern ID is required'),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    updateInternId
);

module.exports = router;
