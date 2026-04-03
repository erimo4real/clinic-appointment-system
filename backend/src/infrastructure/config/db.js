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

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clinic_appointment';
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    
  } catch (error) {
    process.exit(1);
  }
};

mongoose.connection.on('error', () => {
  // Silent fail
});

mongoose.connection.on('disconnected', () => {
  // Silent fail
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = connectDB;
