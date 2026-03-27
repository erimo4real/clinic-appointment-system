/**
 * =====================================================
 * DOCTOR ROUTES
 * =====================================================
 * 
 * HTTP endpoints for doctor management.
 * Handles CRUD operations for doctor profiles.
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
 * 
 * Retrieves a list of all available doctors.
 * Optionally filter by specialty.
 * 
 * @route GET /api/doctors
 * @query {string} specialty - Filter by medical specialty (optional)
 * @returns {200} Array of doctor profiles
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
 * 
 * Retrieves a specific doctor by their ID.
 * Returns the doctor's profile with user information.
 * 
 * @route GET /api/doctors/:id
 * @param {string} id - Doctor's unique ID
 * @returns {200} Doctor profile
 * @returns {404} Doctor not found
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
 * 
 * Creates a new doctor profile.
 * Requires admin authentication.
 * 
 * @route POST /api/doctors
 * @requires Authentication (admin only)
 * @body {string} user - User ID associated with the doctor
 * @body {string} specialty - Medical specialty
 * @body {string} qualification - Medical degrees/qualifications
 * @body {number} experience - Years of experience
 * @body {string} bio - Doctor's biography (optional)
 * @body {number} consultationFee - Consultation fee
 * @returns {201} Doctor created successfully
 * @returns {400} Validation error or doctor already exists
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
 * 
 * Updates an existing doctor profile.
 * Accessible by admin or the doctor themselves.
 * 
 * @route PUT /api/doctors/:id
 * @requires Authentication (admin or doctor)
 * @param {string} id - Doctor's unique ID
 * @body {string} specialty - Medical specialty (optional)
 * @body {string} qualification - Medical degrees (optional)
 * @body {number} experience - Years of experience (optional)
 * @body {string} bio - Biography (optional)
 * @body {number} consultationFee - Consultation fee (optional)
 * @body {boolean} isAvailable - Availability status (optional)
 * @returns {200} Doctor updated successfully
 * @returns {400} Validation error
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
 * 
 * Deactivates a doctor profile (soft delete).
 * Doctor can no longer receive appointments.
 * 
 * @route DELETE /api/doctors/:id
 * @requires Authentication (admin only)
 * @param {string} id - Doctor's unique ID
 * @returns {200} Doctor deactivated
 * @returns {400} Error deactivating doctor
 */
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await DoctorService.deactivateDoctor(req.params.id);
    res.json({ message: 'Doctor deactivated' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * GET /api/doctors/:id/available-slots
 * 
 * Retrieves available appointment slots for a doctor on a specific date.
 * 
 * @route GET /api/doctors/:id/available-slots
 * @param {string} id - Doctor's unique ID
 * @query {string} date - Date in YYYY-MM-DD format
 * @returns {200} Array of available time slots
 */
router.get('/:id/available-slots', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: 'Date parameter is required' });
    }
    
    const slots = await DoctorService.getAvailableSlots(id, date);
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
