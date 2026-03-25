/**
 * =====================================================
 * SERVICE REPOSITORY
 * =====================================================
 * 
 * Data access layer for Service entity.
 * Handles database operations for medical services.
 * 
 * @layer Infrastructure/Repositories
 * =====================================================
 */

const Service = require('../entities/Service');

class ServiceRepository {
  /**
   * Creates a new service.
   */
  async create(serviceData) {
    const service = new Service(serviceData);
    return await service.save();
  }

  /**
   * Finds a service by ID.
   */
  async findById(id) {
    return await Service.findById(id);
  }

  /**
   * Finds all services with optional filters.
   */
  async findAll(filters = {}) {
    return await Service.find(filters);
  }

  /**
   * Finds all active services sorted by name.
   */
  async findActive() {
    return await Service.find({ isActive: true }).sort({ name: 1 });
  }

  /**
   * Finds services within a price range.
   */
  async findByPriceRange(min, max) {
    return await Service.find({ 
      price: { $gte: min, $lte: max },
      isActive: true 
    });
  }

  /**
   * Updates a service by ID.
   */
  async update(id, serviceData) {
    return await Service.findByIdAndUpdate(id, serviceData, { new: true });
  }

  /**
   * Permanently deletes a service.
   */
  async delete(id) {
    return await Service.findByIdAndDelete(id);
  }

  /**
   * Deactivates a service (soft delete).
   */
  async deactivate(id) {
    return await Service.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }
}

module.exports = new ServiceRepository();
