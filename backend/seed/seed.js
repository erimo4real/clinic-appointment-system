/**
 * =====================================================
 * DATABASE SEED SCRIPT
 * =====================================================
 * 
 * Populates the database with initial data for development.
 * Creates admin user, doctors, services, patients, and
 * sample appointments.
 * 
 * Usage: npm run seed
 * 
 * =====================================================
 */

require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../src/domain/entities/User');
const Doctor = require('../src/domain/entities/Doctor');
const Service = require('../src/domain/entities/Service');
const Appointment = require('../src/domain/entities/Appointment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clinic_appointment';

// ==========================================
// SEED DATA DEFINITIONS
// ==========================================

const seedData = {
  // Admin user for system administration
  admin: {
    username: 'admin',
    email: 'admin@medbookpro.com',
    password: 'admin123',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin',
    phone: '+1234567890'
  },

  // Sample doctors with varied specialties (15 doctors)
  doctors: [
    {
      username: 'drsmith',
      email: 'dr.smith@medbookpro.com',
      password: 'doctor123',
      firstName: 'John',
      lastName: 'Smith',
      role: 'doctor',
      phone: '+1234567891',
      specialty: 'Cardiology',
      qualification: 'MD, FACC',
      experience: 15,
      bio: 'Dr. John Smith is a board-certified cardiologist with over 15 years of experience in treating heart conditions, preventive cardiology, and heart failure management.',
      consultationFee: 150
    },
    {
      username: 'drjones',
      email: 'dr.jones@medbookpro.com',
      password: 'doctor123',
      firstName: 'Sarah',
      lastName: 'Jones',
      role: 'doctor',
      phone: '+1234567892',
      specialty: 'General Medicine',
      qualification: 'MD, MBBS',
      experience: 10,
      bio: 'Dr. Sarah Jones is a general practitioner specializing in family medicine and preventive care. She is passionate about holistic patient care.',
      consultationFee: 80
    },
    {
      username: 'drlee',
      email: 'dr.lee@medbookpro.com',
      password: 'doctor123',
      firstName: 'David',
      lastName: 'Lee',
      role: 'doctor',
      phone: '+1234567893',
      specialty: 'Pediatrics',
      qualification: 'MD, FAAP',
      experience: 12,
      bio: 'Dr. David Lee specializes in pediatric care, providing comprehensive healthcare for children from infancy through adolescence.',
      consultationFee: 100
    },
    {
      username: 'drbrown',
      email: 'dr.brown@medbookpro.com',
      password: 'doctor123',
      firstName: 'Emily',
      lastName: 'Brown',
      role: 'doctor',
      phone: '+1234567894',
      specialty: 'Dermatology',
      qualification: 'MD, FAAD',
      experience: 8,
      bio: 'Dr. Emily Brown is a dermatologist specializing in medical and cosmetic dermatology procedures including skin cancer screening.',
      consultationFee: 120
    },
    {
      username: 'drwilson',
      email: 'dr.wilson@medbookpro.com',
      password: 'doctor123',
      firstName: 'Michael',
      lastName: 'Wilson',
      role: 'doctor',
      phone: '+1234567895',
      specialty: 'Orthopedics',
      qualification: 'MD, FAAOS',
      experience: 20,
      bio: 'Dr. Michael Wilson is an orthopedic surgeon specializing in sports medicine and joint replacement surgery.',
      consultationFee: 200
    },
    {
      username: 'droberts',
      email: 'dr.roberts@medbookpro.com',
      password: 'doctor123',
      firstName: 'Jennifer',
      lastName: 'Roberts',
      role: 'doctor',
      phone: '+1234567896',
      specialty: 'Neurology',
      qualification: 'MD, PhD',
      experience: 14,
      bio: 'Dr. Jennifer Roberts is a neurologist specializing in stroke prevention, epilepsy treatment, and neurodegenerative disorders.',
      consultationFee: 180
    },
    {
      username: 'drmartinez',
      email: 'dr.martinez@medbookpro.com',
      password: 'doctor123',
      firstName: 'Carlos',
      lastName: 'Martinez',
      role: 'doctor',
      phone: '+1234567897',
      specialty: 'Gastroenterology',
      qualification: 'MD, FACG',
      experience: 11,
      bio: 'Dr. Carlos Martinez specializes in digestive health, liver diseases, and advanced endoscopic procedures.',
      consultationFee: 160
    },
    {
      username: 'drkim',
      email: 'dr.kim@medbookpro.com',
      password: 'doctor123',
      firstName: 'Min-jun',
      lastName: 'Kim',
      role: 'doctor',
      phone: '+1234567898',
      specialty: 'Ophthalmology',
      qualification: 'MD, FACS',
      experience: 9,
      bio: 'Dr. Min-jun Kim is an ophthalmologist offering comprehensive eye care including cataract surgery and LASIK vision correction.',
      consultationFee: 140
    },
    {
      username: 'drtaylor',
      email: 'dr.taylor@medbookpro.com',
      password: 'doctor123',
      firstName: 'Amanda',
      lastName: 'Taylor',
      role: 'doctor',
      phone: '+1234567899',
      specialty: 'Psychiatry',
      qualification: 'MD, FAPA',
      experience: 13,
      bio: 'Dr. Amanda Taylor is a psychiatrist specializing in anxiety, depression, and mood disorders with a focus on therapy-integrated treatment.',
      consultationFee: 170
    },
    {
      username: 'dranderson',
      email: 'dr.anderson@medbookpro.com',
      password: 'doctor123',
      firstName: 'Robert',
      lastName: 'Anderson',
      role: 'doctor',
      phone: '+1234567900',
      specialty: 'Pulmonology',
      qualification: 'MD, FCCP',
      experience: 16,
      bio: 'Dr. Robert Anderson specializes in respiratory diseases, asthma management, and sleep disorders.',
      consultationFee: 155
    },
    {
      username: 'drthomas',
      email: 'dr.thomas@medbookpro.com',
      password: 'doctor123',
      firstName: 'Lisa',
      lastName: 'Thomas',
      role: 'doctor',
      phone: '+1234567901',
      specialty: 'Endocrinology',
      qualification: 'MD, FACE',
      experience: 10,
      bio: 'Dr. Lisa Thomas is an endocrinologist specializing in diabetes management, thyroid disorders, and hormonal imbalances.',
      consultationFee: 145
    },
    {
      username: 'drwhite',
      email: 'dr.white@medbookpro.com',
      password: 'doctor123',
      firstName: 'James',
      lastName: 'White',
      role: 'doctor',
      phone: '+1234567902',
      specialty: 'Urology',
      qualification: 'MD, FACS',
      experience: 18,
      bio: 'Dr. James White is a urologist offering comprehensive care for urinary tract conditions and male reproductive health.',
      consultationFee: 165
    },
    {
      username: 'drharris',
      email: 'dr.harris@medbookpro.com',
      password: 'doctor123',
      firstName: 'Michelle',
      lastName: 'Harris',
      role: 'doctor',
      phone: '+1234567903',
      specialty: 'Gynecology',
      qualification: 'MD, FACOG',
      experience: 12,
      bio: 'Dr. Michelle Harris is an OB/GYN providing comprehensive womens health services from adolescence through menopause.',
      consultationFee: 130
    },
    {
      username: 'drclark',
      email: 'dr.clark@medbookpro.com',
      password: 'doctor123',
      firstName: 'William',
      lastName: 'Clark',
      role: 'doctor',
      phone: '+1234567904',
      specialty: 'Oncology',
      qualification: 'MD, FACP',
      experience: 22,
      bio: 'Dr. William Clark is a medical oncologist specializing in cancer diagnosis, treatment, and survivorship care.',
      consultationFee: 220
    },
    {
      username: 'drlewis',
      email: 'dr.lewis@medbookpro.com',
      password: 'doctor123',
      firstName: 'Susan',
      lastName: 'Lewis',
      role: 'doctor',
      phone: '+1234567905',
      specialty: 'Rheumatology',
      qualification: 'MD, FACR',
      experience: 11,
      bio: 'Dr. Susan Lewis is a rheumatologist specializing in autoimmune diseases, arthritis, and inflammatory conditions.',
      consultationFee: 150
    }
  ],

  // Medical services offered by the clinic (20 services)
  services: [
    {
      name: 'General Consultation',
      description: 'Standard consultation with a general practitioner for common health issues and preventive care.',
      price: 80,
      duration: 30,
      isActive: true
    },
    {
      name: 'Annual Physical Exam',
      description: 'Comprehensive yearly health examination including vital signs, blood tests, and health counseling.',
      price: 200,
      duration: 60,
      isActive: true
    },
    {
      name: 'Cardiac Checkup',
      description: 'Complete heart health evaluation including ECG, stress test, and cardiovascular risk assessment.',
      price: 250,
      duration: 60,
      isActive: true
    },
    {
      name: 'Pediatric Checkup',
      description: 'Thorough health examination for children including growth assessment and developmental screening.',
      price: 100,
      duration: 45,
      isActive: true
    },
    {
      name: 'Dermatology Consultation',
      description: 'Skin health evaluation, mole screening, and treatment for various dermatological conditions.',
      price: 120,
      duration: 30,
      isActive: true
    },
    {
      name: 'Orthopedic Evaluation',
      description: 'Comprehensive musculoskeletal assessment including joint mobility and imaging review.',
      price: 150,
      duration: 45,
      isActive: true
    },
    {
      name: 'Neurology Consultation',
      description: 'Expert evaluation of neurological conditions including headaches, seizures, and movement disorders.',
      price: 180,
      duration: 45,
      isActive: true
    },
    {
      name: 'Eye Examination',
      description: 'Complete vision testing and eye health assessment including retinal examination.',
      price: 100,
      duration: 40,
      isActive: true
    },
    {
      name: 'Mental Health Consultation',
      description: 'Psychiatric evaluation and treatment planning for mental health conditions.',
      price: 170,
      duration: 60,
      isActive: true
    },
    {
      name: 'Blood Test Panel',
      description: 'Comprehensive blood work including CBC, metabolic panel, lipid profile, and thyroid function.',
      price: 75,
      duration: 15,
      isActive: true
    },
    {
      name: 'X-Ray Imaging',
      description: 'Diagnostic X-ray imaging for various body parts including chest, extremities, and spine.',
      price: 100,
      duration: 30,
      isActive: true
    },
    {
      name: 'Ultrasound Scan',
      description: 'Non-invasive imaging for abdominal, pelvic, or cardiac evaluation.',
      price: 180,
      duration: 45,
      isActive: true
    },
    {
      name: 'CT Scan',
      description: 'Advanced computed tomography imaging for detailed internal visualization.',
      price: 350,
      duration: 30,
      isActive: true
    },
    {
      name: 'MRI Scan',
      description: 'Magnetic resonance imaging for soft tissue and neurological evaluation.',
      price: 500,
      duration: 60,
      isActive: true
    },
    {
      name: 'ECG/EKG',
      description: 'Electrocardiogram to assess heart rhythm and detect cardiac abnormalities.',
      price: 60,
      duration: 20,
      isActive: true
    },
    {
      name: 'Vaccination',
      description: 'Various vaccinations including flu shots, travel vaccines, and childhood immunizations.',
      price: 45,
      duration: 15,
      isActive: true
    },
    {
      name: 'Wound Care',
      description: 'Professional wound assessment, cleaning, and treatment for acute and chronic wounds.',
      price: 85,
      duration: 30,
      isActive: true
    },
    {
      name: 'Allergy Testing',
      description: 'Comprehensive allergy screening to identify environmental and food sensitivities.',
      price: 150,
      duration: 45,
      isActive: true
    },
    {
      name: 'Diabetes Management',
      description: 'Comprehensive diabetes care including glucose monitoring, medication management, and lifestyle counseling.',
      price: 120,
      duration: 40,
      isActive: true
    },
    {
      name: 'Pre-Surgical Consultation',
      description: 'Pre-operative assessment and clearance for surgical procedures.',
      price: 130,
      duration: 45,
      isActive: true
    }
  ],

  // Sample patients for testing (15 patients)
  patients: [
    {
      username: 'patient1',
      email: 'patient1@example.com',
      password: 'patient123',
      firstName: 'Alice',
      lastName: 'Johnson',
      role: 'patient',
      phone: '+1234567801',
      dateOfBirth: new Date('1985-03-15')
    },
    {
      username: 'patient2',
      email: 'patient2@example.com',
      password: 'patient123',
      firstName: 'Bob',
      lastName: 'Williams',
      role: 'patient',
      phone: '+1234567802',
      dateOfBirth: new Date('1990-07-22')
    },
    {
      username: 'patient3',
      email: 'patient3@example.com',
      password: 'patient123',
      firstName: 'Carol',
      lastName: 'Davis',
      role: 'patient',
      phone: '+1234567803',
      dateOfBirth: new Date('1978-11-08')
    },
    {
      username: 'patient4',
      email: 'patient4@example.com',
      password: 'patient123',
      firstName: 'Daniel',
      lastName: 'Miller',
      role: 'patient',
      phone: '+1234567804',
      dateOfBirth: new Date('1995-01-30')
    },
    {
      username: 'patient5',
      email: 'patient5@example.com',
      password: 'patient123',
      firstName: 'Emma',
      lastName: 'Wilson',
      role: 'patient',
      phone: '+1234567805',
      dateOfBirth: new Date('1988-06-12')
    },
    {
      username: 'patient6',
      email: 'patient6@example.com',
      password: 'patient123',
      firstName: 'Frank',
      lastName: 'Moore',
      role: 'patient',
      phone: '+1234567806',
      dateOfBirth: new Date('1972-09-25')
    },
    {
      username: 'patient7',
      email: 'patient7@example.com',
      password: 'patient123',
      firstName: 'Grace',
      lastName: 'Taylor',
      role: 'patient',
      phone: '+1234567807',
      dateOfBirth: new Date('1992-04-18')
    },
    {
      username: 'patient8',
      email: 'patient8@example.com',
      password: 'patient123',
      firstName: 'Henry',
      lastName: 'Anderson',
      role: 'patient',
      phone: '+1234567808',
      dateOfBirth: new Date('1965-12-03')
    },
    {
      username: 'patient9',
      email: 'patient9@example.com',
      password: 'patient123',
      firstName: 'Ivy',
      lastName: 'Thomas',
      role: 'patient',
      phone: '+1234567809',
      dateOfBirth: new Date('1999-08-14')
    },
    {
      username: 'patient10',
      email: 'patient10@example.com',
      password: 'patient123',
      firstName: 'Jack',
      lastName: 'Jackson',
      role: 'patient',
      phone: '+1234567810',
      dateOfBirth: new Date('1982-02-27')
    },
    {
      username: 'patient11',
      email: 'patient11@example.com',
      password: 'patient123',
      firstName: 'Kate',
      lastName: 'White',
      role: 'patient',
      phone: '+1234567811',
      dateOfBirth: new Date('1996-05-09')
    },
    {
      username: 'patient12',
      email: 'patient12@example.com',
      password: 'patient123',
      firstName: 'Leo',
      lastName: 'Harris',
      role: 'patient',
      phone: '+1234567812',
      dateOfBirth: new Date('1970-10-21')
    },
    {
      username: 'patient13',
      email: 'patient13@example.com',
      password: 'patient123',
      firstName: 'Mia',
      lastName: 'Martin',
      role: 'patient',
      phone: '+1234567813',
      dateOfBirth: new Date('1993-07-16')
    },
    {
      username: 'patient14',
      email: 'patient14@example.com',
      password: 'patient123',
      firstName: 'Noah',
      lastName: 'Garcia',
      role: 'patient',
      phone: '+1234567814',
      dateOfBirth: new Date('1987-11-02')
    },
    {
      username: 'patient15',
      email: 'patient15@example.com',
      password: 'patient123',
      firstName: 'Olivia',
      lastName: 'Martinez',
      role: 'patient',
      phone: '+1234567815',
      dateOfBirth: new Date('1991-03-28')
    }
  ],

  // Sample appointments
  appointments: [
    {
      patientIndex: 0,
      doctorIndex: 0,
      serviceIndex: 0,
      daysFromNow: 1,
      startTime: '09:00',
      endTime: '09:30',
      status: 'confirmed',
      notes: 'Regular checkup'
    },
    {
      patientIndex: 1,
      doctorIndex: 2,
      serviceIndex: 3,
      daysFromNow: 1,
      startTime: '10:00',
      endTime: '10:45',
      status: 'pending',
      notes: 'Child wellness visit'
    },
    {
      patientIndex: 2,
      doctorIndex: 5,
      serviceIndex: 6,
      daysFromNow: 2,
      startTime: '11:30',
      endTime: '12:15',
      status: 'confirmed',
      notes: 'Headache consultation'
    },
    {
      patientIndex: 3,
      doctorIndex: 1,
      serviceIndex: 1,
      daysFromNow: 3,
      startTime: '14:00',
      endTime: '15:00',
      status: 'pending',
      notes: 'Annual physical'
    },
    {
      patientIndex: 4,
      doctorIndex: 4,
      serviceIndex: 5,
      daysFromNow: 4,
      startTime: '09:30',
      endTime: '10:15',
      status: 'confirmed',
      notes: 'Knee pain evaluation'
    },
    {
      patientIndex: 5,
      doctorIndex: 0,
      serviceIndex: 2,
      daysFromNow: 5,
      startTime: '11:00',
      endTime: '12:00',
      status: 'pending',
      notes: 'Cardiac screening'
    },
    {
      patientIndex: 6,
      doctorIndex: 8,
      serviceIndex: 8,
      daysFromNow: 6,
      startTime: '15:00',
      endTime: '16:00',
      status: 'confirmed',
      notes: 'Anxiety management'
    },
    {
      patientIndex: 7,
      doctorIndex: 3,
      serviceIndex: 4,
      daysFromNow: 7,
      startTime: '10:00',
      endTime: '10:30',
      status: 'pending',
      notes: 'Skin rash evaluation'
    },
    {
      patientIndex: 8,
      doctorIndex: 6,
      serviceIndex: 17,
      daysFromNow: 8,
      startTime: '13:00',
      endTime: '13:45',
      status: 'confirmed',
      notes: 'Food allergy testing'
    },
    {
      patientIndex: 9,
      doctorIndex: 10,
      serviceIndex: 18,
      daysFromNow: 9,
      startTime: '08:30',
      endTime: '09:10',
      status: 'pending',
      notes: 'Diabetes follow-up'
    },
    {
      patientIndex: 10,
      doctorIndex: 7,
      serviceIndex: 7,
      daysFromNow: 10,
      startTime: '14:30',
      endTime: '15:10',
      status: 'confirmed',
      notes: 'Vision check'
    },
    {
      patientIndex: 11,
      doctorIndex: 9,
      serviceIndex: 18,
      daysFromNow: 11,
      startTime: '11:00',
      endTime: '11:40',
      status: 'pending',
      notes: 'Sleep disorder consultation'
    },
    {
      patientIndex: 12,
      doctorIndex: 12,
      serviceIndex: 0,
      daysFromNow: 12,
      startTime: '09:00',
      endTime: '09:30',
      status: 'confirmed',
      notes: 'General health concern'
    },
    {
      patientIndex: 13,
      doctorIndex: 11,
      serviceIndex: 0,
      daysFromNow: 13,
      startTime: '10:30',
      endTime: '11:00',
      status: 'pending',
      notes: 'Follow-up visit'
    },
    {
      patientIndex: 14,
      doctorIndex: 14,
      serviceIndex: 18,
      daysFromNow: 14,
      startTime: '13:30',
      endTime: '14:10',
      status: 'confirmed',
      notes: 'Joint pain evaluation'
    }
  ]
};

// ==========================================
// SEED FUNCTIONS
// ==========================================

/**
 * Clears all existing data from collections.
 */
async function clearDatabase() {
  await User.deleteMany({});
  await Doctor.deleteMany({});
  await Service.deleteMany({});
  await Appointment.deleteMany({});
  console.log('[Seed] Database cleared');
}

/**
 * Creates the admin user.
 */
async function seedAdmin() {
  const admin = await User.create(seedData.admin);
  console.log(`[Seed] Admin created: ${admin.email}`);
  return admin;
}

/**
 * Creates doctors and their user accounts.
 */
async function seedDoctors() {
  const doctors = [];

  for (const doctorData of seedData.doctors) {
    const user = await User.create({
      username: doctorData.username,
      email: doctorData.email,
      password: doctorData.password,
      firstName: doctorData.firstName,
      lastName: doctorData.lastName,
      role: doctorData.role,
      phone: doctorData.phone
    });

    const doctor = await Doctor.create({
      user: user._id,
      specialty: doctorData.specialty,
      qualification: doctorData.qualification,
      experience: doctorData.experience,
      bio: doctorData.bio,
      consultationFee: doctorData.consultationFee,
      isAvailable: true
    });

    doctors.push({ user, doctor });
    console.log(`[Seed] Doctor created: Dr. ${doctorData.firstName} ${doctorData.lastName} (${doctorData.specialty})`);
  }

  return doctors;
}

/**
 * Creates medical services.
 */
async function seedServices() {
  const services = [];

  for (const serviceData of seedData.services) {
    const service = await Service.create(serviceData);
    services.push(service);
    console.log(`[Seed] Service created: ${service.name}`);
  }

  return services;
}

/**
 * Creates sample patients.
 */
async function seedPatients() {
  const patients = [];

  for (const patientData of seedData.patients) {
    const patient = await User.create(patientData);
    patients.push(patient);
    console.log(`[Seed] Patient created: ${patient.firstName} ${patient.lastName}`);
  }

  return patients;
}

/**
 * Creates sample appointments.
 */
async function seedAppointments(doctors, services, patients) {
  if (doctors.length < 2 || services.length < 2 || patients.length < 2) {
    console.log('[Seed] Skipping appointments - not enough data');
    return;
  }

  for (const aptData of seedData.appointments) {
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + aptData.daysFromNow);
    appointmentDate.setHours(9, 0, 0, 0);

    // Parse start time
    const [startHour, startMin] = aptData.startTime.split(':').map(Number);
    appointmentDate.setHours(startHour, startMin);

    // Calculate end time
    const [endHour, endMin] = aptData.endTime.split(':').map(Number);
    const endDate = new Date(appointmentDate);
    endDate.setHours(endHour, endMin);

    const appointment = await Appointment.create({
      patient: patients[aptData.patientIndex]._id,
      doctor: doctors[aptData.doctorIndex].doctor._id,
      service: services[aptData.serviceIndex]._id,
      date: appointmentDate,
      startTime: aptData.startTime,
      endTime: aptData.endTime,
      status: aptData.status,
      notes: aptData.notes
    });

    console.log(`[Seed] Appointment created: ${appointmentDate.toDateString()} at ${aptData.startTime}`);
  }
}

// ==========================================
// MAIN SEED FUNCTION
// ==========================================

async function seed() {
  try {
    console.log('===========================================');
    console.log('Clinic System - Database Seed');
    console.log('===========================================');
    console.log(`[Seed] Connecting to: ${MONGODB_URI}`);

    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected to MongoDB');

    await clearDatabase();
    await seedAdmin();
    const doctors = await seedDoctors();
    const services = await seedServices();
    const patients = await seedPatients();
    await seedAppointments(doctors, services, patients);

    console.log('\n===========================================');
    console.log('Database Seed Complete');
    console.log('===========================================');
    console.log('\nSummary:');
    console.log(`  - 1 Admin user`);
    console.log(`  - ${doctors.length} Doctors`);
    console.log(`  - ${services.length} Services`);
    console.log(`  - ${patients.length} Patients`);
    console.log(`  - ${seedData.appointments.length} Appointments`);
    console.log('\nTest Credentials:');
    console.log('  Admin:   admin@medbookpro.com / admin123');
    console.log('  Doctor:  dr.smith@medbookpro.com / doctor123');
    console.log('  Patient: patient1@example.com / patient123');
    console.log('===========================================\n');

  } catch (error) {
    console.error('[Seed] Error:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

// Run seed if called directly
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seed;
