/**
 * =====================================================
 * ADMIN ROUTES
 * =====================================================
 * 
 * HTTP endpoints for administrative operations.
 * Full CRUD access to all system resources.
 * All routes require admin authentication.
 * 
 * @layer Presentation/Routes
 * =====================================================
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../../infrastructure/middleware/auth');
const User = require('../../domain/entities/User');
const Doctor = require('../../domain/entities/Doctor');
const Service = require('../../domain/entities/Service');
const Appointment = require('../../domain/entities/Appointment');

/**
 * Middleware to verify user has admin role.
 * Applied to routes that only admins can access.
 */
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Middleware to verify user has admin or receptionist role.
 * Applied to routes that both admins and receptionists can access.
 */
const requireAdminOrReceptionist = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (req.user.role !== 'admin' && req.user.role !== 'receptionist') {
      return res.status(403).json({ message: 'Admin or receptionist access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Apply authentication to all routes
router.use(auth);

/**
 * GET /api/admin/stats
 * 
 * Retrieves dashboard statistics for the admin panel.
 * Includes counts of users, doctors, appointments, and revenue.
 * 
 * @route GET /api/admin/stats
 * @returns {200} Dashboard statistics object
 */
router.get('/stats', requireAdminOrReceptionist, async (req, res) => {
  try {
    const [
      totalUsers,
      totalDoctors,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
    ] = await Promise.all([
      User.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'completed' }),
    ]);

    const completed = await Appointment.find({ status: 'completed' });
    const totalRevenue = completed.reduce((sum, apt) => sum + (apt.totalPrice || apt.price || 0), 0);

    res.json({
      totalUsers,
      totalDoctors,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/admin/sync-doctors
 * 
 * Creates missing doctor profiles for users with role='doctor'
 * Fixes doctors that exist in users collection but not in doctors collection
 * 
 * @route POST /api/admin/sync-doctors
 * @returns {200} Sync results
 */
router.post('/sync-doctors', requireAdmin, async (req, res) => {
  try {
    const doctorUsers = await User.find({ role: 'doctor' });
    const results = { created: 0, skipped: 0, errors: [] };
    
    for (const user of doctorUsers) {
      const existingDoctor = await Doctor.findOne({ user: user._id });
      
      if (existingDoctor) {
        results.skipped++;
        continue;
      }
      
      try {
        const doctor = new Doctor({
          user: user._id,
          specialty: 'General Medicine',
          qualification: '',
          experience: 0,
          consultationFee: 5000,
          bio: '',
          isAvailable: true,
          services: [],
        });
        
        await doctor.save();
        results.created++;
        console.log(`Created doctor profile for user: ${user.email}`);
      } catch (err) {
        results.errors.push({ email: user.email, error: err.message });
      }
    }
    
    res.json({
      message: 'Sync completed',
      totalDoctorUsers: doctorUsers.length,
      doctorProfilesCreated: results.created,
      doctorProfilesSkipped: results.skipped,
      errors: results.errors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/admin/users
 * 
 * Retrieves all users in the system.
 * Admin only - receptionists cannot access user management.
 * 
 * @route GET /api/admin/users
 * @returns {200} Array of user objects
 */
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    const formatted = users.map(u => ({
      id: u._id,
      username: u.username,
      email: u.email,
      first_name: u.firstName,
      last_name: u.lastName,
      phone: u.phone,
      role: u.role,
      is_active: u.isActive !== false,
      createdAt: u.createdAt,
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/admin/users
 * 
 * Creates a new user account.
 * Admin only - receptionists cannot create users.
 * 
 * @route POST /api/admin/users
 * @body {string} username - Unique username
 * @body {string} email - User's email
 * @body {string} password - User's password
 * @body {string} first_name - First name (optional)
 * @body {string} last_name - Last name (optional)
 * @body {string} phone - Phone number (optional)
 * @body {string} role - User role (default: 'patient')
 * @returns {201} User created successfully
 * @returns {400} User already exists
 */
router.post('/users', requireAdmin, async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, phone, role } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      username,
      email,
      password,
      firstName: first_name,
      lastName: last_name,
      phone,
      role: role || 'patient',
    });

    await user.save();
    res.status(201).json({ 
      message: 'User created successfully',
      id: user._id 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * PUT /api/admin/users/:id
 * 
 * Updates an existing user.
 * Admin only - receptionists cannot update users.
 * 
 * @route PUT /api/admin/users/:id
 * @param {string} id - User's unique ID
 * @body {string} username - New username (optional)
 * @body {string} email - New email (optional)
 * @body {string} first_name - New first name (optional)
 * @body {string} last_name - New last name (optional)
 * @body {string} phone - New phone (optional)
 * @body {string} role - New role (optional)
 * @body {boolean} is_active - Active status (optional)
 * @returns {200} User updated successfully
 * @returns {404} User not found
 */
router.put('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { username, email, first_name, last_name, phone, role, is_active } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (first_name) user.firstName = first_name;
    if (last_name) user.lastName = last_name;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (is_active !== undefined) user.isActive = is_active;

    await user.save();
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * DELETE /api/admin/users/:id
 * 
 * Permanently deletes a user.
 * Admin only - receptionists cannot delete users.
 * 
 * @route DELETE /api/admin/users/:id
 * @param {string} id - User's unique ID
 * @returns {200} User deleted successfully
 * @returns {404} User not found
 */
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/admin/doctors
 * 
 * Retrieves all doctors with their user information.
 * Both admins and receptionists can access this route.
 * 
 * @route GET /api/admin/doctors
 * @returns {200} Array of doctor objects with user details
 */
router.get('/doctors', requireAdminOrReceptionist, async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    const formatted = doctors.map(d => {
      const scheduleObj = {};
      if (d.schedule && typeof d.schedule === 'object') {
        const scheduleMap = d.schedule instanceof Map ? d.schedule : new Map(Object.entries(d.schedule));
        scheduleMap.forEach((value, key) => {
          scheduleObj[key] = value;
        });
      }
      return {
        id: d._id,
        name: d.user ? `${d.user.firstName} ${d.user.lastName}` : 'Unknown',
        email: d.user?.email,
        phone: d.user?.phone,
        specialty: d.specialty,
        qualification: d.qualification,
        experience: d.experience || 0,
        consultation_fee: d.consultationFee,
        bio: d.bio,
        is_available: d.isAvailable,
        schedule: scheduleObj,
        services: d.services || [],
        createdAt: d.createdAt,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/admin/doctors
 * 
 * Creates a new doctor with user account.
 * Admin/receptionist creates basic account, doctor completes profile later.
 * 
 * @route POST /api/admin/doctors
 * @body {string} name - Doctor's full name
 * @body {string} email - Doctor's email
 * @body {string} phone - Phone number (optional)
 * @body {string} password - Password (optional, auto-generated if not provided)
 * @returns {201} Doctor created with login credentials
 */
router.post('/doctors', requireAdminOrReceptionist, async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    
    const nameParts = String(name).trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    let user = await User.findOne({ email: email.toLowerCase() });
    let isNewUser = false;
    
    if (!user) {
      isNewUser = true;
      let finalPassword = password || Math.random().toString(36).substring(2, 10);
      if (finalPassword.length < 6) finalPassword = finalPassword.padEnd(6, '0');
      
      const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      let username = baseUsername;
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }
      
      user = new User({
        username,
        email: email.toLowerCase(),
        password: finalPassword,
        firstName,
        lastName,
        phone: phone || '',
        role: 'doctor',
      });
      
      await user.save();
    } else if (user.role !== 'doctor') {
      user.role = 'doctor';
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      await user.save();
    }
    
    let doctor = await Doctor.findOne({ user: user._id });
    
    if (doctor) {
      return res.status(400).json({ message: 'Doctor profile already exists for this user' });
    }
    
    doctor = new Doctor({
      user: user._id,
      specialty: 'General Medicine',
      qualification: '',
      experience: 0,
      consultationFee: 5000,
      bio: '',
      isAvailable: true,
      services: [],
    });
    
    await doctor.save();
    console.log('Doctor saved successfully:', doctor._id, 'User ID:', user._id);
    
    res.status(201).json({
      id: doctor._id,
      user_id: user._id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      phone: user.phone,
      username: user.username,
      password: isNewUser ? finalPassword : undefined,
      message: isNewUser 
        ? 'Doctor created successfully. Share credentials with doctor.' 
        : 'Doctor profile created for existing user.',
    });
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ message: error.message || 'Failed to create doctor' });
  }
});
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ message: error.message || 'Failed to create doctor' });
  }
});

/**
 * PUT /api/admin/doctors/:id
 * 
 * Updates a doctor's profile information.
 * Both admins and receptionists can update doctors.
 * 
 * @route PUT /api/admin/doctors/:id
 * @param {string} id - Doctor's unique ID
 * @body {string} name - New name (optional)
 * @body {string} specialty - New specialty (optional)
 * @body {string} qualification - New qualifications (optional)
 * @body {number} experience - New experience years (optional)
 * @body {number} consultation_fee - New fee (optional)
 * @body {string} bio - New bio (optional)
 * @body {boolean} is_available - New availability (optional)
 * @returns {200} Doctor updated successfully
 */
router.put('/doctors/:id', requireAdminOrReceptionist, async (req, res) => {
  try {
    const { name, specialty, qualification, experience, consultation_fee, bio, is_available, services, schedule } = req.body;
    
    const doctor = await Doctor.findById(req.params.id).populate('user');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Update user name if provided
    if (name && doctor.user) {
      const nameParts = name.split(' ');
      doctor.user.firstName = nameParts[0];
      doctor.user.lastName = nameParts.slice(1).join(' ') || '';
      await doctor.user.save();
    }

    if (specialty) doctor.specialty = specialty;
    if (qualification) doctor.qualification = qualification;
    if (experience) doctor.experience = experience;
    if (consultation_fee) doctor.consultationFee = consultation_fee;
    if (bio !== undefined) doctor.bio = bio;
    if (is_available !== undefined) doctor.isAvailable = is_available;
    if (schedule) doctor.schedule = schedule;
    if (services !== undefined) doctor.services = services;

    await doctor.save();
    res.json({ message: 'Doctor updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * DELETE /api/admin/doctors/:id
 * 
 * Deletes a doctor and their associated user account.
 * Both admins and receptionists can delete doctors.
 * 
 * @route DELETE /api/admin/doctors/:id
 * @param {string} id - Doctor's unique ID
 * @returns {200} Doctor deleted successfully
 * @returns {404} Doctor not found
 */
router.delete('/doctors/:id', requireAdminOrReceptionist, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const doctorUserId = doctor.user;
    const doctorId = doctor._id;

    // Delete associated user account
    await User.findByIdAndDelete(doctorUserId);
    
    // Delete doctor profile
    await Doctor.findByIdAndDelete(doctorId);
    
    // Delete all appointments with this doctor
    const deletedAppointments = await Appointment.deleteMany({ doctor: doctorId });
    
    res.json({ 
      message: 'Doctor deleted successfully',
      appointmentsDeleted: deletedAppointments.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/admin/services
 * 
 * Retrieves all services (active and inactive).
 * Both admins and receptionists can access this route.
 * 
 * @route GET /api/admin/services
 * @returns {200} Array of service objects
 */
router.get('/services', requireAdminOrReceptionist, async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });

    const formatted = services.map(s => ({
      id: s._id,
      name: s.name,
      description: s.description,
      duration: s.duration,
      price: s.price,
      is_active: s.isActive,
      createdAt: s.createdAt,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/admin/services
 * 
 * Creates a new medical service.
 * Both admins and receptionists can add services.
 * 
 * @route POST /api/admin/services
 * @body {string} name - Service name (unique)
 * @body {string} description - Service description
 * @body {number} price - Service price
 * @body {number} duration - Duration in minutes (default: 30)
 * @body {boolean} is_active - Active status (default: true)
 * @returns {201} Service created successfully
 */
router.post('/services', requireAdminOrReceptionist, async (req, res) => {
  try {
    const { name, description, duration, price, is_active } = req.body;
    
    const service = new Service({
      name,
      description,
      duration: duration || 30,
      price,
      isActive: is_active ?? true,
    });

    await service.save();
    res.status(201).json({
      id: service._id,
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      is_active: service.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * PUT /api/admin/services/:id
 * 
 * Updates an existing service.
 * Both admins and receptionists can update services.
 * 
 * @route PUT /api/admin/services/:id
 * @param {string} id - Service's unique ID
 * @body {string} name - New name (optional)
 * @body {string} description - New description (optional)
 * @body {number} duration - New duration (optional)
 * @body {number} price - New price (optional)
 * @body {boolean} is_active - New status (optional)
 * @returns {200} Service updated successfully
 */
router.put('/services/:id', requireAdminOrReceptionist, async (req, res) => {
  try {
    const { name, description, duration, price, is_active } = req.body;
    
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (name) service.name = name;
    if (description) service.description = description;
    if (duration) service.duration = duration;
    if (price) service.price = price;
    if (is_active !== undefined) service.isActive = is_active;

    await service.save();
    res.json({
      message: 'Service updated successfully',
      id: service._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * DELETE /api/admin/services/:id
 * 
 * Permanently deletes a service.
 * Both admins and receptionists can delete services.
 * 
 * @route DELETE /api/admin/services/:id
 * @param {string} id - Service's unique ID
 * @returns {200} Service deleted successfully
 * @returns {404} Service not found
 */
router.delete('/services/:id', requireAdminOrReceptionist, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/admin/appointments
 * 
 * Retrieves all appointments in the system.
 * Both admins and receptionists can access this route.
 * 
 * @route GET /api/admin/appointments
 * @returns {200} Array of appointment objects
 */
router.get('/appointments', requireAdminOrReceptionist, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor')
      .populate('service', 'name price')
      .sort({ createdAt: -1 });

    const formatted = appointments.map(apt => {
      let doctorName = 'Unknown';
      if (apt.doctor && apt.doctor.user) {
        doctorName = `${apt.doctor.user.firstName} ${apt.doctor.user.lastName}`;
      }
      
      return {
        id: apt._id,
        patient_name: apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : 'Unknown',
        patient_phone: apt.patient?.phone,
        patient_id: apt.patient?._id,
        doctor_name: doctorName,
        doctor_id: apt.doctor?._id,
        service_name: apt.service?.name,
        service_id: apt.service?._id,
        date: apt.date,
        start_time: apt.startTime,
        end_time: apt.endTime,
        status: apt.status,
        notes: apt.notes,
        total_price: apt.totalPrice || apt.service?.price,
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * PUT /api/admin/appointments/:id
 * 
 * Updates an appointment's status or notes.
 * Both admins and receptionists can update appointments.
 * 
 * @route PUT /api/admin/appointments/:id
 * @param {string} id - Appointment's unique ID
 * @body {string} status - New status (optional)
 * @body {string} notes - Updated notes (optional)
 * @returns {200} Appointment updated successfully
 */
router.put('/appointments/:id', requireAdminOrReceptionist, async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (status) appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;

    await appointment.save();
    res.json({ message: 'Appointment updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * DELETE /api/admin/appointments/:id
 * 
 * Permanently deletes an appointment.
 * Both admins and receptionists can delete appointments.
 * 
 * @route DELETE /api/admin/appointments/:id
 * @param {string} id - Appointment's unique ID
 * @returns {200} Appointment deleted successfully
 * @returns {404} Appointment not found
 */
router.delete('/appointments/:id', requireAdminOrReceptionist, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
