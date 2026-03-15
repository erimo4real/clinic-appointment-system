/**
 * =====================================================
 * FEEDBACK MODEL
 * =====================================================
 * 
 * Mongoose schema for Feedback collection.
 * Stores patient feedback for doctors (private, not visible to others).
 * 
 * =====================================================
 */

const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  // Patient who gave feedback
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient is required']
  },

  // Doctor receiving feedback
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor is required']
  },

  // Rating (1-5 stars)
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Rating is required']
  },

  // Like or dislike
  type: {
    type: String,
    enum: ['like', 'dislike'],
    required: [true, 'Feedback type is required']
  },

  // Reason/comment for feedback
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    maxlength: [1000, 'Reason cannot exceed 1000 characters']
  },

  // Doctor's response (optional)
  response: {
    type: String,
    trim: true,
    maxlength: [1000, 'Response cannot exceed 1000 characters']
  },

  // Response date
  responseDate: {
    type: Date
  },

  // Status: pending, reviewed, action_taken
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'action_taken'],
    default: 'pending'
  },

  // Admin notes/action taken
  adminNotes: {
    type: String,
    trim: true
  },

  // Timestamp
  createdAt: {
    type: Date,
    default: Date.now
  },

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

// Index for performance
feedbackSchema.index({ doctor: 1, patient: 1 }, { unique: true });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ createdAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;

console.log('[Feedback Model] Schema created successfully');
