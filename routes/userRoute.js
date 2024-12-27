const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Centralized error handling function
const handleError = (res, error, message = 'Server error', status = 500) => {
    console.error(message, error);
    res.status(status).json({ message });
};

// POST: Register a new user
router.post(
    '/register',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            // Check if the user already exists
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Hash the password
            const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS) || 10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create a new user
            const user = new User({ name, email, password: hashedPassword });
            await user.save();

            // Generate a JSON Web Token
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });

            res.status(201).json({ username: user.name, token });
        } catch (error) {
            handleError(res, error, 'Error registering user');
        }
    }
);

// POST: Login a user
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // Check if the user exists
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            // Compare passwords
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            // Generate a JSON Web Token
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });

            res.status(200).json({ username: user.name, token });
        } catch (error) {
            handleError(res, error, 'Error logging in user');
        }
    }
);

module.exports = router;
