/**
 * =====================================================
 * USER ENTITY (Domain Layer)
 * =====================================================
 * 
 * Domain entity representing a User.
 * Contains data structure and business methods.
 * 
 * @domain User
 * @layer Domain/Entities
 * =====================================================
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema Definition
 * 
 * @schema userSchema
 */
const userSchema = new mongoose.Schema({
  // ==========================================
  // REQUIRED FIELDS
  // ==========================================
  
  /** 
   * Unique username for login
   * Required, must be unique in database
   */
  username: { 
    type: String, 
    required: [true, 'Username is required'], // Custom error message for debugging
    unique: true, // Enforce uniqueness
    trim: true, // Remove whitespace
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  
  /**
   * User's email address
   * Required, used for login and password reset
   */
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true, // Store in lowercase for consistency
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'] // Email validation regex
  },
  
  /**
   * User's password (hashed)
   * Will be hashed using bcrypt before saving
   */
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include in queries by default (security)
  },
  
  // ==========================================
  // ROLE & PERMISSIONS
  // ==========================================
  
  /**
   * User role determines permissions
   * Default: 'patient'
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
  
  /** Date of birth - important for medical records */
  dateOfBirth: { 
    type: Date
  },

  /**
   * Whether user account is active
   */
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
  // Mongoose options
  timestamps: false, // We manually manage createdAt/updatedAt
  toJSON: { 
    // Remove sensitive fields from JSON output
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.passwordResetToken;
      return ret;
    }
  }
});

// ============================================
// MIDDLEWARE: Pre-save Hook
// ============================================

/**
 * Password Hashing Middleware
 * 
 * Automatically hashes password before saving to database
 * Only hashes if password is modified
 * 
 * @pre save middleware
 */
userSchema.pre('save', async function(next) {
  // Skip if password not modified
  if (!this.isModified('password')) {
    return next();
  }
  
  // Debug log (remove in production)
  console.log('[User Model] Hashing password for user:', this.email);
  
  try {
    // Hash password with bcrypt (12 rounds = good security)
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('[User Model] Password hashed successfully');
    next();
  } catch (error) {
    console.error('[User Model] Error hashing password:', error.message);
    next(error);
  }
});

// ============================================
// MIDDLEWARE: Update Hook
// ============================================

/**
 * Update timestamp on save
 */
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Compare password method
 * 
 * Compares candidate password with stored hashed password
 * 
 * @method comparePassword
 * @param {string} candidatePassword - Plain text password to compare
 * @returns {Promise<boolean>} - True if passwords match
 * 
 * @example
 * const user = await User.findOne({ email: 'test@example.com' });
 * const isMatch = await user.comparePassword('password123');
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('[User Model] Password comparison result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('[User Model] Error comparing password:', error.message);
    throw error;
  }
};

/**
 * Get full name
 * 
 * @method getFullName
 * @returns {string} - First and last name combined
 */
userSchema.methods.getFullName = function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
};

/**
 * Check if user is admin
 * 
 * @method isAdmin
 * @returns {boolean}
 */
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

/**
 * Check if user is doctor
 * 
 * @method isDoctor
 * @returns {boolean}
 */
userSchema.methods.isDoctor = function() {
  return this.role === 'doctor';
};

// ============================================
// STATIC METHODS
// ============================================

/**
 * Find user by email (case-insensitive)
 * 
 * @static
 * @method findByEmail
 * @param {string} email - Email to search for
 * @returns {Promise<User|null>}
 */
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Find users by role
 * 
 * @static
 * @method findByRole
 * @param {string} role - Role to filter by
 * @returns {Promise<User[]>}
 */
userSchema.statics.findByRole = function(role) {
  return this.find({ role });
};

// ============================================
// INDEXES (FOR PERFORMANCE)
// ============================================

// Index on email for faster login lookups
userSchema.index({ email: 1 });

// Index on username for faster lookups
userSchema.index({ username: 1 });

// Index on role for filtering
userSchema.index({ role: 1 });

// Compound index for common query pattern
userSchema.index({ email: 1, role: 1 });

// ============================================
// MODEL EXPORT
// ============================================

/**
 * User Model
 * 
 * @typedef {Model<UserDocument>} User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;

// ============================================
// DEBUG: Log schema creation
// ============================================
console.log('[User Model] Schema created successfully');
