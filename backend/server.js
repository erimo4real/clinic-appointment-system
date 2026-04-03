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
const medicalRecordRoutes = require('./src/application/routes/medicalRecordRoutes');
const prescriptionRoutes = require('./src/application/routes/prescriptionRoutes');
const searchRoutes = require('./src/application/routes/searchRoutes');
const notificationRoutes = require('./src/application/routes/notificationRoutes');

// Create Express application instance
const app = express();

// Connect to MongoDB database
// The server will exit with code 1 if connection fails
connectDB().then(() => {
  // Run seed if RUN_SEED is true
  if (process.env.RUN_SEED === 'true' || process.env.RUN_SEED === '1') {
    try {
      require('./seed/seed.js');
    } catch (err) {
      // Silent fail for seed errors
    }
  }
}).catch(() => {
  // Silent fail - process.exit handled in db.js
});

const FRONTEND_ORIGIN = (process.env.FRONTEND_URL || 'https://clinic-appointment-management-sys.netlify.app').replace(/\/$/, '');

/**
 * CORS Middleware
 * Allows cross-origin requests from the frontend application.
 */
app.use(cors({
  origin: true, // Reflect the request origin for cross-origin cookies
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['set-cookie', 'Set-Cookie'],
  Vary: 'Origin'
}));

// Handle preflight requests
app.options('*', cors());

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

// Medical records routes
app.use('/api/medical-records', medicalRecordRoutes);

// Prescriptions routes
app.use('/api/prescriptions', prescriptionRoutes);

// Search routes
app.use('/api/search', searchRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

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
 * Seed endpoint - creates admin user and basic data
 */
app.get('/api/seed', async (req, res) => {
  try {
    const User = require('./src/domain/entities/User');
    const Service = require('./src/domain/entities/Service');
    const bcrypt = require('bcryptjs');
    
    const adminExists = await User.findOne({ email: 'admin@medbookpro.com' });
    if (adminExists) {
      return res.json({ message: 'Already seeded! Login with admin@medbookpro.com / admin123' });
    }
    
    const admin = await User.create({
      username: 'admin',
      email: 'admin@medbookpro.com',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      phone: '+1234567890'
    });
    
    await Service.insertMany([
      { name: 'General Consultation', description: 'Standard consultation', price: 8000, duration: 30, isActive: true },
      { name: 'Cardiac Checkup', description: 'Heart health evaluation', price: 25000, duration: 60, isActive: true },
      { name: 'Pediatric Checkup', description: 'Child health examination', price: 10000, duration: 45, isActive: true },
    ]);
    
    res.json({ message: 'Seeded! Login: admin@medbookpro.com / admin123' });
  } catch (err) {
    res.status(500).json({ message: 'Error: ' + err.message });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Clinic Appointment API running' });
});

/**
 * Debug endpoint - check if cookies are being received
 */
app.get('/api/debug/cookies', (req, res) => {
  res.json({ 
    cookies: req.cookies,
    hasAccessToken: !!req.cookies.accessToken,
    frontendOrigin: FRONTEND_ORIGIN
  });
});

/**
 * =====================================================
 * 404 HANDLER
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
  // Server started silently
});

// Export app for testing purposes
module.exports = app;
