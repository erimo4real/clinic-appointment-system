/**
 * =====================================================
 * SERVICE SERVICE (Application Layer)
 * =====================================================
 * 
 * Business logic for clinic services.
 * 
 * @layer Application/Services
 * =====================================================
 */

const ServiceRepository = require('../../domain/repositories/ServiceRepository');

class ServiceService {
  async getAllServices() {
    return await ServiceRepository.findActive();
  }

  async getServiceById(id) {
    return await ServiceRepository.findById(id);
  }

  async createService(serviceData) {
    return await ServiceRepository.create(serviceData);
  }

  async updateService(id, serviceData) {
    return await ServiceRepository.update(id, serviceData);
  }

  async deleteService(id) {
    return await ServiceRepository.deactivate(id);
  }
}

module.exports = new ServiceService();
