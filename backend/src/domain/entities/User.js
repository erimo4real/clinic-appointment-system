/**
 * =====================================================
 * USER MODEL
 * =====================================================
 * 
 * Mongoose schema for User collection.
 * Represents all users in the system including patients,
 * doctors, admins, and receptionists.
 * 
 * @schema userSchema
 * =====================================================
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema Definition
 * 
 * Defines the structure for user documents in MongoDB.
 */
const userSchema = new mongoose.Schema({
  // ==========================================
  // REQUIRED FIELDS
  // ==========================================
  
  /**
   * Unique username for login
   * Must be unique in the database
   */
  username: { 
    type: String, 
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  
  /**
   * User's email address
   * Used for login and password reset
   */
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,  // Store in lowercase for consistency
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  
  /**
   * User's password (hashed)
   * Hashed using bcrypt before saving
   */
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false  // Don't include in queries by default
  },
  
  // ==========================================
  // ROLE & PERMISSIONS
  // ==========================================
  
  /**
   * User role determines system permissions
   * - admin: Full system access
   * - doctor: Doctor-specific features
   * - receptionist: Appointment management
   * - patient: Booking and feedback
   */
  role: { 
    type: String, 
    enum: {
      values: ['admin', 'doctor', 'receptionist', 'patient'],
      message: '{VALUE} is not a valid role'
    }, 
    default: 'patient' 
  },
  
  // ==========================================
  // PERSONAL INFORMATION
  // ==========================================
  
  /** User's first name */
  firstName: { 
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  
  /** User's last name */
  lastName: { 
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  
  /** Contact phone number */
  phone: { 
    type: String,
    trim: true,
    match: [/^[0-9+\-\s()]*$/, 'Please provide a valid phone number']
  },
  
  /** Physical address */
  address: { 
    type: String,
    trim: true
  },
  
  /** Date of birth */
  dateOfBirth: { 
    type: Date
  },

  /** Whether user account is active */
  isActive: {
    type: Boolean,
    default: true
  },
  
  // ==========================================
  // TIMESTAMPS
  // ==========================================
  
  /** Account creation timestamp */
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  
  /** Last update timestamp */
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  
  // ==========================================
  // PASSWORD RESET FIELDS
  // ==========================================
  
  /** Token for password reset (hashed) */
  passwordResetToken: { 
    type: String 
  },
  
  /** Token expiration time */
  passwordResetExpires: { 
    type: Date 
  }
}, {
  timestamps: false,  // We manually manage timestamps
  toJSON: { 
    // Remove sensitive fields from JSON output
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.passwordResetToken;
      return ret;
    }
  }
});

/**
 * Pre-save middleware to hash password.
 * Only hashes if password has been modified.
 */
userSchema.pre('save', async function(next) {
  // Skip if password not modified
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Hash password with bcrypt (12 rounds for security)
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Pre-save middleware to update timestamp.
 */
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Instance method to compare password.
 * 
 * @method comparePassword
 * @param {string} candidatePassword - Plain text password to compare
 * @returns {Promise<boolean>} - True if passwords match
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Instance method to get full name.
 * 
 * @method getFullName
 * @returns {string} - First and last name combined
 */
userSchema.methods.getFullName = function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
};

/**
 * Instance method to check if user is admin.
 * 
 * @method isAdmin
 * @returns {boolean}
 */
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

/**
 * Instance method to check if user is doctor.
 * 
 * @method isDoctor
 * @returns {boolean}
 */
userSchema.methods.isDoctor = function() {
  return this.role === 'doctor';
};

// ==========================================
// STATIC METHODS
// ==========================================

/**
 * Find user by email (case-insensitive).
 * 
 * @static
 * @param {string} email - Email to search for
 * @returns {Promise<User|null>}
 */
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Find users by role.
 * 
 * @static
 * @param {string} role - Role to filter by
 * @returns {Promise<User[]>}
 */
userSchema.statics.findByRole = function(role) {
  return this.find({ role });
};

// ==========================================
// INDEXES
// ==========================================

userSchema.index({ role: 1 });          // Faster role filtering
userSchema.index({ email: 1, role: 1 }); // Common query pattern

// ==========================================
// MODEL EXPORT
// ==========================================

const User = mongoose.model('User', userSchema);

module.exports = User;
