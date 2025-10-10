const cors = require('cors');

/**
 * Configure CORS middleware with enhanced options and debugging
 * @returns {Function} Configured CORS middleware
 */
function configureCors() {
  const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173").split(',').map(origin => origin.trim());
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
        // For debugging only - allow all origins but log the blocked ones
        if (process.env.NODE_ENV === 'development' || process.env.CORS_DEBUG === 'true') {
          console.log(`🔓 CORS: Development mode or debug enabled - allowing: ${origin}`);
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
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