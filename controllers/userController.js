const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { addTokenToBlacklist } = require('../utils/blacklist');
const { isTokenBlacklisted } = require('../utils/blacklist');
// Centralized error handling function
const handleError = (res, error, message = 'Server error', status = 500) => {
    console.error(message, error);
    res.status(status).json({ message });
};

// User register route
module.exports.register = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),

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

            // Create a new user (no need to hash password here as it will be hashed in the pre-save hook)
            const user = new User({ name, email, password });
            await user.save();

            // Generate a JWT
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            // Send response with success flag
            res.status(201).json({
                success: true,
                username: user.name,
                token,
            });
        } catch (error) {
            handleError(res, error, 'Error registering user');
        }
    }
];

// User login route
module.exports.login = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),

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
                console.log('User not found in the database');
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            // Debugging logs for password comparison
            console.log('User found:', user);
            console.log('Received Password:', JSON.stringify(password));
            console.log('Stored Hashed Password:', user.password);

            // Compare password using bcrypt
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            // Generate JWT token
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            // Send response with success flag
            res.status(200).json({
                success: true,
                username: user.name,
                token,
            });
        } catch (error) {
            handleError(res, error, 'Error logging in user');
        }
    }
];

module.exports.logout = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(400).json({ message: 'Token is required for logout' });
    }

    try {
        // Decode the token to validate it before blacklisting
        jwt.verify(token, process.env.JWT_SECRET);

        // Add token to blacklist
        addTokenToBlacklist(token);

        res.status(200).json({ message: 'Successfully logged out' });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: 'Server error while logging out' });
    }
};

module.exports.verifySession = (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
  
    try {
      // Check if the token is blacklisted
      if (isTokenBlacklisted(token)) {
        return res.status(403).json({ message: 'Token is invalid' });
      }
  
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.status(200).json({ message: 'Session is valid', user: decoded });
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  };