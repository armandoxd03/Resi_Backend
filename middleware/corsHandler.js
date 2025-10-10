const cors = require('cors');

/**
 * Configure CORS middleware with enhanced options and debugging
 * @returns {Function} Configured CORS middleware
 */
function configureCors() {
  const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173,https://resi-frontend.vercel.app").split(',').map(origin => origin.trim());
  
  // Always include localhost:5173 for development
  if (!allowedOrigins.includes('http://localhost:5173')) {
    allowedOrigins.push('http://localhost:5173');
  }
  
  console.log("🔒 CORS allowed origins:", allowedOrigins);
  
  // Set up CORS options
  const corsOptions = {
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests, etc)
      if (!origin) {
        console.log("🔑 CORS: Allowing request with no origin");
        return callback(null, true);
      }
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        console.log(`✅ CORS: Allowing origin: ${origin}`);
        callback(null, true);
      } else {
        console.log(`⚠️ CORS blocked origin: ${origin}`);
        // For development and testing, allow all origins but log warnings
        console.log(`🔓 CORS: Allowing: ${origin} (with warning)`);
        callback(null, true);
        // Uncomment below for stricter production settings
        // callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With', 
      'Accept', 
      'Origin',
      'Access-Control-Allow-Headers'
    ],
    exposedHeaders: ['Content-Disposition'],
    credentials: true,
    maxAge: 86400, // Cache preflight request for 1 day
    preflightContinue: false,
    optionsSuccessStatus: 204
  };
  
  return cors(corsOptions);
}

module.exports = configureCors;