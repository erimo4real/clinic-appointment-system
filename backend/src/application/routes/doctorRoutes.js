/**
 * =====================================================
 * DOCTOR ROUTES (Presentation Layer)
 * =====================================================
 * 
 * HTTP endpoints for doctor management.
 * 
 * @layer Presentation/Routes
 * =====================================================
 */

const express = require('express');
const router = express.Router();
const DoctorService = require('../../application/services/DoctorService');
const { auth, authorize } = require('../../infrastructure/middleware/auth');

/**
 * GET /api/doctors
 * Public - list all doctors
 */
router.get('/', async (req, res) => {
  try {
    const { specialty } = req.query;
    const doctors = await DoctorService.getAllDoctors(specialty);
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/doctors/:id
 * Public - get doctor by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const doctor = await DoctorService.getDoctorById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/doctors
 * Admin only - create doctor
 */
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const doctor = await DoctorService.createDoctor(req.body);
    res.status(201).json(doctor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * PUT /api/doctors/:id
 * Admin/Doctor - update doctor
 */
router.put('/:id', auth, authorize('admin', 'doctor'), async (req, res) => {
  try {
    const doctor = await DoctorService.updateDoctor(req.params.id, req.body);
    res.json(doctor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * DELETE /api/doctors/:id
 * Admin only - deactivate doctor
 */
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await DoctorService.deactivateDoctor(req.params.id);
    res.json({ message: 'Doctor deactivated' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
