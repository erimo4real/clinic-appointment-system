/**
 * =====================================================
 * DATABASE CONFIGURATION
 * =====================================================
 * 
 * MongoDB connection setup using Mongoose ODM.
 * This file handles the database connection lifecycle
 * and provides debugging information.
 * 
 * =====================================================
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * 
 * This function:
 * 1. Attempts to connect to MongoDB using the URI from environment variables
 * 2. Logs connection status for debugging
 * 3. Exits process with error code 1 if connection fails
 * 
 * @async
 * @function connectDB
 * @returns {Promise<void>}
 * 
 * @example
 * // Usage in server.js
 * const connectDB = require('./config/db');
 * connectDB();
 */
const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variables
    // Default to localhost if not set
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clinic_appointment';
    
    console.log('-------------------------------------------');
    console.log('Connecting to MongoDB...');
    console.log('URI:', mongoURI);
    console.log('-------------------------------------------');
    
    // Connect to MongoDB with options
    // These options ensure better connection handling
    const conn = await mongoose.connect(mongoURI, {
      // Retry connection on failure
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if can't connect
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Max number of connections in pool
      minPoolSize: 2, // Min number of connections in pool
    });
    
    // Log successful connection details
    console.log('✅ MongoDB Connected Successfully!');
    console.log('-------------------------------------------');
    console.log('Connection Details:');
    console.log(`  Host: ${conn.connection.host}`);
    console.log(`  Port: ${conn.connection.port}`);
    console.log(`  Database: ${conn.connection.name}`);
    console.log(`  State: ${conn.connection.states[conn.connection.readyState]}`);
    console.log('===========================================');
    
  } catch (error) {
    // Handle connection errors
    console.error('===========================================');
    console.error('❌ MongoDB Connection Failed!');
    console.error('-------------------------------------------');
    console.error('Error Message:', error.message);
    console.error('-------------------------------------------');
    
    // Provide helpful debugging information based on error type
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 DEBUG: MongoDB server is not running.');
      console.error('   Start MongoDB with: mongod');
      console.error('   Or check if MongoDB is installed correctly.');
    } else if (error.message.includes('authentication')) {
      console.error('💡 DEBUG: Authentication failed.');
      console.error('   Check your username and password in MONGODB_URI');
      console.error('   Format: mongodb://user:password@host:port/database');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('💡 DEBUG: Cannot resolve hostname.');
      console.error('   Check the host in MONGODB_URI');
      console.error('   Make sure MongoDB host is reachable.');
    }
    
    console.error('===========================================');
    
    // Exit process with failure code
    // This prevents the app from running without a database
    process.exit(1);
  }
};

// ============================================
// MONGOOSE EVENT LISTENERS (DEBUGGING)
// ============================================

// Log connection events for debugging
mongoose.connection.on('connected', () => {
  console.log('[Mongoose] Connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('[Mongoose] Connection Error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('[Mongoose] Connection disconnected');
});

// Log when mongoose attempts to reconnect
mongoose.connection.on('reconnect', () => {
  console.log('[Mongoose] Reconnecting to MongoDB...');
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

// Close MongoDB connection when Node process ends
// This ensures all connections are properly closed
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('[Mongoose] Connection closed due to app termination');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  console.log('[Mongoose] Connection closed due to app termination');
  process.exit(0);
});

module.exports = connectDB;
