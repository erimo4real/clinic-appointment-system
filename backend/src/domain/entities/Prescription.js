/**
 * =====================================================
 * PRESCRIPTION MODEL
 * =====================================================
 * 
 * Mongoose schema for prescriptions.
 * Stores doctor prescriptions for patients.
 * 
 * @schema prescriptionSchema
 * =====================================================
 */

const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  medicalRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  dateIssued: {
    type: Date,
    default: Date.now
  },
  medicines: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;
