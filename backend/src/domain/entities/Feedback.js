/**
 * =====================================================
 * FEEDBACK MODEL
 * =====================================================
 * 
 * Mongoose schema for Feedback collection.
 * Stores patient feedback for doctors including
 * ratings, comments, and doctor responses.
 * 
 * @schema feedbackSchema
 * =====================================================
 */

const mongoose = require('mongoose');

/**
 * Feedback Schema Definition
 */
const feedbackSchema = new mongoose.Schema({
  /**
   * Patient who gave the feedback
   */
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient is required']
  },

  /**
   * Doctor receiving the feedback
   */
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor is required']
  },

  /**
   * Rating from 1 to 5 stars
   */
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Rating is required']
  },

  /**
   * Type of feedback: like or dislike
   */
  type: {
    type: String,
    enum: ['like', 'dislike'],
    required: [true, 'Feedback type is required']
  },

  /**
   * Patient's comment or reason
   */
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    maxlength: [1000, 'Reason cannot exceed 1000 characters']
  },

  /**
   * Doctor's response to the feedback (optional)
   */
  response: {
    type: String,
    trim: true,
    maxlength: [1000, 'Response cannot exceed 1000 characters']
  },

  /**
   * Date when doctor responded
   */
  responseDate: {
    type: Date
  },

  /**
   * Review status: pending, reviewed, or action taken
   */
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'action_taken'],
    default: 'pending'
  },

  /**
   * Admin notes or action taken
   */
  adminNotes: {
    type: String,
    trim: true
  },

  /**
   * Creation timestamp
   */
  createdAt: {
    type: Date,
    default: Date.now
  },

  /**
   * Last update timestamp
   */
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

// Indexes for efficient queries
feedbackSchema.index({ doctor: 1, patient: 1 }, { unique: true });  // One feedback per patient per doctor
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ createdAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
