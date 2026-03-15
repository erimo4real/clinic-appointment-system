/**
 * =====================================================
 * DOCTOR REPOSITORY
 * =====================================================
 * 
 * Data access layer for Doctor entity.
 * 
 * @layer Infrastructure/Repositories
 * =====================================================
 */

const Doctor = require('../entities/Doctor');

class DoctorRepository {
  async create(doctorData) {
    const doctor = new Doctor(doctorData);
    return await doctor.save();
  }

  async findById(id) {
    return await Doctor.findById(id).populate('user', 'firstName lastName email phone');
  }

  async findByUserId(userId) {
    return await Doctor.findOne({ user: userId }).populate('user', 'firstName lastName email phone');
  }

  async findAll(filters = {}) {
    return await Doctor.find(filters).populate('user', 'firstName lastName email phone');
  }

  async findAvailable() {
    return await Doctor.find({ isAvailable: true }).populate('user', 'firstName lastName email phone');
  }

  async findBySpecialty(specialty) {
    return await Doctor.find({ specialty, isAvailable: true }).populate('user', 'firstName lastName email phone');
  }

  async update(id, doctorData) {
    return await Doctor.findByIdAndUpdate(id, doctorData, { new: true });
  }

  async delete(id) {
    return await Doctor.findByIdAndDelete(id);
  }

  async deactivate(id) {
    return await Doctor.findByIdAndUpdate(id, { isAvailable: false }, { new: true });
  }
}

module.exports = new DoctorRepository();
