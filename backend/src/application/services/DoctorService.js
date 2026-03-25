/**
 * =====================================================
 * DOCTOR SERVICE
 * =====================================================
 * 
 * Business logic layer for doctor management.
 * Handles creation, updates, and retrieval of doctor profiles.
 * 
 * @layer Application/Services
 * =====================================================
 */

const DoctorRepository = require('../../domain/repositories/DoctorRepository');
const UserRepository = require('../../domain/repositories/UserRepository');

class DoctorService {
  /**
   * Retrieves all available doctors.
   * Optionally filtered by medical specialty.
   * 
   * @param {string|null} specialty - Filter by specialty (optional)
   * @returns {Array} Array of doctor profiles
   */
  async getAllDoctors(specialty = null) {
    const filters = { isAvailable: true };
    if (specialty) {
      filters.specialty = specialty;
    }
    return await DoctorRepository.findAll(filters);
  }

  /**
   * Retrieves a specific doctor by their ID.
   * 
   * @param {string} id - Doctor's database ID
   * @returns {Object|null} Doctor profile or null
   */
  async getDoctorById(id) {
    return await DoctorRepository.findById(id);
  }

  /**
   * Creates a new doctor profile.
   * Links the profile to an existing user account.
   * 
   * @param {Object} doctorData - Doctor profile data
   * @param {string} doctorData.user - Associated user ID
   * @param {string} doctorData.specialty - Medical specialty
   * @param {string} doctorData.qualification - Medical qualifications
   * @param {number} doctorData.experience - Years of experience
   * @param {string} doctorData.bio - Biography (optional)
   * @param {number} doctorData.consultationFee - Consultation fee
   * @returns {Object} Created doctor profile
   * @throws {Error} If user not found or profile already exists
   */
  async createDoctor(doctorData) {
    // Verify associated user exists
    const user = await UserRepository.findById(doctorData.user);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if doctor profile already exists for this user
    const existingDoctor = await DoctorRepository.findByUserId(doctorData.user);
    if (existingDoctor) {
      throw new Error('Doctor profile already exists');
    }

    return await DoctorRepository.create(doctorData);
  }

  /**
   * Updates an existing doctor profile.
   * 
   * @param {string} id - Doctor's database ID
   * @param {Object} doctorData - Updated profile data
   * @returns {Object} Updated doctor profile
   */
  async updateDoctor(id, doctorData) {
    return await DoctorRepository.update(id, doctorData);
  }

  /**
   * Deactivates a doctor profile (soft delete).
   * Doctor will no longer appear in available listings.
   * 
   * @param {string} id - Doctor's database ID
   * @returns {Object} Updated doctor profile with isAvailable: false
   */
  async deactivateDoctor(id) {
    return await DoctorRepository.deactivate(id);
  }
}

module.exports = new DoctorService();
