/**
 * =====================================================
 * APPOINTMENT SERVICE (Application Layer)
 * =====================================================
 * 
 * Business logic for appointment management.
 * Includes conflict detection.
 * 
 * @layer Application/Services
 * =====================================================
 */

const AppointmentRepository = require('../../domain/repositories/AppointmentRepository');
const DoctorRepository = require('../../domain/repositories/DoctorRepository');

class AppointmentService {
  /**
   * Check for appointment conflict
   */
  async checkConflict(doctorId, date, startTime, endTime) {
    const conflict = await AppointmentRepository.checkConflict(doctorId, date, startTime, endTime);
    return { hasConflict: !!conflict };
  }

  /**
   * Get appointments based on role
   */
  async getAppointments(userId, userRole, filters = {}) {
    let query = {};

    if (userRole === 'patient') {
      query.patient = userId;
    } else if (userRole === 'doctor') {
      const doctor = await DoctorRepository.findByUserId(userId);
      if (doctor) {
        query.doctor = doctor._id;
      }
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.date) {
      const searchDate = new Date(filters.date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: searchDate, $lt: nextDay };
    }

    return await AppointmentRepository.findAll(query);
  }

  /**
   * Get appointment by ID
   */
  async getAppointmentById(id) {
    return await AppointmentRepository.findById(id);
  }

  /**
   * Create appointment
   */
  async createAppointment(appointmentData, patientId) {
    // Check for conflicts
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

    const appointment = await AppointmentRepository.create({
      ...appointmentData,
      patient: patientId,
      status: 'pending'
    });

    return appointment;
  }

  /**
   * Update appointment
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
   * Cancel appointment
   */
  async cancelAppointment(id, userId, userRole) {
    const appointment = await AppointmentRepository.findById(id);
    
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Authorization: patient can cancel own, admin/receptionist can cancel any
    if (userRole === 'patient' && appointment.patient.toString() !== userId.toString()) {
      throw new Error('Not authorized');
    }

    return await AppointmentRepository.cancel(id);
  }
}

module.exports = new AppointmentService();
