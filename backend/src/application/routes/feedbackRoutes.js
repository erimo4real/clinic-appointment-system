/**
 * =====================================================
 * FEEDBACK ROUTES
 * =====================================================
 * 
 * Routes for patient feedback on doctors.
 * - Patients can give feedback to doctors
 * - Doctors can respond to feedback
 * - Admin can view and manage feedback
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

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email notification helper
const sendAdminNotification = async (feedback, doctor, patient) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  
  // Always log for debugging
  console.log('[Feedback] Admin notification:', {
    type: feedback.type,
    doctor: doctor.name,
    patient: patient.firstName,
    rating: feedback.rating,
    reason: feedback.reason,
  });

  // If no admin email configured, skip sending
  if (!adminEmail) {
    console.log('[Feedback] No ADMIN_EMAIL configured, skipping email');
    return;
  }

  const emoji = feedback.type === 'like' ? '👍' : '👎';
  const statusColor = feedback.type === 'like' ? '#16a34a' : '#dc2626';
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@medbookpro.com',
    to: adminEmail,
    subject: `${emoji} New ${feedback.type === 'like' ? 'Positive' : 'Negative'} Feedback - Dr. ${doctor.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">New Feedback Received</h2>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Type:</strong> <span style="color: ${statusColor}; font-weight: bold;">${feedback.type.toUpperCase()}</span></p>
          <p><strong>Rating:</strong> ${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)} (${feedback.rating}/5)</p>
          <p><strong>Doctor:</strong> Dr. ${doctor.name}</p>
          <p><strong>Patient:</strong> ${patient.firstName} ${patient.lastName || ''}</p>
        </div>
        
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
          <h3 style="margin-top: 0; color: #1e40af;">Reason/Comment:</h3>
          <p style="color: #374151; line-height: 1.6;">${feedback.reason}</p>
        </div>
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          Please review this feedback in the admin dashboard.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('[Feedback] Admin notification email sent successfully');
  } catch (error) {
    console.error('[Feedback] Failed to send admin notification email:', error.message);
  }
};

// Also send notification to doctor
const sendDoctorNotification = async (feedback, doctor, patient) => {
  const doctorUser = await User.findById(doctor.user);
  
  if (!doctorUser || !doctorUser.email) {
    console.log('[Feedback] Doctor email not found');
    return;
  }

  const emoji = feedback.type === 'like' ? '🎉' : '⚠️';
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@medbookpro.com',
    to: doctorUser.email,
    subject: `${emoji} New Patient Feedback - ${feedback.type === 'like' ? 'Positive' : 'Needs Attention'}`,
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
          <p style="color: #374151; line-height: 1.6;">${feedback.reason}</p>
        </div>
        
        ${feedback.type === 'dislike' ? `
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin-top: 20px;">
          <p style="color: #dc2626; font-weight: bold;">This feedback has been sent to the admin for review.</p>
        </div>
        ` : ''}
        
        <p style="margin-top: 20px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile" 
             style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Respond to Feedback
          </a>
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('[Feedback] Doctor notification email sent successfully');
  } catch (error) {
    console.error('[Feedback] Failed to send doctor notification email:', error.message);
  }
};

/**
 * POST /api/feedback
 * Patient gives feedback to a doctor
 */
router.post('/', auth, async (req, res) => {
  try {
    const { doctor_id, rating, type, reason } = req.body;
    const patient_id = req.user._id;

    // Check if doctor exists
    const doctor = await Doctor.findById(doctor_id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({ patient: patient_id, doctor: doctor_id });
    if (existingFeedback) {
      return res.status(400).json({ message: 'You have already given feedback to this doctor' });
    }

    // Create feedback
    const feedback = new Feedback({
      patient: patient_id,
      doctor: doctor_id,
      rating,
      type,
      reason,
      status: 'pending'
    });

    await feedback.save();

    // Get doctor info for notification
    const doctorUser = await User.findById(doctor.user);
    
    // Send notification to admin
    await sendAdminNotification(feedback, {
      name: doctorUser ? `${doctorUser.firstName} ${doctorUser.lastName}` : 'Unknown'
    }, {
      firstName: req.user.firstName,
      lastName: req.user.lastName
    });

    // Send notification to doctor
    await sendDoctorNotification(feedback, doctor, {
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
 * Get patient's feedback history
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
 * GET /api/feedback/doctor
 * Get feedback for a doctor (private)
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

    // Calculate statistics
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
 * Doctor responds to feedback
 */
router.put('/:id/respond', auth, async (req, res) => {
  try {
    const { response } = req.body;
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Verify doctor owns this feedback
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
 * GET /api/feedback/admin
 * Admin: Get all feedback
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
 * Admin: Update feedback status and notes
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

console.log('[Feedback Routes] Feedback routes loaded');
