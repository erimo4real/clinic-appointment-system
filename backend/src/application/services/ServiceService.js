/**
 * =====================================================
 * SERVICE SERVICE
 * =====================================================
 * 
 * Business logic layer for medical services management.
 * Handles creation, updates, and retrieval of clinic services.
 * 
 * @layer Application/Services
 * =====================================================
 */

const ServiceRepository = require('../../domain/repositories/ServiceRepository');

class ServiceService {
  /**
   * Retrieves all active medical services.
   * Services are sorted alphabetically by name.
   * 
   * @returns {Array} Array of active service objects
   */
  async getAllServices() {
    return await ServiceRepository.findActive();
  }

  /**
   * Retrieves a specific service by its ID.
   * 
   * @param {string} id - Service's database ID
   * @returns {Object|null} Service object or null
   */
  async getServiceById(id) {
    return await ServiceRepository.findById(id);
  }

  /**
   * Creates a new medical service.
   * 
   * @param {Object} serviceData - Service data
   * @param {string} serviceData.name - Service name (unique)
   * @param {string} serviceData.description - Service description
   * @param {number} serviceData.price - Service price in dollars
   * @param {number} serviceData.duration - Duration in minutes (default: 30)
   * @param {boolean} serviceData.isActive - Active status (default: true)
   * @returns {Object} Created service object
   */
  async createService(serviceData) {
    return await ServiceRepository.create(serviceData);
  }

  /**
   * Updates an existing service.
   * 
   * @param {string} id - Service's database ID
   * @param {Object} serviceData - Updated service data
   * @returns {Object} Updated service object
   */
  async updateService(id, serviceData) {
    return await ServiceRepository.update(id, serviceData);
  }

  /**
   * Deactivates a service (soft delete).
   * Service will no longer appear in active listings.
   * 
   * @param {string} id - Service's database ID
   * @returns {Object} Updated service with isActive: false
   */
  async deleteService(id) {
    return await ServiceRepository.deactivate(id);
  }
}

module.exports = new ServiceService();
