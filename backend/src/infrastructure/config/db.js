/**
 * =====================================================
 * DATABASE CONFIGURATION
 * =====================================================
 * 
 * MongoDB connection setup using the Mongoose ODM.
 * Handles the database connection lifecycle with
 * automatic reconnection and graceful shutdown.
 * 
 * =====================================================
 */

const mongoose = require('mongoose');

/**
 * Establishes connection to MongoDB database.
 * 
 * This function:
 * 1. Retrieves the MongoDB URI from environment variables
 * 2. Attempts to connect with optimized connection settings
 * 3. Logs connection status for monitoring
 * 4. Exits the process if connection fails (fail-fast approach)
 * 
 * @async
 * @function connectDB
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variables
    // Falls back to localhost if not configured
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clinic_appointment';
    
    // Connect to MongoDB with connection pool settings
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,  // Timeout for server selection
      socketTimeoutMS: 45000,          // Close sockets after 45 seconds of inactivity
      maxPoolSize: 10,                 // Maximum number of connections in pool
      minPoolSize: 2,                 // Minimum number of connections in pool
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Exit with error code to prevent app from running without database
    process.exit(1);
  }
};

// Handle successful connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

// Handle connection errors
mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err.message);
});

// Handle disconnection events
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Handle reconnection attempts
mongoose.connection.on('reconnect', () => {
  console.log('Mongoose reconnecting to MongoDB...');
});

/**
 * Graceful shutdown handlers.
 * Ensures database connections are properly closed
 * when the application is terminated.
 */

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed through app termination');
  process.exit(0);
});

// Handle SIGTERM (Docker stop, etc.)
process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed through app termination');
  process.exit(0);
});

module.exports = connectDB;
