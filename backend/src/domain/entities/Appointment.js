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
 * 
 * @schema appointmentSchema
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
        // Appointment must be booked at least 1 hour in advance
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
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM (24-hour format)']
  },
  
  /**
   * Appointment end time (24-hour format)
   * Examples: "09:30", "15:00", "18:15"
   */
  endTime: { 
    type: String, 
    required: [true, 'End time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM (24-hour format)']
  },
  
  // ==========================================
  // STATUS & NOTES
  // ==========================================
  
  /**
   * Current appointment status
   * Default: 'pending'
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
  // Mongoose options
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

// ============================================
// MIDDLEWARE: Pre-save Hook
// ============================================

/**
 * Update timestamp on save
 */
appointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// ============================================
// INDEXES (FOR PERFORMANCE)
// ============================================

/**
 * Compound index for conflict detection
 * 
 * IMPORTANT: This index is crucial for preventing
 * double-booking. Queries use this to check for
 * overlapping appointments.
 * 
 * Index on: doctor + date + startTime
 */
appointmentSchema.index({ doctor: 1, date: 1, startTime: 1 });

// Additional indexes for common queries
appointmentSchema.index({ patient: 1, createdAt: -1 }); // Patient's appointment history
appointmentSchema.index({ doctor: 1, status: 1 }); // Doctor's appointments by status
appointmentSchema.index({ date: 1 }); // Appointments by date
appointmentSchema.index({ status: 1 }); // Appointments by status
appointmentSchema.index({ createdAt: -1 }); // Recent appointments

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Check if appointment can be cancelled
 * 
 * @method canCancel
 * @returns {boolean}
 */
appointmentSchema.methods.canCancel = function() {
  // Cannot cancel if already completed or cancelled
  const nonCancellableStatuses = ['completed', 'cancelled', 'no_show'];
  return !nonCancellableStatuses.includes(this.status);
};

/**
 * Check if appointment can be modified
 * 
 * @method canModify
 * @returns {boolean}
 */
appointmentSchema.methods.canModify = function() {
  // Can only modify pending or confirmed appointments
  return ['pending', 'confirmed'].includes(this.status);
};

/**
 * Cancel the appointment
 * 
 * @method cancel
 * @param {string} reason - Optional cancellation reason
 * @returns {Promise<Appointment>}
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
 * Confirm the appointment
 * 
 * @method confirm
 * @returns {Promise<Appointment>}
 */
appointmentSchema.methods.confirm = async function() {
  if (this.status !== 'pending') {
    throw new Error('Only pending appointments can be confirmed');
  }
  this.status = 'confirmed';
  return this.save();
};

/**
 * Mark appointment as in progress
 * 
 * @method start
 * @returns {Promise<Appointment>}
 */
appointmentSchema.methods.start = async function() {
  if (!['pending', 'confirmed'].includes(this.status)) {
    throw new Error('Appointment cannot be started');
  }
  this.status = 'in_progress';
  return this.save();
};

/**
 * Mark appointment as completed
 * 
 * @method complete
 * @returns {Promise<Appointment>}
 */
appointmentSchema.methods.complete = async function() {
  if (this.status !== 'in_progress') {
    throw new Error('Only in-progress appointments can be completed');
  }
  this.status = 'completed';
  return this.save();
};

/**
 * Mark patient as no-show
 * 
 * @method markNoShow
 * @returns {Promise<Appointment>}
 */
appointmentSchema.methods.markNoShow = async function() {
  if (['completed', 'cancelled'].includes(this.status)) {
    throw new Error('Cannot mark this appointment as no-show');
  }
  this.status = 'no_show';
  return this.save();
};

// ============================================
// STATIC METHODS
// * ============================================

/**
 * Check for appointment conflicts
 * 
 * IMPORTANT: This method prevents double-booking.
 * It checks if the proposed time slot overlaps
 * with any existing appointments for the doctor.
 * 
 * @static
 * @method checkConflict
 * @param {string} doctorId - Doctor's ObjectId
 * @param {Date} date - Appointment date
 * @param {string} startTime - Start time
 * @param {string} endTime - End time
 * @param {string} excludeId - Optional appointment ID to exclude (for updates)
 * @returns {Promise<Appointment|null>} - Conflicting appointment or null
 */
appointmentSchema.statics.checkConflict = async function(doctorId, date, startTime, endTime, excludeId = null) {
  // Build query to find conflicting appointments
  const query = {
    doctor: doctorId,
    date: new Date(date),
    status: { $nin: ['cancelled', 'no_show'] } // Exclude cancelled/no-show appointments
  };
  
  // If updating, exclude the current appointment
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  // Check for overlapping time slots
  // Two appointments conflict if:
  // - One starts before the other ends, AND
  // - One ends after the other starts
  query.$or = [
    {
      // Existing appointment starts before new one ends
      startTime: { $lt: endTime },
      // AND existing appointment ends after new one starts
      endTime: { $gt: startTime }
    }
  ];
  
  return await this.findOne(query);
};

/**
 * Find appointments for a specific date
 * 
 * @static
 * @method findByDate
 * @param {Date} date - Date to search
 * @returns {Promise<Appointment[]>}
 */
appointmentSchema.statics.findByDate = function(date) {
  return this.find({ date: new Date(date) })
    .populate('patient', 'firstName lastName email phone')
    .populate('doctor')
    .populate('service')
    .sort({ startTime: 1 });
};

/**
 * Find today's appointments for a doctor
 * 
 * @static
 * @method findTodayForDoctor
 * @param {string} doctorId - Doctor's ObjectId
 * @returns {Promise<Appointment[]>}
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
 * Find appointments by patient
 * 
 * @static
 * @method findByPatient
 * @param {string} patientId - Patient's ObjectId
 * @returns {Promise<Appointment[]>}
 */
appointmentSchema.statics.findByPatient = function(patientId) {
  return this.find({ patient: patientId })
    .populate('doctor')
    .populate('service')
    .sort({ date: -1, startTime: -1 });
};

// ============================================
// MODEL EXPORT
// ============================================

/**
 * Appointment Model
 * 
 * @typedef {Model<AppointmentDocument>} Appointment
 */
const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;

// ============================================
// DEBUG: Log schema creation
// ============================================
console.log('[Appointment Model] Schema created successfully');
