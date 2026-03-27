/**
 * =====================================================
 * SERVICE MODEL
 * =====================================================
 * 
 * Mongoose schema for Service collection.
 * Represents medical services offered by the clinic.
 * 
 * @schema serviceSchema
 * =====================================================
 */

const mongoose = require('mongoose');

/**
 * Service Schema Definition
 */
const serviceSchema = new mongoose.Schema({
  // ==========================================
  // REQUIRED FIELDS
  // ==========================================
  
  /**
   * Service name
   * Examples: General Checkup, Blood Test, X-Ray
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
  
  /**
   * Service duration in minutes
   * Default: 30 minutes
   */
  duration: { 
    type: Number, 
    default: 30,
    min: [5, 'Duration must be at least 5 minutes'],
    max: [480, 'Duration cannot exceed 8 hours (480 minutes)']
  },
  
  /**
   * Whether service is currently offered
   */
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  // ==========================================
  // TIMESTAMPS
  // ==========================================
  
  /**
   * Service creation timestamp
   */
  createdAt: { 
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
 * Virtual property to get formatted duration string.
 * Example: "1h 30m" or "45 minutes"
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
 * Virtual property to get formatted price with currency.
 * Example: "₦150,000.00"
 */
serviceSchema.virtual('formattedPrice').get(function() {
  return `₦${this.price.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
});

/**
 * Instance method to toggle active status.
 */
serviceSchema.methods.toggleActive = function() {
  this.isActive = !this.isActive;
  return this.save();
};

// ==========================================
// STATIC METHODS
// ==========================================

/**
 * Find all active services.
 */
serviceSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

/**
 * Find services within a price range.
 */
serviceSchema.statics.findByPriceRange = function(min, max) {
  return this.find({ 
    price: { $gte: min, $lte: max },
    isActive: true 
  });
};

// ==========================================
// INDEXES
// ==========================================

serviceSchema.index({ name: 'text', description: 'text' });  // Text search
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ price: 1 });

// ==========================================
// MODEL EXPORT
// ==========================================

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
