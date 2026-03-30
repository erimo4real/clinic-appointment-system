/**
 * =====================================================
 * PRESCRIPTION ROUTES
 * =====================================================
 * 
 * HTTP endpoints for prescriptions management.
 * 
 * @layer Presentation/Routes
 * =====================================================
 */

const express = require('express');
const router = express.Router();
const Prescription = require('../../domain/entities/Prescription');
const { auth } = require('../../infrastructure/middleware/auth');
const authorize = require('../../infrastructure/middleware/authorize');

/**
 * GET /api/prescriptions
 * Get all prescriptions
 */
router.get('/', auth, async (req, res) => {
  try {
    const query = {};
    
    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      const Doctor = require('../../domain/entities/Doctor');
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (doctor) {
        query.doctor = doctor._id;
      }
    } else if (req.query.patientId) {
      query.patient = req.query.patientId;
    }
    
    const prescriptions = await Prescription.find(query)
      .populate('patient', 'firstName lastName email')
      .populate('doctor')
      .sort({ dateIssued: -1 });
    
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/prescriptions/:id
 * Get single prescription
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor');
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/prescriptions
 * Create new prescription (doctor only)
 */
router.post('/', auth, authorize('doctor'), async (req, res) => {
  try {
    const prescription = new Prescription(req.body);
    await prescription.save();
    res.status(201).json(prescription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * PUT /api/prescriptions/:id
 * Update prescription
 */
router.put('/:id', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(prescription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * DELETE /api/prescriptions/:id
 * Delete prescription
 */
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await Prescription.findByIdAndDelete(req.params.id);
    res.json({ message: 'Prescription deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
