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

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const connectDB = require('./src/infrastructure/config/db');

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

const app = express();

connectDB().then(() => {
  // Seed only in development when explicitly enabled
  if (process.env.NODE_ENV === 'development' && process.env.RUN_SEED === 'true') {
    try {
      require('./seed/seed.js');
    } catch (err) {
      console.error('Seed error:', err.message);
    }
  }
}).catch((err) => {
  console.error('Database connection failed:', err.message);
});

const FRONTEND_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:3000';

// Security headers (helmet)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS - restrict to known origins
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['set-cookie', 'Set-Cookie'],
}));

app.options('*', cors());

// Body parsing - reasonable limit
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts, please try again later.'
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many password reset attempts, please try again later.'
});

// Apply rate limiters
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', passwordResetLimiter);
app.use('/api/auth/refresh-token', rateLimit({ windowMs: 60 * 1000, max: 5 }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check (single definition)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Clinic Appointment API running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  // Server started silently
});

// Graceful shutdown
process.on('SIGINT', async () => {
  server.close(async () => {
    await require('mongoose').connection.close();
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  server.close(async () => {
    await require('mongoose').connection.close();
    process.exit(0);
  });
});

module.exports = app;
