const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  patientPhone: String,
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  doctorName: String,
  preferredDate: {
    type: Date,
    required: true,
  },
  preferredTime: String,
  reason: String,
  status: {
    type: String,
    enum: ['waiting', 'scheduled', 'cancelled', 'expired'],
    default: 'waiting',
  },
  scheduledAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  priority: {
    type: Number,
    default: 0,
  },
  notes: String,
}, {
  timestamps: true,
});

waitlistSchema.index({ doctor: 1, preferredDate: 1 });
waitlistSchema.index({ status: 1 });
waitlistSchema.index({ patient: 1 });

const Waitlist = mongoose.model('Waitlist', waitlistSchema);

module.exports = Waitlist;
