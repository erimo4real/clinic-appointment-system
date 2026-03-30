/**
 * =====================================================
 * MEDICAL RECORD MODEL
 * =====================================================
 * 
 * Mongoose schema for patient medical records.
 * Stores patient history, diagnoses, and treatments.
 * 
 * @schema medicalRecordSchema
 * =====================================================
 */

const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
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
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  visitDate: {
    type: Date,
    default: Date.now
  },
  chiefComplaint: {
    type: String,
    required: true
  },
  diagnosis: {
    type: String,
    required: true
  },
  symptoms: [{
    type: String
  }],
  treatment: {
    type: String
  },
  notes: {
    type: String
  },
  vitalSigns: {
    bloodPressure: String,
    heartRate: String,
    temperature: String,
    weight: String,
    height: String
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  followUpDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = MedicalRecord;
