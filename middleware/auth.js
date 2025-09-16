const jwt = require('jsonwebtoken');
const User = require('../models/User');

const secret = process.env.JWT_SECRET || "resilinked-secret";

// Verify JWT and attach user info
exports.verify = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Unauthorized: no token" });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, secret);

        // Attach user info from token
        req.user = {
            id: decoded.id,
            email: decoded.email,
            userType: decoded.userType
        };

        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized: invalid token" });
    }
};

// Optional: admin check without DB query
exports.verifyAdmin = (req, res, next) => {
    if (!req.user || req.user.userType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};

// JWT creation
exports.createAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, userType: user.userType },
        secret,
        { expiresIn: '12h' }
    );
};
