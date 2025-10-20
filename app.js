require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const errorHandler = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimit");
const connectDB = require("./utils/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const goalRoutes = require("./routes/goalRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const reportRoutes = require("./routes/reportRoutes");
const supportTicketRoutes = require("./routes/supportTicketRoutes");
const messageRoutes = require("./routes/messageRoutes");
const adminRoutes = require("./routes/adminRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const passwordResetTokenRoutes = require("./routes/passwordResetRoutes");
const analyticsRoutes = require('./routes/analyticsRoutes');
const activityRoutes = require('./routes/activityRoutes');
const exportRoutes = require('./routes/exportRoutes');
const softDeleteRoutes = require('./routes/softDeleteRoutes');
const { createNotification } = require('./utils/notificationHelper');

const PORT = process.env.PORT || 5000;

// ✅ Connect to MongoDB (reuses connection in serverless)
connectDB().catch(err => {
  console.error("❌ Initial MongoDB connection failed:", err.message);
  // Don't exit - let it retry on next request
});

// App Initialization
const app = express();
// Fix: Trust proxy for correct rate limiting behind Render/other proxies
app.set('trust proxy', 1);

// ✅ CORS (allow React frontend in dev and Vercel deployments)
let allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173").split(',').map(origin => origin.trim());

// Ensure localhost is always allowed for development
if (!allowedOrigins.includes('http://localhost:5173')) {
  allowedOrigins.push('http://localhost:5173');
}

console.log("🔒 CORS allowed origins:", allowedOrigins);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost (development)
    if (origin.includes('localhost')) {
      console.log("🔓 CORS allowing localhost origin:", origin);
      return callback(null, true);
    }
    
    // Allow all Vercel deployments (vercel.app domain)
    if (origin.includes('vercel.app')) {
      console.log("🔓 CORS allowing Vercel origin:", origin);
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    console.log("❌ CORS blocked origin:", origin);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cache-Control', 'cache-control', 'Pragma'],
  credentials: true,
  maxAge: 86400 // Cache preflight request for 1 day
}));

// Add explicit CORS headers for maximum compatibility
app.use((req, res, next) => {
  // Allow localhost:5173 explicitly for development
  const origin = req.headers.origin;
  if (origin && (origin.includes('localhost') || allowedOrigins.includes(origin))) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', allowedOrigins[0]);
  }
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, cache-control, Pragma');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    return res.status(204).end();
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, cache-control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Remove global rate limiting

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Serve uploaded images
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Main API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/support", supportTicketRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reset-tokens", passwordResetTokenRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/admin/soft-delete", softDeleteRoutes);

// Test notification endpoint for debugging
app.post("/api/test-notification", async (req, res) => {
  try {
    const { recipient, message, type } = req.body;
    
    if (!recipient || !message || !type) {
      return res.status(400).json({ 
        error: "Missing required fields",
        required: ["recipient", "message", "type"] 
      });
    }
    
    const result = await createNotification({
      recipient,
      message,
      type,
      relatedJob: req.body.relatedJob || null
    });
    
    res.status(200).json({
      success: true,
      notification: result,
      message: "Test notification created successfully"
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// ✅ Enhanced Health check with database status
app.get("/health", async (req, res) => {
  try {
    // Check database connection
    await mongoose.connection.db.admin().ping();
    
    res.status(200).json({
      status: "healthy",
      database: "connected",
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      corsAllowed: process.env.CORS_ORIGIN || "http://localhost:5173",
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message,
      timestamp: new Date()
    });
  }
});

// ✅ Global error handler (must be last)
app.use(errorHandler);

// Only start local server if NOT on Vercel
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 CORS: Allowing ${process.env.CORS_ORIGIN || "http://localhost:5173"}`);
    console.log("💓 Health check endpoint: /health");
  });

  // Graceful shutdown for local development
  const gracefulShutdown = () => {
    console.log('Shutting down gracefully...');
    server.close(() => {
      mongoose.connection.close(false, () => {
        console.log('Process terminated');
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

// Export app for Vercel serverless / AWS Lambda
module.exports = app;