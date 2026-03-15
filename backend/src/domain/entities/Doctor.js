/**
 * =====================================================
 * DOCTOR MODEL
 * =====================================================
 * 
 * Mongoose schema for Doctor collection.
 * Stores doctor profiles with specialty and qualifications.
 * 
 * =====================================================
 */

const mongoose = require('mongoose');

/**
 * Doctor Schema Definition
 * 
 * @schema doctorSchema
 */
const doctorSchema = new mongoose.Schema({
  // ==========================================
  // REQUIRED FIELDS
  // ==========================================
  
  /** 
   * Reference to User document
   * Each doctor must have a user account
   * Uses ObjectId to reference User collection
   */
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Doctor must have a user account'],
    unique: true // One user can only be one doctor
  },
  
  /**
   * Medical specialty/specialization
   * Examples: Cardiology, Neurology, Pediatrics, etc.
   */
  specialty: { 
    type: String, 
    required: [true, 'Specialty is required'],
    trim: true,
    enum: {
      values: [
        'General Medicine',
        'Cardiology',
        'Neurology',
        'Orthopedics',
        'Pediatrics',
        'Dermatology',
        'Ophthalmology',
        'ENT',
        'Gynecology',
        'Psychiatry',
        'Oncology',
        'Gastroenterology',
        'Pulmonology',
        'Urology',
        'Nephrology',
        'Endocrinology',
        'Rheumatology',
        'Other'
      ],
      message: '{VALUE} is not a valid specialty'
    }
  },
  
  /**
   * Medical qualifications/degrees
   * Examples: MD, MBBS, MS, PhD, etc.
   */
  qualification: { 
    type: String, 
    required: [true, 'Qualification is required'],
    trim: true
  },

  /**
   * Years of experience
   */
  experience: {
    type: Number,
    default: 0,
    min: [0, 'Experience cannot be negative']
  },
  
  // ==========================================
  // OPTIONAL FIELDS
  // ==========================================
  
  /** Doctor's biography or description */
  bio: { 
    type: String,
    trim: true,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  
  /** Consultation fee in dollars */
  consultationFee: { 
    type: Number, 
    required: [true, 'Consultation fee is required'],
    min: [0, 'Fee cannot be negative']
  },
  
  /** URL to doctor's profile image */
  profileImage: { 
    type: String,
    default: null
  },
  
  /** Whether doctor is available for appointments */
  isAvailable: { 
    type: Boolean, 
    default: true 
  },
  
  // ==========================================
  // TIMESTAMPS
  // ==========================================
  
  /** Profile creation timestamp */
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  // Mongoose options
  timestamps: false, // We manually manage createdAt
  toJSON: { 
    virtuals: true, // Include virtuals in JSON output
    transform: function(doc, ret) {
      ret.id = ret._id; // Add id field for frontend compatibility
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// ============================================
// VIRTUAL PROPERTIES
// ============================================

/**
 * Get doctor's full name from referenced User
 * 
 * @virtual fullName
 */
doctorSchema.virtual('fullName').get(function() {
  return this.user ? `${this.user.firstName} ${this.user.lastName}`.trim() : '';
});

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Toggle availability status
 * 
 * @method toggleAvailability
 */
doctorSchema.methods.toggleAvailability = function() {
  this.isAvailable = !this.isAvailable;
  return this.save();
};

/**
 * Check if doctor is currently available
 * 
 * @method isAvailableNow
 * @returns {boolean}
 */
doctorSchema.methods.isAvailableNow = function() {
  return this.isAvailable;
};

// ============================================
// STATIC METHODS
// ============================================

/**
 * Find all available doctors
 * 
 * @static
 * @method findAvailable
 * @returns {Promise<Doctor[]>}
 */
doctorSchema.statics.findAvailable = function() {
  return this.find({ isAvailable: true }).populate('user', 'firstName lastName email');
};

/**
 * Find doctors by specialty
 * 
 * @static
 * @method findBySpecialty
 * @param {string} specialty - Specialty to filter by
 * @returns {Promise<Doctor[]>}
 */
doctorSchema.statics.findBySpecialty = function(specialty) {
  return this.find({ specialty, isAvailable: true }).populate('user', 'firstName lastName email');
};

// ============================================
// INDEXES (FOR PERFORMANCE)
// ============================================

// Index on specialty for filtering
doctorSchema.index({ specialty: 1 });

// Index on isAvailable for faster filtering
doctorSchema.index({ isAvailable: 1 });

// Compound index for common query pattern
doctorSchema.index({ specialty: 1, isAvailable: 1 });

// ============================================
// MODEL EXPORT
// ============================================

/**
 * Doctor Model
 * 
 * @typedef {Model<DoctorDocument>} Doctor
 */
const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;

// ============================================
// DEBUG: Log schema creation
// ============================================
console.log('[Doctor Model] Schema created successfully');
