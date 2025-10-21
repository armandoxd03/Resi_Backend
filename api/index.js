// Vercel serverless function entry point
const app = require('../app');

// Wrap the app to ensure CORS headers are ALWAYS sent, even on crashes
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
        error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message,
        alert: 'The server encountered an error. Please try again later.'
      });
    }
  }
};
