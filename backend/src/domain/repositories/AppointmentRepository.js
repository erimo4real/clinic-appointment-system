/**
 * =====================================================
 * APPOINTMENT REPOSITORY
 * =====================================================
 * 
 * Data access layer for Appointment entity.
 * Includes conflict detection logic.
 * 
 * @layer Infrastructure/Repositories
 * =====================================================
 */

const Appointment = require('../entities/Appointment');

class AppointmentRepository {
  /**
   * Check for appointment conflicts
   * Prevents double-booking
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

  async create(appointmentData) {
    const appointment = new Appointment(appointmentData);
    return await appointment.save();
  }

  async findById(id) {
    return await Appointment.findById(id)
      .populate('patient', 'firstName lastName email phone')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } })
      .populate('service', 'name price duration');
  }

  async findAll(filters = {}) {
    return await Appointment.find(filters)
      .populate('patient', 'firstName lastName email phone')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } })
      .populate('service', 'name price duration')
      .sort({ date: -1, startTime: -1 });
  }

  async findByPatient(patientId) {
    return await Appointment.find({ patient: patientId })
      .populate('doctor')
      .populate('service')
      .sort({ date: -1, startTime: -1 });
  }

  async findByDoctor(doctorId) {
    return await Appointment.find({ doctor: doctorId })
      .populate('patient', 'firstName lastName email phone')
      .populate('service')
      .sort({ date: -1, startTime: -1 });
  }

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

  async update(id, appointmentData) {
    return await Appointment.findByIdAndUpdate(id, appointmentData, { new: true });
  }

  async cancel(id) {
    return await Appointment.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true });
  }

  async delete(id) {
    return await Appointment.findByIdAndDelete(id);
  }
}

module.exports = new AppointmentRepository();
