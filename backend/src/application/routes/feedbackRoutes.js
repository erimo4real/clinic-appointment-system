/**
 * =====================================================
 * FEEDBACK ROUTES
 * =====================================================
 * 
 * HTTP endpoints for patient feedback on doctors.
 * Patients can submit feedback with ratings.
 * Doctors can view and respond to feedback.
 * Admins can manage all feedback.
 * 
 * =====================================================
 */

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { auth, authorize } = require('../../infrastructure/middleware/auth');
const Feedback = require('../../domain/entities/Feedback');
const Doctor = require('../../domain/entities/Doctor');
const User = require('../../domain/entities/User');

// Configure email transporter for notifications
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends email notification to admin when new feedback is submitted.
 * Only sends if admin email is configured.
 */
const sendAdminNotification = async (feedback, doctor, patient) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!adminEmail) {
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@medbookpro.com',
    to: adminEmail,
    subject: `New ${feedback.type === 'like' ? 'Positive' : 'Negative'} Feedback - Dr. ${doctor.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">New Feedback Received</h2>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Type:</strong> ${feedback.type.toUpperCase()}</p>
          <p><strong>Rating:</strong> ${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)} (${feedback.rating}/5)</p>
          <p><strong>Doctor:</strong> Dr. ${doctor.name}</p>
          <p><strong>Patient:</strong> ${patient.firstName} ${patient.lastName || ''}</p>
        </div>
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #1e40af;">Comment:</h3>
          <p style="color: #374151;">${feedback.reason}</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    // Log error but don't fail the request
    console.error('Failed to send admin notification:', error.message);
  }
};

/**
 * Sends email notification to doctor when they receive feedback.
 */
const sendDoctorNotification = async (feedback, doctor, patient) => {
  const doctorUser = await User.findById(doctor.user);
  
  if (!doctorUser || !doctorUser.email) {
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@medbookpro.com',
    to: doctorUser.email,
    subject: `New Patient Feedback - ${feedback.type === 'like' ? 'Positive' : 'Needs Attention'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">You received new patient feedback</h2>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Type:</strong> ${feedback.type.toUpperCase()}</p>
          <p><strong>Rating:</strong> ${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)}</p>
          <p><strong>Patient:</strong> ${patient.firstName} ${patient.lastName || ''}</p>
        </div>
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #1e40af;">Patient's feedback:</h3>
          <p style="color: #374151;">${feedback.reason}</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send doctor notification:', error.message);
  }
};

/**
 * POST /api/feedback
 * 
 * Patient submits feedback for a doctor.
 * Each patient can only give one feedback per doctor.
 * 
 * @route POST /api/feedback
 * @requires Authentication (patient)
 * @body {string} doctor_id - Doctor's ID
 * @body {number} rating - Rating from 1 to 5 stars
 * @body {string} type - 'like' or 'dislike'
 * @body {string} reason - Comment/reason for feedback
 * @returns {201} Feedback submitted successfully
 * @returns {400} Already gave feedback or validation error
 * @returns {404} Doctor not found
 */
router.post('/', auth, async (req, res) => {
  try {
    const { doctor_id, rating, type, reason } = req.body;
    const patient_id = req.user._id;

    // Verify doctor exists
    const doctor = await Doctor.findById(doctor_id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if feedback already exists for this patient-doctor pair
    const existingFeedback = await Feedback.findOne({ patient: patient_id, doctor: doctor_id });
    if (existingFeedback) {
      return res.status(400).json({ message: 'You have already given feedback to this doctor' });
    }

    // Create new feedback
    const feedback = new Feedback({
      patient: patient_id,
      doctor: doctor_id,
      rating,
      type,
      reason,
      status: 'pending'
    });

    await feedback.save();

    // Get doctor info for notifications
    const doctorUser = await User.findById(doctor.user);
    
    // Send email notifications (non-blocking)
    sendAdminNotification(feedback, {
      name: doctorUser ? `${doctorUser.firstName} ${doctorUser.lastName}` : 'Unknown'
    }, {
      firstName: req.user.firstName,
      lastName: req.user.lastName
    });

    sendDoctorNotification(feedback, doctor, {
      firstName: req.user.firstName,
      lastName: req.user.lastName
    });

    res.status(201).json({ 
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/feedback/patient
 * 
 * Retrieves the authenticated patient's feedback history.
 * 
 * @route GET /api/feedback/patient
 * @requires Authentication
 * @returns {200} Array of feedback with doctor details
 */
router.get('/patient', auth, async (req, res) => {
  try {
    const feedback = await Feedback.find({ patient: req.user._id })
      .populate('doctor')
      .sort({ createdAt: -1 });

    const formatted = await Promise.all(feedback.map(async (f) => {
      const doctorUser = await User.findById(f.doctor.user);
      return {
        id: f._id,
        doctor_id: f.doctor._id,
        doctor_name: doctorUser ? `${doctorUser.firstName} ${doctorUser.lastName}` : 'Unknown',
        doctor_specialty: f.doctor.specialty,
        rating: f.rating,
        type: f.type,
        reason: f.reason,
        response: f.response,
        responseDate: f.responseDate,
        status: f.status,
        createdAt: f.createdAt
      };
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/feedback/doctor/:doctorId
 * 
 * Retrieves feedback for a specific doctor with statistics.
 * 
 * @route GET /api/feedback/doctor/:doctorId
 * @requires Authentication
 * @param {string} doctorId - Doctor's unique ID
 * @returns {200} Feedback array and statistics
 * @returns {404} Doctor not found
 */
router.get('/doctor/:doctorId', auth, async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const feedback = await Feedback.find({ doctor: doctorId })
      .populate('patient', 'firstName lastName email')
      .sort({ createdAt: -1 });

    const formatted = feedback.map(f => ({
      id: f._id,
      patient_name: f.patient ? `${f.patient.firstName} ${f.patient.lastName}` : 'Unknown',
      rating: f.rating,
      type: f.type,
      reason: f.reason,
      response: f.response,
      responseDate: f.responseDate,
      status: f.status,
      createdAt: f.createdAt
    }));

    // Calculate feedback statistics
    const stats = {
      total: feedback.length,
      likes: feedback.filter(f => f.type === 'like').length,
      dislikes: feedback.filter(f => f.type === 'dislike').length,
      averageRating: feedback.length > 0 
        ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
        : 0,
      pending: feedback.filter(f => f.status === 'pending').length
    };

    res.json({ feedback: formatted, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * PUT /api/feedback/:id/respond
 * 
 * Doctor responds to feedback from a patient.
 * 
 * @route PUT /api/feedback/:id/respond
 * @requires Authentication (doctor only, must own the feedback)
 * @param {string} id - Feedback ID
 * @body {string} response - Doctor's response text
 * @returns {200} Response submitted successfully
 * @returns {403} Not authorized
 * @returns {404} Feedback not found
 */
router.put('/:id/respond', auth, async (req, res) => {
  try {
    const { response } = req.body;
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Verify the doctor owns this feedback
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor || feedback.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to respond to this feedback' });
    }

    feedback.response = response;
    feedback.responseDate = new Date();
    feedback.status = 'reviewed';

    await feedback.save();

    res.json({ message: 'Response submitted', feedback });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/feedback/admin/all
 * 
 * Retrieves all feedback in the system.
 * Admin only.
 * 
 * @route GET /api/feedback/admin/all
 * @requires Authentication (admin)
 * @returns {200} Array of all feedback
 */
router.get('/admin/all', auth, authorize('admin'), async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor')
      .sort({ createdAt: -1 });

    const formatted = await Promise.all(feedback.map(async (f) => {
      let doctorName = 'Unknown';
      if (f.doctor && f.doctor.user) {
        const doctorUser = await User.findById(f.doctor.user);
        doctorName = doctorUser ? `${doctorUser.firstName} ${doctorUser.lastName}` : 'Unknown';
      }

      return {
        id: f._id,
        patient_name: f.patient ? `${f.patient.firstName} ${f.patient.lastName}` : 'Unknown',
        patient_email: f.patient?.email,
        patient_phone: f.patient?.phone,
        doctor_id: f.doctor?._id,
        doctor_name: doctorName,
        doctor_specialty: f.doctor?.specialty,
        rating: f.rating,
        type: f.type,
        reason: f.reason,
        response: f.response,
        responseDate: f.responseDate,
        status: f.status,
        adminNotes: f.adminNotes,
        createdAt: f.createdAt
      };
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * PUT /api/feedback/admin/:id
 * 
 * Admin updates feedback status and adds notes.
 * 
 * @route PUT /api/feedback/admin/:id
 * @requires Authentication (admin)
 * @param {string} id - Feedback ID
 * @body {string} status - New status ('pending', 'reviewed', 'action_taken')
 * @body {string} adminNotes - Admin notes
 * @returns {200} Feedback updated
 * @returns {404} Feedback not found
 */
router.put('/admin/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    if (status) feedback.status = status;
    if (adminNotes) feedback.adminNotes = adminNotes;

    await feedback.save();

    res.json({ message: 'Feedback updated', feedback });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
