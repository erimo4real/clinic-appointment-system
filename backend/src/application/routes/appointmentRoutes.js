/**
 * =====================================================
 * APPOINTMENT ROUTES
 * =====================================================
 * 
 * HTTP endpoints for appointment scheduling and management.
 * Handles appointment creation, updates, cancellation,
 * and conflict detection for time slots.
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
 * 
 * Checks if a specific time slot is available for booking.
 * Used by the frontend to show available slots.
 * 
 * @route POST /api/appointments/check-conflict
 * @body {string} doctorId - Doctor's ID
 * @body {string} date - Appointment date (ISO format)
 * @body {string} startTime - Start time (HH:MM format)
 * @body {string} endTime - End time (HH:MM format)
 * @returns {200} { hasConflict: boolean }
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
 * 
 * Retrieves appointments for the authenticated user.
 * Patients see their own appointments.
 * Doctors see appointments assigned to them.
 * 
 * @route GET /api/appointments
 * @requires Authentication
 * @query {string} status - Filter by status (optional)
 * @query {string} date - Filter by date (optional)
 * @returns {200} Array of appointments
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
 * GET /api/appointments/doctor/:doctorId
 * 
 * Retrieves all appointments for a specific doctor.
 * Requires authentication.
 * 
 * @route GET /api/appointments/doctor/:doctorId
 * @requires Authentication
 * @param {string} doctorId - Doctor's unique ID
 * @query {string} status - Filter by status (optional)
 * @query {string} date - Filter by date (optional)
 * @returns {200} Array of doctor's appointments
 */
router.get('/doctor/:doctorId', auth, async (req, res) => {
  try {
    const { status, date } = req.query;
    const appointments = await AppointmentService.getAppointments(
      req.params.doctorId,
      'doctor',
      { status, date }
    );
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/appointments/:id
 * 
 * Retrieves a specific appointment by ID.
 * Requires authentication.
 * 
 * @route GET /api/appointments/:id
 * @requires Authentication
 * @param {string} id - Appointment's unique ID
 * @returns {200} Appointment details
 * @returns {404} Appointment not found
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
 * 
 * Creates a new appointment.
 * Checks for time slot conflicts before booking.
 * 
 * @route POST /api/appointments
 * @requires Authentication
 * @body {string} doctor - Doctor's ID
 * @body {string} service - Service ID
 * @body {string} date - Appointment date (ISO format)
 * @body {string} startTime - Start time (HH:MM format)
 * @body {string} endTime - End time (HH:MM format)
 * @body {string} notes - Additional notes (optional)
 * @returns {201} Appointment created successfully
 * @returns {400} Time slot conflict or validation error
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
 * 
 * Updates an existing appointment.
 * Can modify date, time, or notes.
 * 
 * @route PUT /api/appointments/:id
 * @requires Authentication
 * @param {string} id - Appointment's unique ID
 * @body {string} date - New appointment date (optional)
 * @body {string} startTime - New start time (optional)
 * @body {string} endTime - New end time (optional)
 * @body {string} notes - Updated notes (optional)
 * @returns {200} Appointment updated successfully
 * @returns {400} Time slot conflict or validation error
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
 * 
 * Cancels an appointment.
 * Patients can cancel their own appointments.
 * Admins can cancel any appointment.
 * 
 * @route DELETE /api/appointments/:id
 * @requires Authentication
 * @param {string} id - Appointment's unique ID
 * @returns {200} Appointment cancelled
 * @returns {400} Cannot cancel (e.g., already completed)
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
