const jwt = require('jsonwebtoken');
const User = require('../models/User');

const secret = process.env.JWT_SECRET || "resilinked-secret";

// Verify JWT and attach user info
exports.verify = async (req, res, next) => {
    try {
        console.log('Auth middleware - Headers:', req.headers);
        
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('No auth header or invalid format');
            return res.status(401).json({ 
                success: false,
                message: "Unauthorized: no token provided" 
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            console.log('No token found in header');
            return res.status(401).json({ 
                success: false,
                message: "Unauthorized: invalid token format" 
            });
        }

        console.log('Verifying token...');
        
        // Verify token
        const decoded = jwt.verify(token, secret);
        console.log('Token decoded:', decoded);

        // Check if user exists in database
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            console.log('User not found in database for ID:', decoded.id);
            return res.status(401).json({ 
                success: false,
                message: "Unauthorized: user not found" 
            });
        }

        // Check if user is verified
        if (!user.isVerified) {
            console.log('User not verified:', user.email);
            return res.status(403).json({ 
                success: false,
                message: "Account not verified. Please verify your account first." 
            });
        }

        // Attach complete user info to request
        req.user = {
            id: user._id,
            email: user.email,
            userType: user.userType,
            firstName: user.firstName,
            lastName: user.lastName,
            isVerified: user.isVerified
        };

        console.log('User authenticated successfully:', {
            id: user._id,
            email: user.email,
            userType: user.userType
        });

        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: "Token expired. Please login again." 
            });
        }
        
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: "Invalid token. Please login again." 
            });
        }

        return res.status(401).json({ 
            success: false,
            message: "Authentication failed" 
        });
    }
};

// Optional: admin check without DB query
exports.verifyAdmin = (req, res, next) => {
    if (!req.user || req.user.userType !== 'admin') {
        return res.status(403).json({ 
            success: false,
            message: "Admin access required" 
        });
    }
    next();
};

// JWT creation
exports.createAccessToken = (user) => {
    return jwt.sign(
        { 
            id: user._id, 
            email: user.email, 
            userType: user.userType 
        },
        secret,
        { expiresIn: '12h' }
    );
};