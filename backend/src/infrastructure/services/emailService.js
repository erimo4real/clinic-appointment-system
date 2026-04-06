const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email not configured - would send to:', to, 'Subject:', subject);
      return { success: true, message: 'Email service not configured' };
    }
    
    await transporter.sendMail({
      from: `"MedBook Pro" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

const emailTemplates = {
  appointmentConfirmation: (appointment) => ({
    subject: 'Appointment Confirmed - MedBook Pro',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14b8a6;">Appointment Confirmed!</h2>
        <p>Your appointment has been confirmed. Here are the details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Date:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${appointment.date}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Time:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${appointment.start_time}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Doctor:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">Dr. ${appointment.doctor_name}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Service:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${appointment.service_name}</td></tr>
        </table>
        <p>Please arrive 15 minutes early. If you need to reschedule, please contact us.</p>
        <p style="color: #666; font-size: 12px;">MedBook Pro Clinic</p>
      </div>
    `,
  }),

  appointmentReminder: (appointment) => ({
    subject: 'Appointment Reminder - MedBook Pro',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Appointment Reminder</h2>
        <p>This is a reminder about your upcoming appointment:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Date:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${appointment.date}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Time:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${appointment.start_time}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Doctor:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">Dr. ${appointment.doctor_name}</td></tr>
        </table>
        <p>Please arrive on time.</p>
        <p style="color: #666; font-size: 12px;">MedBook Pro Clinic</p>
      </div>
    `,
  }),

  passwordReset: (resetToken, userEmail) => ({
    subject: 'Password Reset - MedBook Pro',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14b8a6;">Password Reset Request</h2>
        <p>You requested a password reset. Click the link below:</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}" 
           style="display: inline-block; background: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
          Reset Password
        </a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  }),

  welcomeEmail: (user) => ({
    subject: 'Welcome to MedBook Pro',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14b8a6;">Welcome, ${user.firstName}!</h2>
        <p>Thank you for registering with MedBook Pro Clinic.</p>
        <p>You can now:</p>
        <ul>
          <li>Book appointments online</li>
          <li>View your medical history</li>
          <li>Access prescriptions</li>
          <li>Receive appointment reminders</li>
        </ul>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/booking" 
           style="display: inline-block; background: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
          Book Your First Appointment
        </a>
        <p style="color: #666; font-size: 12px;">MedBook Pro Clinic</p>
      </div>
    `,
  }),

  appointmentCancelled: (appointment) => ({
    subject: 'Appointment Cancelled - MedBook Pro',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Appointment Cancelled</h2>
        <p>Your appointment has been cancelled. Here were the details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Date:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${appointment.date}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Time:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${appointment.start_time}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Doctor:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">Dr. ${appointment.doctor_name}</td></tr>
        </table>
        <p>We're sorry for any inconvenience. Please book a new appointment at your convenience.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/booking" 
           style="display: inline-block; background: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
          Book New Appointment
        </a>
        <p style="color: #666; font-size: 12px;">MedBook Pro Clinic</p>
      </div>
    `,
  }),
};

module.exports = { sendEmail, emailTemplates };
