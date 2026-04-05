const twilio = require('twilio');

const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const sendSMS = async (to, message) => {
  try {
    if (!client) {
      console.log('SMS not configured - would send to:', to, 'Message:', message);
      return { success: true, message: 'SMS service not configured' };
    }

    const formattedNumber = to.startsWith('+') ? to : `+234${to.slice(1)}`;
    
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber,
    });
    
    return { success: true };
  } catch (error) {
    console.error('SMS error:', error);
    return { success: false, error: error.message };
  }
};

const smsTemplates = {
  appointmentConfirmation: (appointment) => 
    `MedBook Pro: Your appointment with Dr. ${appointment.doctor_name} on ${appointment.date} at ${appointment.start_time} is confirmed.`,
  
  appointmentReminder: (appointment) =>
    `MedBook Pro: Reminder - You have an appointment with Dr. ${appointment.doctor_name} tomorrow at ${appointment.start_time}. Please arrive 15 min early.`,
  
  appointmentCancelled: (appointment) =>
    `MedBook Pro: Your appointment with Dr. ${appointment.doctor_name} on ${appointment.date} has been cancelled. Please call to reschedule.`,
  
  appointmentRescheduled: (appointment) =>
    `MedBook Pro: Your appointment has been rescheduled to ${appointment.date} at ${appointment.start_time}.`,
};

module.exports = { sendSMS, smsTemplates };
