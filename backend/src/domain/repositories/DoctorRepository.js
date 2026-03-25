/**
 * =====================================================
 * DOCTOR REPOSITORY
 * =====================================================
 * 
 * Data access layer for Doctor entity.
 * Handles database operations for doctor profiles.
 * 
 * @layer Infrastructure/Repositories
 * =====================================================
 */

const Doctor = require('../entities/Doctor');

class DoctorRepository {
  /**
   * Creates a new doctor profile.
   */
  async create(doctorData) {
    const doctor = new Doctor(doctorData);
    return await doctor.save();
  }

  /**
   * Finds a doctor by ID with user information.
   */
  async findById(id) {
    return await Doctor.findById(id).populate('user', 'firstName lastName email phone');
  }

  /**
   * Finds a doctor by associated user ID.
   */
  async findByUserId(userId) {
    return await Doctor.findOne({ user: userId }).populate('user', 'firstName lastName email phone');
  }

  /**
   * Finds all doctors with optional filters.
   */
  async findAll(filters = {}) {
    return await Doctor.find(filters).populate('user', 'firstName lastName email phone');
  }

  /**
   * Finds all available doctors.
   */
  async findAvailable() {
    return await Doctor.find({ isAvailable: true }).populate('user', 'firstName lastName email phone');
  }

  /**
   * Finds doctors by specialty.
   */
  async findBySpecialty(specialty) {
    return await Doctor.find({ specialty, isAvailable: true }).populate('user', 'firstName lastName email phone');
  }

  /**
   * Updates a doctor by ID.
   */
  async update(id, doctorData) {
    return await Doctor.findByIdAndUpdate(id, doctorData, { new: true });
  }

  /**
   * Permanently deletes a doctor.
   */
  async delete(id) {
    return await Doctor.findByIdAndDelete(id);
  }

  /**
   * Deactivates a doctor (soft delete).
   */
  async deactivate(id) {
    return await Doctor.findByIdAndUpdate(id, { isAvailable: false }, { new: true });
  }
}

module.exports = new DoctorRepository();
