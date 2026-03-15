/**
 * =====================================================
 * SERVICE REPOSITORY
 * =====================================================
 * 
 * Data access layer for Service entity.
 * 
 * @layer Infrastructure/Repositories
 * =====================================================
 */

const Service = require('../entities/Service');

class ServiceRepository {
  async create(serviceData) {
    const service = new Service(serviceData);
    return await service.save();
  }

  async findById(id) {
    return await Service.findById(id);
  }

  async findAll(filters = {}) {
    return await Service.find(filters);
  }

  async findActive() {
    return await Service.find({ isActive: true }).sort({ name: 1 });
  }

  async findByPriceRange(min, max) {
    return await Service.find({ 
      price: { $gte: min, $lte: max },
      isActive: true 
    });
  }

  async update(id, serviceData) {
    return await Service.findByIdAndUpdate(id, serviceData, { new: true });
  }

  async delete(id) {
    return await Service.findByIdAndDelete(id);
  }

  async deactivate(id) {
    return await Service.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }
}

module.exports = new ServiceRepository();
