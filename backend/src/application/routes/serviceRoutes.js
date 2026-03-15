/**
 * =====================================================
 * SERVICE ROUTES (Presentation Layer)
 * =====================================================
 * 
 * HTTP endpoints for service management.
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
 * Public - list services
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
 * Public - get service
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
 * Admin - create service
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
 * Admin - update service
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
 * Admin - delete service
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
