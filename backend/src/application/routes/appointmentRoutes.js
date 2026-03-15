/**
 * =====================================================
 * APPOINTMENT ROUTES (Presentation Layer)
 * =====================================================
 * 
 * HTTP endpoints for appointment management.
 * Includes conflict detection.
 * 
 * @layer Presentation/Routes
 * =====================================================
 */

const express = require('express');
const router = express.Router();
const AppointmentService = require('../../application/services/AppointmentService');
const { auth, authorize } = require('../../infrastructure/middleware/auth');

/**
 * POST /api/appointments/check-conflict
 * Public - check if time slot is available
 */
router.post('/check-conflict', async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime } = req.body;
    const result = await AppointmentService.checkConflict(doctorId, date, startTime, endTime);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/appointments
 * Private - list appointments based on role
 */
router.get('/', auth, async (req, res) => {
  try {
    const { status, date } = req.query;
    const appointments = await AppointmentService.getAppointments(
      req.user._id,
      req.user.role,
      { status, date }
    );
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/appointments/:id
 * Private - get appointment by ID
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await AppointmentService.getAppointmentById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/appointments
 * Private - create appointment
 */
router.post('/', auth, async (req, res) => {
  try {
    const appointment = await AppointmentService.createAppointment(req.body, req.user._id);
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * PUT /api/appointments/:id
 * Private - update appointment
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const appointment = await AppointmentService.updateAppointment(
      req.params.id,
      req.body,
      req.user.role
    );
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * DELETE /api/appointments/:id
 * Private - cancel appointment
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    await AppointmentService.cancelAppointment(req.params.id, req.user._id, req.user.role);
    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
