/**
 * =====================================================
 * DOCTOR SERVICE (Application Layer)
 * =====================================================
 * 
 * Business logic for doctor management.
 * 
 * @layer Application/Services
 * =====================================================
 */

const DoctorRepository = require('../../domain/repositories/DoctorRepository');
const UserRepository = require('../../domain/repositories/UserRepository');

class DoctorService {
  /**
   * Get all doctors
   */
  async getAllDoctors(specialty = null) {
    const filters = { isAvailable: true };
    if (specialty) {
      filters.specialty = specialty;
    }
    return await DoctorRepository.findAll(filters);
  }

  /**
   * Get doctor by ID
   */
  async getDoctorById(id) {
    return await DoctorRepository.findById(id);
  }

  /**
   * Create doctor profile
   */
  async createDoctor(doctorData) {
    // Verify user exists
    const user = await UserRepository.findById(doctorData.user);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if doctor profile exists
    const existingDoctor = await DoctorRepository.findByUserId(doctorData.user);
    if (existingDoctor) {
      throw new Error('Doctor profile already exists');
    }

    return await DoctorRepository.create(doctorData);
  }

  /**
   * Update doctor
   */
  async updateDoctor(id, doctorData) {
    return await DoctorRepository.update(id, doctorData);
  }

  /**
   * Delete (deactivate) doctor
   */
  async deactivateDoctor(id) {
    return await DoctorRepository.deactivate(id);
  }
}

module.exports = new DoctorService();
