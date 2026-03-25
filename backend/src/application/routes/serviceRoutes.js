/**
 * =====================================================
 * SERVICE ROUTES
 * =====================================================
 * 
 * HTTP endpoints for medical services management.
 * Handles CRUD operations for clinic services.
 * 
 * @layer Presentation/Routes
 * =====================================================
 */

const express = require('express');
const router = express.Router();
const ServiceService = require('../../application/services/ServiceService');
const { auth, authorize } = require('../../infrastructure/middleware/auth');

/**
 * GET /api/services
 * 
 * Retrieves all active medical services offered by the clinic.
 * 
 * @route GET /api/services
 * @returns {200} Array of active services
 */
router.get('/', async (req, res) => {
  try {
    const services = await ServiceService.getAllServices();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/services/:id
 * 
 * Retrieves a specific service by its ID.
 * 
 * @route GET /api/services/:id
 * @param {string} id - Service's unique ID
 * @returns {200} Service details
 * @returns {404} Service not found
 */
router.get('/:id', async (req, res) => {
  try {
    const service = await ServiceService.getServiceById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/services
 * 
 * Creates a new medical service.
 * Requires admin authentication.
 * 
 * @route POST /api/services
 * @requires Authentication (admin only)
 * @body {string} name - Service name (required, unique)
 * @body {string} description - Service description
 * @body {number} price - Service price in dollars
 * @body {number} duration - Service duration in minutes (default: 30)
 * @returns {201} Service created successfully
 * @returns {400} Validation error
 */
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const service = await ServiceService.createService(req.body);
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * PUT /api/services/:id
 * 
 * Updates an existing service.
 * Requires admin authentication.
 * 
 * @route PUT /api/services/:id
 * @requires Authentication (admin only)
 * @param {string} id - Service's unique ID
 * @body {string} name - Service name (optional)
 * @body {string} description - Description (optional)
 * @body {number} price - Price (optional)
 * @body {number} duration - Duration in minutes (optional)
 * @body {boolean} isActive - Active status (optional)
 * @returns {200} Service updated successfully
 * @returns {400} Validation error
 */
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const service = await ServiceService.updateService(req.params.id, req.body);
    res.json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * DELETE /api/services/:id
 * 
 * Deactivates a service (soft delete).
 * Service will no longer appear in active listings.
 * 
 * @route DELETE /api/services/:id
 * @requires Authentication (admin only)
 * @param {string} id - Service's unique ID
 * @returns {200} Service deactivated
 * @returns {400} Error deactivating service
 */
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await ServiceService.deleteService(req.params.id);
    res.json({ message: 'Service deactivated' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
