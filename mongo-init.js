/**
 * =====================================================
 * MONGO INITIALIZATION SCRIPT
 * =====================================================
 * 
 * Runs automatically when MongoDB container is first created.
 * Sets up database indexes for optimal query performance.
 * 
 * =====================================================
 */

print('===========================================');
print('MongoDB Initialization');
print('===========================================');

// Switch to the application database
db = db.getSiblingDB('clinic_appointment');

// Create indexes for Users collection
print('Creating Users indexes...');
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ email: 1, role: 1 });

// Create indexes for Doctors collection
print('Creating Doctors indexes...');
db.doctors.createIndex({ user: 1 }, { unique: true });
db.doctors.createIndex({ specialty: 1 });
db.doctors.createIndex({ isAvailable: 1 });
db.doctors.createIndex({ specialty: 1, isAvailable: 1 });

// Create indexes for Services collection
print('Creating Services indexes...');
db.services.createIndex({ name: 'text', description: 'text' });
db.services.createIndex({ isActive: 1 });
db.services.createIndex({ price: 1 });

// Create indexes for Appointments collection
print('Creating Appointments indexes...');
db.appointments.createIndex({ doctor: 1, date: 1, startTime: 1 });
db.appointments.createIndex({ patient: 1, createdAt: -1 });
db.appointments.createIndex({ doctor: 1, status: 1 });
db.appointments.createIndex({ date: 1 });
db.appointments.createIndex({ status: 1 });
db.appointments.createIndex({ createdAt: -1 });

// Create indexes for Feedbacks collection
print('Creating Feedbacks indexes...');
try {
  db.feedbacks.createIndex({ doctor: 1, patient: 1 }, { unique: true });
  db.feedbacks.createIndex({ status: 1 });
  db.feedbacks.createIndex({ createdAt: -1 });
} catch (e) {
  print('Feedbacks collection not found, skipping...');
}

print('===========================================');
print('MongoDB Initialization Complete');
print('===========================================');
