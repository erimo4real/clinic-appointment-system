const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: String,
  email: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  workingHours: {
    monday: { start: '08:00', end: '18:00', enabled: true },
    tuesday: { start: '08:00', end: '18:00', enabled: true },
    wednesday: { start: '08:00', end: '18:00', enabled: true },
    thursday: { start: '08:00', end: '18:00', enabled: true },
    friday: { start: '08:00', end: '18:00', enabled: true },
    saturday: { start: '09:00', end: '14:00', enabled: true },
    sunday: { start: '09:00', end: '14:00', enabled: false },
  },
  facilities: [String],
  isMain: {
    type: Boolean,
    default: false,
  },
});

branchSchema.index({ isActive: 1 });

const Branch = mongoose.model('Branch', branchSchema);

module.exports = Branch;
