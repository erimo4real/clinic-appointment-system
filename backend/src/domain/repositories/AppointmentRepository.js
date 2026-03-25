/**
 * =====================================================
 * APPOINTMENT REPOSITORY
 * =====================================================
 * 
 * Data access layer for Appointment entity.
 * Handles database operations for appointments including
 * conflict detection for preventing double-booking.
 * 
 * @layer Infrastructure/Repositories
 * =====================================================
 */

const Appointment = require('../entities/Appointment');

class AppointmentRepository {
  /**
   * Checks for conflicting appointments.
   * Used to prevent double-booking of time slots.
   * 
   * @param {string} doctorId - Doctor's database ID
   * @param {Date} date - Appointment date
   * @param {string} startTime - Start time (HH:MM)
   * @param {string} endTime - End time (HH:MM)
   * @param {string|null} excludeId - Appointment ID to exclude (for updates)
   * @returns {Object|null} Conflicting appointment or null
   */
  async checkConflict(doctorId, date, startTime, endTime, excludeId = null) {
    const query = {
      doctor: doctorId,
      date: new Date(date),
      status: { $nin: ['cancelled', 'no_show'] }
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    query.$or = [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ];

    return await Appointment.findOne(query);
  }

  /**
   * Creates a new appointment.
   */
  async create(appointmentData) {
    const appointment = new Appointment(appointmentData);
    return await appointment.save();
  }

  /**
   * Finds an appointment by ID with populated references.
   */
  async findById(id) {
    return await Appointment.findById(id)
      .populate('patient', 'firstName lastName email phone')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } })
      .populate('service', 'name price duration');
  }

  /**
   * Finds all appointments with optional filters.
   */
  async findAll(filters = {}) {
    return await Appointment.find(filters)
      .populate('patient', 'firstName lastName email phone')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } })
      .populate('service', 'name price duration')
      .sort({ date: -1, startTime: -1 });
  }

  /**
   * Finds appointments for a specific patient.
   */
  async findByPatient(patientId) {
    return await Appointment.find({ patient: patientId })
      .populate('doctor')
      .populate('service')
      .sort({ date: -1, startTime: -1 });
  }

  /**
   * Finds appointments for a specific doctor.
   */
  async findByDoctor(doctorId) {
    return await Appointment.find({ doctor: doctorId })
      .populate('patient', 'firstName lastName email phone')
      .populate('service')
      .sort({ date: -1, startTime: -1 });
  }

  /**
   * Finds appointments for a specific date.
   */
  async findByDate(date) {
    const searchDate = new Date(date);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    return await Appointment.find({ 
      date: { $gte: searchDate, $lt: nextDay } 
    })
      .populate('patient', 'firstName lastName email phone')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } })
      .populate('service')
      .sort({ startTime: 1 });
  }

  /**
   * Finds today's appointments for a doctor.
   */
  async findTodayForDoctor(doctorId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return await Appointment.find({
      doctor: doctorId,
      date: { $gte: today, $lt: tomorrow },
      status: { $nin: ['cancelled', 'no_show'] }
    })
      .populate('patient', 'firstName lastName email phone')
      .populate('service')
      .sort({ startTime: 1 });
  }

  /**
   * Updates an appointment by ID.
   */
  async update(id, appointmentData) {
    return await Appointment.findByIdAndUpdate(id, appointmentData, { new: true });
  }

  /**
   * Cancels an appointment by setting status to 'cancelled'.
   */
  async cancel(id) {
    return await Appointment.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true });
  }

  /**
   * Permanently deletes an appointment.
   */
  async delete(id) {
    return await Appointment.findByIdAndDelete(id);
  }
}

module.exports = new AppointmentRepository();
