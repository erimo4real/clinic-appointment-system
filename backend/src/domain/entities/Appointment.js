/**
 * =====================================================
 * APPOINTMENT MODEL
 * =====================================================
 * 
 * Mongoose schema for Appointment collection.
 * Handles appointment scheduling with conflict prevention.
 * 
 * =====================================================
 * APPOINTMENT STATUS:
 * - pending: Awaiting confirmation
 * - confirmed: Confirmed by clinic
 * - in_progress: Currently being attended
 * - completed: Successfully completed
 * - cancelled: Cancelled by patient/clinic
 * - no_show: Patient did not show up
 * =====================================================
 */

const mongoose = require('mongoose');

/**
 * Appointment Schema Definition
 */
const appointmentSchema = new mongoose.Schema({
  // ==========================================
  // REQUIRED FIELDS
  // ==========================================
  
  /**
   * Patient who booked the appointment
   * Reference to User collection
   */
  patient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Patient is required']
  },
  
  /**
   * Doctor for the appointment
   * Reference to Doctor collection
   */
  doctor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor', 
    required: [true, 'Doctor is required']
  },
  
  /**
   * Service requested
   * Reference to Service collection
   */
  service: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Service', 
    required: [true, 'Service is required']
  },
  
  /**
   * Appointment date
   */
  date: { 
    type: Date, 
    required: [true, 'Date is required'],
    validate: {
      validator: function(value) {
        // Appointment must be at least 1 hour in advance
        const now = new Date();
        const appointmentTime = new Date(value);
        const hoursDiff = (appointmentTime - now) / (1000 * 60 * 60);
        return hoursDiff >= 1;
      },
      message: 'Appointments must be booked at least 1 hour in advance'
    }
  },
  
  /**
   * Appointment start time (24-hour format)
   * Examples: "09:00", "14:30", "17:45"
   */
  startTime: { 
    type: String, 
    required: [true, 'Start time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM']
  },
  
  /**
   * Appointment end time (24-hour format)
   */
  endTime: { 
    type: String, 
    required: [true, 'End time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM']
  },
  
  // ==========================================
  // STATUS & NOTES
  // ==========================================
  
  /**
   * Current appointment status
   */
  status: { 
    type: String, 
    enum: {
      values: [
        'pending',     // Awaiting confirmation
        'confirmed',   // Confirmed by clinic
        'in_progress', // Currently being attended
        'completed',   // Successfully completed
        'cancelled',   // Cancelled by patient/clinic
        'no_show'     // Patient did not show up
      ],
      message: '{VALUE} is not a valid status'
    }, 
    default: 'pending' 
  },
  
  /**
   * Additional notes for the appointment
   * Patient symptoms, special requests, etc.
   */
  notes: { 
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  // ==========================================
  // TIMESTAMPS
  // ==========================================
  
  /** Appointment creation timestamp */
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  
  /** Last update timestamp */
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: false,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

/**
 * Pre-save middleware to update timestamp.
 */
appointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// ==========================================
// INDEXES
// ==========================================

// Compound index for conflict detection (prevents double-booking)
appointmentSchema.index({ doctor: 1, date: 1, startTime: 1 });
appointmentSchema.index({ patient: 1, createdAt: -1 });  // Patient history
appointmentSchema.index({ doctor: 1, status: 1 });
appointmentSchema.index({ date: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ createdAt: -1 });

// ==========================================
// INSTANCE METHODS
// ==========================================

/**
 * Checks if appointment can be cancelled.
 */
appointmentSchema.methods.canCancel = function() {
  const nonCancellableStatuses = ['completed', 'cancelled', 'no_show'];
  return !nonCancellableStatuses.includes(this.status);
};

/**
 * Checks if appointment can be modified.
 */
appointmentSchema.methods.canModify = function() {
  return ['pending', 'confirmed'].includes(this.status);
};

/**
 * Cancels the appointment.
 */
appointmentSchema.methods.cancel = async function(reason = '') {
  if (!this.canCancel()) {
    throw new Error('This appointment cannot be cancelled');
  }
  this.status = 'cancelled';
  this.notes = reason ? `${this.notes}\nCancellation reason: ${reason}` : this.notes;
  return this.save();
};

/**
 * Confirms the appointment.
 */
appointmentSchema.methods.confirm = async function() {
  if (this.status !== 'pending') {
    throw new Error('Only pending appointments can be confirmed');
  }
  this.status = 'confirmed';
  return this.save();
};

/**
 * Marks appointment as in progress.
 */
appointmentSchema.methods.start = async function() {
  if (!['pending', 'confirmed'].includes(this.status)) {
    throw new Error('Appointment cannot be started');
  }
  this.status = 'in_progress';
  return this.save();
};

/**
 * Marks appointment as completed.
 */
appointmentSchema.methods.complete = async function() {
  if (this.status !== 'in_progress') {
    throw new Error('Only in-progress appointments can be completed');
  }
  this.status = 'completed';
  return this.save();
};

/**
 * Marks patient as no-show.
 */
appointmentSchema.methods.markNoShow = async function() {
  if (['completed', 'cancelled'].includes(this.status)) {
    throw new Error('Cannot mark this appointment as no-show');
  }
  this.status = 'no_show';
  return this.save();
};

// ==========================================
// STATIC METHODS
// ==========================================

/**
 * Checks for appointment conflicts.
 * Used to prevent double-booking.
 */
appointmentSchema.statics.checkConflict = async function(doctorId, date, startTime, endTime, excludeId = null) {
  const query = {
    doctor: doctorId,
    date: new Date(date),
    status: { $nin: ['cancelled', 'no_show'] }
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  query.$or = [
    { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
  ];
  
  return await this.findOne(query);
};

/**
 * Finds appointments for a specific date.
 */
appointmentSchema.statics.findByDate = function(date) {
  return this.find({ date: new Date(date) })
    .populate('patient', 'firstName lastName email phone')
    .populate('doctor')
    .populate('service')
    .sort({ startTime: 1 });
};

/**
 * Finds today's appointments for a doctor.
 */
appointmentSchema.statics.findTodayForDoctor = function(doctorId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.find({
    doctor: doctorId,
    date: { $gte: today, $lt: tomorrow },
    status: { $nin: ['cancelled', 'no_show'] }
  })
    .populate('patient', 'firstName lastName email phone')
    .populate('service')
    .sort({ startTime: 1 });
};

/**
 * Finds appointments by patient.
 */
appointmentSchema.statics.findByPatient = function(patientId) {
  return this.find({ patient: patientId })
    .populate('doctor')
    .populate('service')
    .sort({ date: -1, startTime: -1 });
};

// ==========================================
// MODEL EXPORT
// ==========================================

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
