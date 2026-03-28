/**
 * =====================================================
 * CLINIC APPOINTMENT SYSTEM - Healthcare Scheduling Platform
 * =====================================================
 * 
 * Main entry point for the Node.js/Express backend server.
 * Initializes the Express app, connects to MongoDB,
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

// Load environment variables from .env file
require('dotenv').config();

// Import required packages
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Import database connection function
const connectDB = require('./src/infrastructure/config/db');

// Import all route handlers
// Each route file handles a specific domain of the API
const authRoutes = require('./src/application/routes/authRoutes');
const doctorRoutes = require('./src/application/routes/doctorRoutes');
const serviceRoutes = require('./src/application/routes/serviceRoutes');
const appointmentRoutes = require('./src/application/routes/appointmentRoutes');
const uploadRoutes = require('./src/application/routes/uploadRoutes');
const adminRoutes = require('./src/application/routes/adminRoutes');
const feedbackRoutes = require('./src/application/routes/feedbackRoutes');

// Create Express application instance
const app = express();

// Connect to MongoDB database
// The server will exit with code 1 if connection fails
connectDB().then(() => {
  // Run seed if RUN_SEED is true
  if (process.env.RUN_SEED === 'true' || process.env.RUN_SEED === '1') {
    console.log('Running database seed...');
    try {
      require('./seed/seed.js');
      console.log('Database seeding complete');
    } catch (err) {
      console.error('Seed error:', err.message);
    }
  }
}).catch(err => {
  console.error('Database connection error:', err.message);
});

const FRONTEND_ORIGIN = process.env.FRONTEND_URL || '*';

/**
 * CORS Middleware
 * Allows cross-origin requests from the frontend application.
 * In production, you should restrict this to your specific frontend domain.
 */
app.use(cors({
  origin: true,
  credentials: true,
}));

/**
 * JSON Parser Middleware
 * Parses incoming JSON requests with a maximum payload size of 10MB.
 * This is necessary for handling larger request bodies like file uploads.
 */
app.use(express.json({ limit: '10mb' }));

/**
 * URL Encoded Parser Middleware
 * Parses URL-encoded form data (typically from HTML forms).
 * The 'extended: true' option allows for rich objects and arrays.
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Cookie Parser Middleware
 * Parses cookies from the request header
 */
app.use(cookieParser());

/**
 * =====================================================
 * API ROUTE REGISTRATION
 * =====================================================
 * All API routes are prefixed with /api for consistency.
 * Routes are organized by domain (auth, doctors, services, etc.)
 */

// Authentication routes - handles login, register, password reset
app.use('/api/auth', authRoutes);

// Doctor management routes - CRUD operations for doctor profiles
app.use('/api/doctors', doctorRoutes);

// Service/Clinic services routes - manage available medical services
app.use('/api/services', serviceRoutes);

// Appointment scheduling routes - booking and appointment management
app.use('/api/appointments', appointmentRoutes);

// File upload routes - handles profile images and documents via Cloudinary
app.use('/api/upload', uploadRoutes);

// Admin routes - protected routes for administrative tasks
app.use('/api/admin', adminRoutes);

// Feedback routes - patient feedback system for doctors
app.use('/api/feedback', feedbackRoutes);

/**
 * =====================================================
 * HEALTH CHECK ENDPOINT
 * =====================================================
 * A simple endpoint to verify the server is running.
 * Useful for monitoring services and load balancers.
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Clinic Appointment API running',
    timestamp: new Date().toISOString()
  });
});

/**
 * =====================================================
 * 404 NOT FOUND HANDLER
 * =====================================================
 * Catches all requests to undefined routes.
 * Should be placed after all valid routes.
 */
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

/**
 * =====================================================
 * GLOBAL ERROR HANDLER
 * =====================================================
 * Catches all unhandled errors across the application.
 * Logs error details for debugging and returns a
 * standardized error response to the client.
 */
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    // Include stack trace only in development environment
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

/**
 * =====================================================
 * SERVER STARTUP
 * =====================================================
 * Starts the Express server on the configured port.
 * The port is read from environment variables with a default of 5000.
 */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Export app for testing purposes
module.exports = app;
