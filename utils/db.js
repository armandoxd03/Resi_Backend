// MongoDB connection helper for Vercel serverless
const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log("✅ Using existing MongoDB connection");
    return;
  }

  try {
    const MONGODB_URI = process.env.MONGODB_URI || 
      "mongodb+srv://resilinked_db_admin:dDJwBzfpJvaBUQqt@resilinked.bddvynh.mongodb.net/ResiLinked?retryWrites=true&w=majority";

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,  // Increased from 5s to 10s
      socketTimeoutMS: 60000,            // Increased from 45s to 60s
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 60000               // Increased from 10s to 60s (1 minute)
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
