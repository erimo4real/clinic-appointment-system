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
      return { success: false, message: 'Email service not configured' };
    }
    
    await transporter.sendMail({
      from: `"MedBook Pro" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
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

  doctorCreated: (doctorData) => ({
    subject: '🎉 Welcome to MedBook Pro Clinic - Your Doctor Account Created',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #14b8a6; margin: 0;">MedBook Pro</h1>
          <p style="color: #666; margin-top: 5px;">Clinic Appointment Management System</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%); border-radius: 16px; padding: 30px; margin-bottom: 20px;">
          <h2 style="color: #059669; margin-top: 0;">🎉 Welcome to the Team, Dr. ${doctorData.name}!</h2>
          <p style="color: #374151; font-size: 16px;">Your doctor account has been successfully created by the administrator.</p>
        </div>

        <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #111827; margin-top: 0; border-bottom: 2px solid #14b8a6; padding-bottom: 10px;">📋 Your Login Credentials</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px; color: #6b7280; width: 120px;"><strong>Email:</strong></td>
              <td style="padding: 12px; color: #111827; font-weight: 600;">${doctorData.email}</td>
            </tr>
            <tr>
              <td style="padding: 12px; color: #6b7280;"><strong>Password:</strong></td>
              <td style="padding: 12px; color: #111827; font-weight: 600; font-family: monospace; background: #e5e7eb; padding: 8px 12px; border-radius: 6px; display: inline-block;">${doctorData.password}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #111827; border-bottom: 2px solid #14b8a6; padding-bottom: 10px;">🔗 Login Here</h3>
          <a href="${process.env.FRONTEND_URL || 'https://clinic-appointment-management-sys.netlify.app'}/login" 
             style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px;">
            Login to Dashboard
          </a>
        </div>

        <div style="background: #f0f9ff; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #0369a1; margin-top: 0;">⚡ Next Steps - Complete Your Profile</h3>
          <ul style="color: #374151; line-height: 1.8;">
            <li>Login using the credentials above</li>
            <li>Navigate to your <strong>Profile</strong> section</li>
            <li>Add your <strong>specialty</strong> (e.g., Cardiology, Pediatrics)</li>
            <li>Set your <strong>consultation fee</strong></li>
            <li>Add the <strong>services</strong> you offer</li>
            <li>Write a short <strong>bio</strong> about yourself</li>
            <li>Set your <strong>availability schedule</strong></li>
          </ul>
        </div>

        <div style="background: #fef3c7; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #92400e; margin-top: 0;">📊 Your Dashboard Features</h3>
          <ul style="color: #374151; line-height: 1.8;">
            <li>📅 View and manage patient appointments</li>
            <li>👤 Update your profile and specialty</li>
            <li>💰 Set your consultation fee</li>
            <li>🩺 Add services you offer</li>
            <li>⏰ Manage your availability schedule</li>
            <li>📋 View patient appointments assigned to you</li>
          </ul>
        </div>

        <div style="background: #f3e8ff; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #7c3aed; margin-top: 0;">📞 Need Help?</h3>
          <p style="color: #374151;">If you have any questions or need assistance, please contact the administrator or reach out to our support team.</p>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
          <p><strong>MedBook Pro Clinic</strong></p>
          <p>📍 123 Medical Center, Lagos, Nigeria</p>
          <p>🌐 www.medbookpro.com</p>
          <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
            This is an automated message from MedBook Pro Clinic. Please do not reply directly to this email.
          </p>
        </div>
      </div>
    `,
  }),
};

module.exports = { sendEmail, emailTemplates };
