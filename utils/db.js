// MongoDB connection helper for Vercel serverless
const mongoose = require("mongoose");

let isConnected = false;

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
  isConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected from MongoDB');
  isConnected = false;
});

const connectDB = async () => {
  // Check if connection is healthy
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log("✅ Using existing MongoDB connection");
    return;
  }

  // Reset connection flag if mongoose reports disconnected state
  if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
    isConnected = false;
  }

  try {
    const MONGODB_URI = process.env.MONGODB_URI || 
      "mongodb+srv://resilinked_db_admin:dDJwBzfpJvaBUQqt@resilinked.bddvynh.mongodb.net/ResiLinked?retryWrites=true&w=majority";

    console.log("🔄 Connecting to MongoDB...");
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,  // 30 seconds for initial connection
      socketTimeoutMS: 900000,           // 15 minutes socket timeout
      maxPoolSize: 10,
      minPoolSize: 1,                    // Optimized for Vercel serverless
      maxIdleTimeMS: 900000,             // 15 minutes idle timeout (900000ms = 15 min)
      retryWrites: true,
      retryReads: true
    });

    isConnected = true;
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    isConnected = false;
    throw err;
  }
};

module.exports = connectDB;
