const jwt = require('jsonwebtoken');
const User = require('../models/User');

const secret = process.env.JWT_SECRET || "resilinked-secret";

// Verify JWT and attach user info
exports.verify = async (req, res, next) => {
    try {
        console.log('🔐 Auth Middleware - Starting verification');
        console.log('🔐 Request URL:', req.originalUrl);
        console.log('🔐 Request Method:', req.method);
        console.log('🔐 Headers:', {
            authorization: req.headers.authorization ? 'Present' : 'Missing',
            'content-type': req.headers['content-type']
        });

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ No Bearer token found');
            return res.status(401).json({ 
                success: false,
                message: "Unauthorized: no token provided" 
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            console.log('❌ Token is empty');
            return res.status(401).json({ 
                success: false,
                message: "Unauthorized: invalid token format" 
            });
        }

        console.log('🔐 Token received (first 20 chars):', token.substring(0, 20) + '...');

        // Verify token
        const decoded = jwt.verify(token, secret);
        console.log('🔐 Token decoded successfully:', {
            id: decoded.id,
            email: decoded.email,
            userType: decoded.userType
        });

        // Check if user exists in database
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            console.log('❌ User not found in database for ID:', decoded.id);
            return res.status(401).json({ 
                success: false,
                message: "Unauthorized: user not found" 
            });
        }

        console.log('🔐 User found:', {
            id: user._id,
            email: user.email,
            userType: user.userType,
            isVerified: user.isVerified
        });

        // Check if user is verified
        if (!user.isVerified) {
            console.log('❌ User not verified');
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

        console.log('✅ Authentication successful for user:', user.email);
        next();

    } catch (err) {
        console.error('❌ Auth middleware error:', err);
        
        if (err.name === 'TokenExpiredError') {
            console.log('❌ Token expired');
            return res.status(401).json({ 
                success: false,
                message: "Token expired. Please login again." 
            });
        }
        
        if (err.name === 'JsonWebTokenError') {
            console.log('❌ Invalid token');
            return res.status(401).json({ 
                success: false,
                message: "Invalid token. Please login again." 
            });
        }

        console.log('❌ Other authentication error');
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