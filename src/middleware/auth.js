const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET)

        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error in authMiddleware:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = authMiddleware;
