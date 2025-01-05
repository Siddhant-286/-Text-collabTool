const jwt = require('jsonwebtoken');

const { isTokenBlacklisted } = require('./blacklist');

const checkAuth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // Check if the token is blacklisted
        if (isTokenBlacklisted(token)) {
            return res.status(403).json({ message: 'Token has been invalidated' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to request object
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: 'Error verifying token' });
    }
};

module.exports = checkAuth;
