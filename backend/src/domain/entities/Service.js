/**
 * =====================================================
 * SERVICE MODEL
 * =====================================================
 * 
 * Mongoose schema for Service collection.
 * Represents medical services offered by the clinic.
 * 
 * =====================================================
 */

const mongoose = require('mongoose');

/**
 * Service Schema Definition
 * 
 * @schema serviceSchema
 */
const serviceSchema = new mongoose.Schema({
  // ==========================================
  // REQUIRED FIELDS
  // ==========================================
  
  /** 
   * Service name
   * Examples: General Checkup, Blood Test, X-Ray, etc.
   */
  name: { 
    type: String, 
    required: [true, 'Service name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  
  /**
   * Detailed description of the service
   */
  description: { 
    type: String, 
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  /**
   * Service price in dollars
   */
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  // ==========================================
  // OPTIONAL FIELDS
  // ==========================================
  
  /** Service duration in minutes */
  duration: { 
    type: Number, 
    default: 30, // Default 30 minutes
    min: [5, 'Duration must be at least 5 minutes'],
    max: [480, 'Duration cannot exceed 8 hours (480 minutes)']
  },
  
  /** Whether service is currently offered */
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  // ==========================================
  // TIMESTAMPS
  // ==========================================
  
  /** Service creation timestamp */
  createdAt: { 
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
// VIRTUAL PROPERTIES
// ============================================

/**
 * Get formatted duration (e.g., "30 minutes")
 * 
 * @virtual formattedDuration
 */
serviceSchema.virtual('formattedDuration').get(function() {
  if (this.duration >= 60) {
    const hours = Math.floor(this.duration / 60);
    const minutes = this.duration % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return `${this.duration} minutes`;
});

/**
 * Get formatted price with currency symbol
 * 
 * @virtual formattedPrice
 */
serviceSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Toggle active status
 * 
 * @method toggleActive
 */
serviceSchema.methods.toggleActive = function() {
  this.isActive = !this.isActive;
  return this.save();
};

// ============================================
// STATIC METHODS
// * ============================================

/**
 * Find all active services
 * 
 * @static
 * @method findActive
 * @returns {Promise<Service[]>}
 */
serviceSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

/**
 * Find services within price range
 * 
 * @static
 * @method findByPriceRange
 * @param {number} min - Minimum price
 * @param {number} max - Maximum price
 * @returns {Promise<Service[]>}
 */
serviceSchema.statics.findByPriceRange = function(min, max) {
  return this.find({ 
    price: { $gte: min, $lte: max },
    isActive: true 
  });
};

// ============================================
// INDEXES (FOR PERFORMANCE)
// ============================================

// Index on name for faster searches
serviceSchema.index({ name: 'text', description: 'text' }); // Text index for search

// Index on isActive for filtering
serviceSchema.index({ isActive: 1 });

// Index on price for sorting
serviceSchema.index({ price: 1 });

// ============================================
// MODEL EXPORT
// ============================================

/**
 * Service Model
 * 
 * @typedef {Model<ServiceDocument>} Service
 */
const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;

// ============================================
// DEBUG: Log schema creation
// ============================================
console.log('[Service Model] Schema created successfully');
