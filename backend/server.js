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
    const Doctor = require('./src/domain/entities/Doctor');
    const Service = require('./src/domain/entities/Service');
    const Appointment = require('./src/domain/entities/Appointment');
    const bcrypt = require('bcryptjs');
    
    const adminExists = await User.findOne({ email: 'admin@medbookpro.com' });
    if (adminExists) {
      return res.json({ message: 'Already seeded! Login with admin@medbookpro.com / admin123' });
    }
    
    // Clear existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Service.deleteMany({});
    await Appointment.deleteMany({});
    
    // Create admin
    const admin = await User.create({
      username: 'admin',
      email: 'admin@medbookpro.com',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      phone: '+1234567890'
    });
    
    // Create receptionist
    const receptionist = await User.create({
      username: 'staff',
      email: 'staff@medbookpro.com',
      password: await bcrypt.hash('staff123', 10),
      firstName: 'Mary',
      lastName: 'Johnson',
      role: 'receptionist',
      phone: '+1234567899'
    });
    
    // Create 20 services
    const services = await Service.insertMany([
      { name: 'General Consultation', description: 'Standard consultation with a general practitioner', price: 8000, duration: 30, isActive: true },
      { name: 'Annual Physical Exam', description: 'Comprehensive yearly health examination', price: 20000, duration: 60, isActive: true },
      { name: 'Cardiac Checkup', description: 'Complete heart health evaluation', price: 25000, duration: 60, isActive: true },
      { name: 'Pediatric Checkup', description: 'Health examination for children', price: 10000, duration: 45, isActive: true },
      { name: 'Dermatology Consultation', description: 'Skin health evaluation', price: 12000, duration: 30, isActive: true },
      { name: 'Orthopedic Evaluation', description: 'Musculoskeletal assessment', price: 15000, duration: 45, isActive: true },
      { name: 'Neurology Consultation', description: 'Neurological conditions evaluation', price: 18000, duration: 45, isActive: true },
      { name: 'Eye Examination', description: 'Vision testing and eye health', price: 10000, duration: 40, isActive: true },
      { name: 'Mental Health Consultation', description: 'Psychiatric evaluation', price: 17000, duration: 60, isActive: true },
      { name: 'Blood Test Panel', description: 'Comprehensive blood work', price: 7500, duration: 15, isActive: true },
      { name: 'X-Ray Imaging', description: 'Diagnostic X-ray imaging', price: 10000, duration: 30, isActive: true },
      { name: 'Ultrasound Scan', description: 'Non-invasive imaging', price: 18000, duration: 45, isActive: true },
      { name: 'CT Scan', description: 'Computed tomography imaging', price: 35000, duration: 30, isActive: true },
      { name: 'MRI Scan', description: 'Magnetic resonance imaging', price: 50000, duration: 60, isActive: true },
      { name: 'ECG/EKG', description: 'Electrocardiogram test', price: 6000, duration: 20, isActive: true },
      { name: 'Vaccination', description: 'Various vaccinations', price: 4500, duration: 15, isActive: true },
      { name: 'Wound Care', description: 'Professional wound treatment', price: 8500, duration: 30, isActive: true },
      { name: 'Allergy Testing', description: 'Comprehensive allergy screening', price: 15000, duration: 45, isActive: true },
      { name: 'Diabetes Management', description: 'Comprehensive diabetes care', price: 12000, duration: 40, isActive: true },
      { name: 'Pre-Surgical Consultation', description: 'Pre-operative assessment', price: 13000, duration: 45, isActive: true }
    ]);
    
    // Doctor services mapping
    // Each doctor gets exactly 3 unique services (indexes: 0-19)
    const doctorServicesMap = {
      'Cardiology': [services[2]._id, services[14]._id, services[1]._id],
      'General Medicine': [services[0]._id, services[9]._id, services[15]._id],
      'Pediatrics': [services[3]._id, services[15]._id, services[17]._id],
      'Dermatology': [services[4]._id, services[17]._id, services[1]._id],
      'Orthopedics': [services[5]._id, services[10]._id, services[9]._id],
      'Neurology': [services[6]._id, services[12]._id, services[9]._id],
      'Gastroenterology': [services[9]._id, services[11]._id, services[0]._id],
      'Ophthalmology': [services[7]._id, services[9]._id, services[1]._id],
      'Psychiatry': [services[8]._id, services[1]._id, services[9]._id],
      'Pulmonology': [services[9]._id, services[10]._id, services[12]._id],
      'Endocrinology': [services[18]._id, services[9]._id, services[1]._id],
      'Urology': [services[9]._id, services[11]._id, services[10]._id],
      'Gynecology': [services[11]._id, services[9]._id, services[15]._id],
      'Oncology': [services[9]._id, services[12]._id, services[1]._id],
      'Rheumatology': [services[9]._id, services[17]._id, services[10]._id]
    };
    
    // Ensure each doctor gets unique services (slice to 3 to be safe)
    const getDoctorServices = (specialty) => {
      const docs = doctorServicesMap[specialty] || [services[0]._id];
      return docs.slice(0, 3);
    };
    
    const doctorData = [
      { firstName: 'John', lastName: 'Smith', specialty: 'Cardiology', qualification: 'MD, FACC', experience: 15, bio: 'Board-certified cardiologist', fee: 15000 },
      { firstName: 'Sarah', lastName: 'Jones', specialty: 'General Medicine', qualification: 'MD, MBBS', experience: 10, bio: 'General practitioner', fee: 8000 },
      { firstName: 'David', lastName: 'Lee', specialty: 'Pediatrics', qualification: 'MD, FAAP', experience: 12, bio: 'Pediatric specialist', fee: 10000 },
      { firstName: 'Emily', lastName: 'Brown', specialty: 'Dermatology', qualification: 'MD, FAAD', experience: 8, bio: 'Dermatologist', fee: 12000 },
      { firstName: 'Michael', lastName: 'Wilson', specialty: 'Orthopedics', qualification: 'MD, FAAOS', experience: 20, bio: 'Orthopedic surgeon', fee: 20000 },
      { firstName: 'Jennifer', lastName: 'Roberts', specialty: 'Neurology', qualification: 'MD, PhD', experience: 14, bio: 'Neurologist', fee: 18000 },
      { firstName: 'Carlos', lastName: 'Martinez', specialty: 'Gastroenterology', qualification: 'MD, FACG', experience: 11, bio: 'Gastroenterologist', fee: 16000 },
      { firstName: 'Min-jun', lastName: 'Kim', specialty: 'Ophthalmology', qualification: 'MD, FACS', experience: 9, bio: 'Ophthalmologist', fee: 14000 },
      { firstName: 'Amanda', lastName: 'Taylor', specialty: 'Psychiatry', qualification: 'MD, FAPA', experience: 13, bio: 'Psychiatrist', fee: 17000 },
      { firstName: 'Robert', lastName: 'Anderson', specialty: 'Pulmonology', qualification: 'MD, FCCP', experience: 16, bio: 'Pulmonologist', fee: 15500 },
      { firstName: 'Lisa', lastName: 'Thomas', specialty: 'Endocrinology', qualification: 'MD, FACE', experience: 10, bio: 'Endocrinologist', fee: 14500 },
      { firstName: 'James', lastName: 'White', specialty: 'Urology', qualification: 'MD, FACS', experience: 18, bio: 'Urologist', fee: 16500 },
      { firstName: 'Michelle', lastName: 'Harris', specialty: 'Gynecology', qualification: 'MD, FACOG', experience: 12, bio: 'OB/GYN', fee: 13000 },
      { firstName: 'William', lastName: 'Clark', specialty: 'Oncology', qualification: 'MD, FACP', experience: 22, bio: 'Oncologist', fee: 22000 },
      { firstName: 'Susan', lastName: 'Lewis', specialty: 'Rheumatology', qualification: 'MD, FACR', experience: 11, bio: 'Rheumatologist', fee: 15000 }
    ];
    
    // Create doctors
    for (const doc of doctorData) {
      const user = await User.create({
        username: doc.firstName.toLowerCase() + doc.lastName.toLowerCase(),
        email: `dr.${doc.firstName.toLowerCase()}.${doc.lastName.toLowerCase()}@medbookpro.com`,
        password: await bcrypt.hash('doctor123', 10),
        firstName: doc.firstName,
        lastName: doc.lastName,
        role: 'doctor',
        phone: '+1234567890'
      });
      
      await Doctor.create({
        user: user._id,
        specialty: doc.specialty,
        qualification: doc.qualification,
        experience: doc.experience,
        bio: doc.bio,
        consultationFee: doc.fee,
        isAvailable: true,
        services: getDoctorServices(doc.specialty)
      });
    }
    
    // Create 15 patients
    const patients = ['Alice Johnson', 'Bob Williams', 'Carol Davis', 'Daniel Miller', 'Emma Wilson', 'Frank Moore', 'Grace Taylor', 'Henry Anderson', 'Ivy Thomas', 'Jack Jackson', 'Kate White', 'Leo Harris', 'Mia Martin', 'Noah Garcia', 'Olivia Martinez'];
    for (let i = 0; i < patients.length; i++) {
      const name = patients[i].split(' ');
      await User.create({
        username: 'patient' + (i + 1),
        email: `patient${i + 1}@example.com`,
        password: await bcrypt.hash('patient123', 10),
        firstName: name[0],
        lastName: name[1],
        role: 'patient',
        phone: '+123456780' + (i + 1)
      });
    }
    
    res.json({ 
      message: 'Seeded successfully!',
      accounts: {
        admin: 'admin@medbookpro.com / admin123',
        receptionist: 'staff@medbookpro.com / staff123',
        doctor: 'dr.john.smith@medbookpro.com / doctor123',
        patient: 'patient1@example.com / patient123'
      },
      counts: {
        users: 17,
        doctors: 15,
        services: 20,
        patients: 15
      }
    });
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
