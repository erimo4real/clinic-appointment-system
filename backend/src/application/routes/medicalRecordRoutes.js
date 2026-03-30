/**
 * =====================================================
 * MEDICAL RECORD ROUTES
 * =====================================================
 * 
 * HTTP endpoints for medical records management.
 * 
 * @layer Presentation/Routes
 * =====================================================
 */

const express = require('express');
const router = express.Router();
const MedicalRecord = require('../../domain/entities/MedicalRecord');
const { auth } = require('../../infrastructure/middleware/auth');
const authorize = require('../../infrastructure/middleware/authorize');

/**
 * GET /api/medical-records
 * Get all medical records (admin/doctor only)
 */
router.get('/', auth, authorize('admin', 'doctor'), async (req, res) => {
  try {
    const query = {};
    
    if (req.user.role === 'doctor') {
      const Doctor = require('../../domain/entities/Doctor');
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (doctor) {
        query.doctor = doctor._id;
      }
    } else if (req.query.patientId) {
      query.patient = req.query.patientId;
    }
    
    const records = await MedicalRecord.find(query)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor')
      .sort({ visitDate: -1 });
    
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/medical-records/:id
 * Get single medical record
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor');
    
    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }
    
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/medical-records
 * Create new medical record (doctor only)
 */
router.post('/', auth, authorize('doctor'), async (req, res) => {
  try {
    const record = new MedicalRecord(req.body);
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * PUT /api/medical-records/:id
 * Update medical record
 */
router.put('/:id', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * DELETE /api/medical-records/:id
 * Delete medical record
 */
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await MedicalRecord.findByIdAndDelete(req.params.id);
    res.json({ message: 'Medical record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
