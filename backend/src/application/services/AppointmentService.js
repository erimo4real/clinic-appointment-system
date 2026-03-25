/**
 * =====================================================
 * APPOINTMENT SERVICE
 * =====================================================
 * 
 * Business logic layer for appointment management.
 * Handles appointment creation, updates, cancellation,
 * and conflict detection to prevent double-booking.
 * 
 * @layer Application/Services
 * =====================================================
 */

const AppointmentRepository = require('../../domain/repositories/AppointmentRepository');
const DoctorRepository = require('../../domain/repositories/DoctorRepository');

class AppointmentService {
  /**
   * Checks if a time slot has a conflict with existing appointments.
   * Used to show available slots in the booking interface.
   * 
   * @param {string} doctorId - Doctor's database ID
   * @param {string} date - Appointment date (ISO format)
   * @param {string} startTime - Start time (HH:MM format)
   * @param {string} endTime - End time (HH:MM format)
   * @returns {Object} { hasConflict: boolean }
   */
  async checkConflict(doctorId, date, startTime, endTime) {
    const conflict = await AppointmentRepository.checkConflict(doctorId, date, startTime, endTime);
    return { hasConflict: !!conflict };
  }

  /**
   * Retrieves appointments based on user role.
   * Patients see their own appointments.
   * Doctors see appointments assigned to them.
   * 
   * @param {string} userId - User's database ID
   * @param {string} userRole - User's role ('patient', 'doctor', etc.)
   * @param {Object} filters - Optional filters
   * @param {string} filters.status - Filter by status (optional)
   * @param {string} filters.date - Filter by date (optional)
   * @returns {Array} Array of appointment objects
   */
  async getAppointments(userId, userRole, filters = {}) {
    let query = {};

    // Filter appointments based on user role
    if (userRole === 'patient') {
      // Patients see only their own appointments
      query.patient = userId;
    } else if (userRole === 'doctor') {
      // Doctors see appointments assigned to them
      const doctor = await DoctorRepository.findByUserId(userId);
      if (doctor) {
        query.doctor = doctor._id;
      }
    }

    // Apply status filter if provided
    if (filters.status) {
      query.status = filters.status;
    }

    // Apply date filter if provided
    if (filters.date) {
      const searchDate = new Date(filters.date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: searchDate, $lt: nextDay };
    }

    return await AppointmentRepository.findAll(query);
  }

  /**
   * Retrieves a specific appointment by ID.
   * 
   * @param {string} id - Appointment's database ID
   * @returns {Object|null} Appointment object or null
   */
  async getAppointmentById(id) {
    return await AppointmentRepository.findById(id);
  }

  /**
   * Creates a new appointment.
   * Checks for conflicts and validates doctor exists.
   * 
   * @param {Object} appointmentData - Appointment data
   * @param {string} appointmentData.doctor - Doctor's ID
   * @param {string} appointmentData.service - Service ID
   * @param {string} appointmentData.date - Appointment date
   * @param {string} appointmentData.startTime - Start time
   * @param {string} appointmentData.endTime - End time
   * @param {string} appointmentData.notes - Notes (optional)
   * @param {string} patientId - Patient's database ID
   * @returns {Object} Created appointment
   * @throws {Error} If time slot conflicts or doctor not found
   */
  async createAppointment(appointmentData, patientId) {
    // Check for time slot conflicts
    const conflict = await AppointmentRepository.checkConflict(
      appointmentData.doctor,
      appointmentData.date,
      appointmentData.startTime,
      appointmentData.endTime
    );

    if (conflict) {
      throw new Error('Time slot conflict with existing appointment');
    }

    // Verify doctor exists
    const doctor = await DoctorRepository.findById(appointmentData.doctor);
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    // Create appointment with patient ID and pending status
    const appointment = await AppointmentRepository.create({
      ...appointmentData,
      patient: patientId,
      status: 'pending'
    });

    return appointment;
  }

  /**
   * Updates an existing appointment.
   * Re-checks for conflicts if time is changed.
   * 
   * @param {string} id - Appointment's database ID
   * @param {Object} appointmentData - Updated data
   * @param {string} userRole - User's role for authorization
   * @returns {Object} Updated appointment
   * @throws {Error} If appointment not found or conflict exists
   */
  async updateAppointment(id, appointmentData, userRole) {
    const existing = await AppointmentRepository.findById(id);
    if (!existing) {
      throw new Error('Appointment not found');
    }

    // Check for conflicts if time is being changed
    if (appointmentData.date || appointmentData.startTime || appointmentData.endTime) {
      const conflict = await AppointmentRepository.checkConflict(
        existing.doctor,
        appointmentData.date || existing.date,
        appointmentData.startTime || existing.startTime,
        appointmentData.endTime || existing.endTime,
        id
      );

      if (conflict) {
        throw new Error('Time slot conflict');
      }
    }

    return await AppointmentRepository.update(id, appointmentData);
  }

  /**
   * Cancels an appointment.
   * Patients can cancel their own appointments.
   * Admins can cancel any appointment.
   * 
   * @param {string} id - Appointment's database ID
   * @param {string} userId - User's database ID
   * @param {string} userRole - User's role
   * @returns {Object} Cancelled appointment
   * @throws {Error} If not authorized or appointment not found
   */
  async cancelAppointment(id, userId, userRole) {
    const appointment = await AppointmentRepository.findById(id);
    
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Authorization: patients can cancel own, admins can cancel any
    if (userRole === 'patient' && appointment.patient.toString() !== userId.toString()) {
      throw new Error('Not authorized');
    }

    return await AppointmentRepository.cancel(id);
  }
}

module.exports = new AppointmentService();
