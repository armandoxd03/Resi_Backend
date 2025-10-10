require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const errorHandler = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimit");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const goalRoutes = require("./routes/goalRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const passwordResetTokenRoutes = require("./routes/passwordResetRoutes");
const analyticsRoutes = require('./routes/analyticsRoutes');
const activityRoutes = require('./routes/activityRoutes');
const exportRoutes = require('./routes/exportRoutes');

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb+srv://resilinked_db_admin:dDJwBzfpJvaBUQqt@resilinked.bddvynh.mongodb.net/ResiLinked?retryWrites=true&w=majority";

// ✅ MongoDB Connection
mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 60000,  // Increased timeout for Render
    socketTimeoutMS: 90000,
    maxPoolSize: 15,
    connectTimeoutMS: 60000
    // Removed unsupported keepAlive options
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    console.error(err.stack);
    // Don't exit in production to allow retries
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });

// App Initialization
const app = express();

// ✅ CORS (allow React frontend in dev)
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173").split(',').map(origin => origin.trim());
console.log("🔒 CORS allowed origins:", allowedOrigins);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log("❌ CORS blocked origin:", origin);
      callback(null, true); // Temporarily allow all origins to debug
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  maxAge: 86400 // Cache preflight request for 1 day
}));

// Add explicit CORS headers for maximum compatibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Remove global rate limiting

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Serve uploaded images
app.use("/public", express.static(path.join(__dirname, "public")));

// ✅ Main API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reset-tokens", passwordResetTokenRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/export", exportRoutes);

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
      corsAllowed: process.env.CLIENT_URL || "http://localhost:5173",
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

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Server listen with increased timeouts
const server = app.listen(PORT, () => {
  server.timeout = 120000; // 2 minutes
  server.keepAliveTimeout = 65000; // slightly higher than the ALB idle timeout
  server.headersTimeout = 66000; // slightly higher than keepAliveTimeout
  
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 CORS: Allowing ${process.env.CLIENT_URL || "http://localhost:5173"}`);
  console.log("💓 Health check endpoint: /health");
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (server && server.close) {
    server.close(() => {
      mongoose.connection.close();
      console.log('Process terminated');
    });
  } else {
    mongoose.connection.close();
    console.log('Process terminated (no active server)');
    process.exit(0);
  }
});

// Handle CTRL+C
process.on('SIGINT', () => {
  console.log('SIGINT received (Ctrl+C), shutting down gracefully');
  if (server && server.close) {
    server.close(() => {
      mongoose.connection.close();
      console.log('Process terminated');
      process.exit(0);
    });
  } else {
    mongoose.connection.close();
    console.log('Process terminated (no active server)');
    process.exit(0);
  }
});

module.exports = { app, mongoose };