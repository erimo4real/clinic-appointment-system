/**
 * =====================================================
 * CLINIC APPOINTMENT SYSTEM - Healthcare Scheduling Platform
 * =====================================================
 * 
 * Main entry point for the Node.js/Express backend server.
 * This file initializes the Express app, connects to MongoDB,
 * and sets up all API routes.
 * 
 * =====================================================
 * ENVIRONMENT VARIABLES REQUIRED:
 * - PORT: Server port (default: 5000)
 * - MONGODB_URI: MongoDB connection string
 * - JWT_SECRET: Secret key for JWT tokens
 * - JWT_REFRESH_SECRET: Secret key for refresh tokens
 * =====================================================
 */

// ============================================
// IMPORTS & CONFIGURATION
// ============================================

require('dotenv').config(); // Load environment variables from .env file
const express = require('express'); // Web framework
const cors = require('cors'); // Cross-Origin Resource Sharing
const connectDB = require('./src/infrastructure/config/db'); // MongoDB connection

// Route imports (Presentation Layer)
const authRoutes = require('./src/application/routes/authRoutes');
const doctorRoutes = require('./src/application/routes/doctorRoutes');
const serviceRoutes = require('./src/application/routes/serviceRoutes');
const appointmentRoutes = require('./src/application/routes/appointmentRoutes');
const uploadRoutes = require('./src/application/routes/uploadRoutes');
const adminRoutes = require('./src/application/routes/adminRoutes');
const feedbackRoutes = require('./src/application/routes/feedbackRoutes');

// ============================================
// EXPRESS APP INITIALIZATION
// ============================================

const app = express(); // Create Express application instance

// ============================================
// DATABASE CONNECTION
// ============================================

// Connect to MongoDB database
// If connection fails, the server will not start
// Check console output for connection status
connectDB();

// ============================================
// MIDDLEWARE SETUP
// ============================================

/**
 * CORS Middleware
 * Allows cross-origin requests from frontend
 * In production, restrict this to your frontend domain
 */
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

/**
 * JSON Parser Middleware
 * Parses incoming JSON requests
 * limit: 10MB max payload size
 */
app.use(express.json({ limit: '10mb' }));

/**
 * URL Encoded Parser Middleware
 * Parses URL-encoded form data
 * extended: true allows rich objects/arrays
 */
app.use(express.urlencoded({ extended: true }));

// ============================================
// API ROUTES
// ============================================

// Authentication routes (login, register, password reset, etc.)
app.use('/api/auth', authRoutes);

// Doctor management CRUD operations
app.use('/api/doctors', doctorRoutes);

// Service/Clinic services management
app.use('/api/services', serviceRoutes);

// Appointment scheduling & management
app.use('/api/appointments', appointmentRoutes);

// File upload routes (Cloudinary)
app.use('/api/upload', uploadRoutes);

// Admin routes (requires admin role)
app.use('/api/admin', adminRoutes);

// Feedback routes (patient feedback for doctors)
app.use('/api/feedback', feedbackRoutes);

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

/**
 * GET /api/health
 * Health check endpoint to verify server is running
 * Useful for monitoring and load balancers
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Clinic Appointment API running',
    timestamp: new Date().toISOString() // Useful for debugging - shows server time
  });
});

// ============================================
// ERROR HANDLING - 404 NOT FOUND
// ============================================

// Catch-all for undefined routes
// This should be placed after all other routes
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path, // Helpful for debugging - shows which path was not found
    method: req.method // Shows which HTTP method was used
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================

/**
 * Global error handling middleware
 * Catches all unhandled errors across the application
 * Logs error details for debugging
 */
app.use((err, req, res, next) => {
  console.error('===========================================');
  console.error('ERROR OCCURRED:');
  console.error('-------------------------------------------');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  console.error('Path:', req.path);
  console.error('Method:', req.method);
  console.error('Body:', req.body); // May contain sensitive data - be careful in production
  console.error('===========================================');
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    // Include stack trace in development only
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('===========================================');
  console.log('🏥 CLINIC APPOINTMENT SYSTEM');
  console.log('===========================================');
  console.log(`Server running on port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI}`);
  console.log('===========================================');
  console.log('API Endpoints:');
  console.log('  - Auth:     http://localhost:' + PORT + '/api/auth');
  console.log('  - Doctors:  http://localhost:' + PORT + '/api/doctors');
  console.log('  - Services: http://localhost:' + PORT + '/api/services');
  console.log('  - Appoint:   http://localhost:' + PORT + '/api/appointments');
  console.log('  - Health:   http://localhost:' + PORT + '/api/health');
  console.log('===========================================');
});

module.exports = app; // Export for testing purposes
