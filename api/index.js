// Vercel serverless function entry point
// Ultra-defensive loading with detailed error tracking

console.log('🚀 Vercel function starting...');
console.log('📍 Node version:', process.version);
console.log('📍 Platform:', process.platform);

let app;
let appLoadError;

try {
  console.log('📦 Attempting to load app.js...');
  app = require('../app');
  console.log('✅ app.js loaded successfully');
} catch (error) {
  console.error('❌ CRITICAL: Failed to load app.js:', {
    message: error.message,
    stack: error.stack,
    code: error.code,
    name: error.name
  });
  appLoadError = error;
}

module.exports = async (req, res) => {
  try {
    // Set CORS headers immediately - BEFORE anything else
    const origin = req.headers.origin;
    if (origin && (origin.includes('localhost') || origin.includes('vercel.app'))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Cache-Control, Pragma');

    // Handle OPTIONS immediately
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // If app failed to load, return detailed error
    if (appLoadError) {
      console.error('❌ Returning app load error to client');
      return res.status(500).json({
        success: false,
        message: 'Failed to initialize backend',
        error: appLoadError.message,
        errorName: appLoadError.name,
        errorCode: appLoadError.code,
        stack: appLoadError.stack,
        alert: 'Server initialization failed. Check Vercel logs for details.',
        debug: {
          nodeVersion: process.version,
          platform: process.platform,
          env: process.env.VERCEL_ENV || 'unknown',
          hasMongoUri: !!process.env.MONGODB_URI,
          hasJwtSecret: !!process.env.JWT_SECRET
        }
      });
    }

    // Pass to Express app
    await app(req, res);
  } catch (error) {
    // Log the full error for debugging
    console.error('❌ Vercel function error:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method
    });

    // Ensure CORS headers are still set on error
    try {
      const origin = req.headers.origin;
      if (origin && (origin.includes('localhost') || origin.includes('vercel.app'))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } catch (headerError) {
      console.error('Failed to set error response headers:', headerError);
    }

    // Send error response
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
        stack: error.stack,
        alert: 'The server encountered an error. Please try again later.'
      });
    }
  }
};
