const mongoose = require('mongoose');

const insuranceSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  provider: {
    type: String,
    required: true,
    trim: true,
  },
  policyNumber: {
    type: String,
    required: true,
    trim: true,
  },
  groupNumber: String,
  planType: {
    type: String,
    enum: ['basic', 'standard', 'premium'],
    default: 'basic',
  },
  coverageStart: {
    type: Date,
    required: true,
  },
  coverageEnd: {
    type: Date,
    required: true,
  },
  coverageAmount: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationDate: Date,
  verificationNotes: String,
  documents: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now },
  }],
  status: {
    type: String,
    enum: ['active', 'expired', 'suspended', 'cancelled'],
    default: 'active',
  },
}, {
  timestamps: true,
});

insuranceSchema.index({ patient: 1 });
insuranceSchema.index({ policyNumber: 1 });
insuranceSchema.index({ status: 1 });

const Insurance = mongoose.model('Insurance', insuranceSchema);

module.exports = Insurance;
