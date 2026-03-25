/**
 * =====================================================
 * DOCTOR MODEL
 * =====================================================
 * 
 * Mongoose schema for Doctor collection.
 * Stores doctor profiles with specialty, qualifications,
 * and availability information.
 * 
 * @schema doctorSchema
 * =====================================================
 */

const mongoose = require('mongoose');

/**
 * Doctor Schema Definition
 */
const doctorSchema = new mongoose.Schema({
  // ==========================================
  // REQUIRED FIELDS
  // ==========================================
  
  /**
   * Reference to User document
   * Each doctor must have a linked user account
   */
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Doctor must have a user account'],
    unique: true  // One user can only be one doctor
  },
  
  /**
   * Medical specialty/specialization
   * Examples: Cardiology, Neurology, Pediatrics
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
   * Examples: MD, MBBS, MS, PhD
   */
  qualification: { 
    type: String, 
    required: [true, 'Qualification is required'],
    trim: true
  },

  /** Years of medical experience */
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
  timestamps: false,  // We manually manage timestamps
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
 * Virtual property to get doctor's full name from User.
 */
doctorSchema.virtual('fullName').get(function() {
  return this.user ? `${this.user.firstName} ${this.user.lastName}`.trim() : '';
});

/**
 * Instance method to toggle availability status.
 */
doctorSchema.methods.toggleAvailability = function() {
  this.isAvailable = !this.isAvailable;
  return this.save();
};

/**
 * Instance method to check current availability.
 */
doctorSchema.methods.isAvailableNow = function() {
  return this.isAvailable;
};

// ==========================================
// STATIC METHODS
// ==========================================

/**
 * Find all available doctors.
 */
doctorSchema.statics.findAvailable = function() {
  return this.find({ isAvailable: true }).populate('user', 'firstName lastName email');
};

/**
 * Find doctors by specialty.
 */
doctorSchema.statics.findBySpecialty = function(specialty) {
  return this.find({ specialty, isAvailable: true }).populate('user', 'firstName lastName email');
};

// ==========================================
// INDEXES
// ==========================================

doctorSchema.index({ specialty: 1 });
doctorSchema.index({ isAvailable: 1 });
doctorSchema.index({ specialty: 1, isAvailable: 1 });

// ==========================================
// MODEL EXPORT
// ==========================================

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
